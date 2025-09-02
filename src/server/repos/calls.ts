import 'server-only';
import { db } from '../db';
import { decodeCursor, createPaginatedResponse } from '@/lib/pagination';
import type { PaginatedResult } from '@/lib/pagination';
import type { 
  Call, 
  CallDisposition, 
  Intent, 
  AgentType, 
  QueueStatus,
  CallSource,
  LeadSource 
} from '@/types/core';

export interface CallsFilters {
  workspaceId: string;
  from?: string;
  to?: string;
  intent?: Intent[];
  disposition?: CallDisposition[];
  agentType?: AgentType[];
  
  // Value range
  valueMin?: number;
  valueMax?: number;
  
  // Boolean flags
  hasJob?: boolean;
  hasRecording?: boolean;
  hasTranscript?: boolean;
  dnc?: boolean;
  
  // Tags
  tag?: string[];
  
  // Source filters
  numberId?: string;
  source?: CallSource[];
  leadSource?: LeadSource[];
  
  // Queue and outcome
  queueStatus?: QueueStatus[];
  outcomeRequired?: boolean;
  
  // Search
  search?: string;
  
  // Special modes
  triageMode?: boolean;
  
  // Pagination
  cursor?: string;
  limit?: number;
}

export async function getCalls(filters: CallsFilters): Promise<PaginatedResult<Call>> {
  const { 
    workspaceId, 
    from, 
    to, 
    intent, 
    disposition, 
    agentType,
    valueMin,
    valueMax,
    hasJob,
    hasRecording,
    hasTranscript,
    dnc,
    tag,
    numberId,
    source,
    leadSource,
    queueStatus,
    outcomeRequired,
    search,
    triageMode,
    cursor, 
    limit = 20 
  } = filters;

  let whereConditions: any = {
    workspaceId,
  };

  // Date range filters
  if (from || to) {
    whereConditions.startedAt = {};
    if (from) whereConditions.startedAt.gte = new Date(from);
    if (to) whereConditions.startedAt.lte = new Date(to);
  }

  // Basic filters
  if (intent?.length) {
    whereConditions.intent = { in: intent };
  }

  if (disposition?.length) {
    whereConditions.disposition = { in: disposition };
  }

  if (agentType?.length) {
    whereConditions.agentType = { in: agentType };
  }

  // Value range filters
  if (valueMin !== undefined || valueMax !== undefined) {
    whereConditions.valueEstCents = {};
    if (valueMin !== undefined) whereConditions.valueEstCents.gte = valueMin * 100;
    if (valueMax !== undefined) whereConditions.valueEstCents.lte = valueMax * 100;
  }

  // Boolean flags
  if (hasJob === true) {
    whereConditions.jobId = { not: null };
  } else if (hasJob === false) {
    whereConditions.jobId = null;
  }

  if (hasRecording === true) {
    whereConditions.recordingUrl = { not: null };
  } else if (hasRecording === false) {
    whereConditions.recordingUrl = null;
  }

  if (hasTranscript === true) {
    whereConditions.transcript = { not: null };
  } else if (hasTranscript === false) {
    whereConditions.transcript = null;
  }

  if (dnc === true) {
    whereConditions.doNotContact = true;
  } else if (dnc === false) {
    whereConditions.doNotContact = false;
  }

  // Tags filter
  if (tag?.length) {
    whereConditions.tags = {
      hasSome: tag,
    };
  }

  // Source filters  
  if (numberId) {
    whereConditions.toE164 = numberId;
  }

  if (source?.length) {
    whereConditions.source = { in: source };
  }

  if (leadSource?.length) {
    whereConditions.leadSource = { in: leadSource };
  }

  // Queue and outcome filters
  if (queueStatus?.length) {
    whereConditions.queueStatus = { in: queueStatus };
  }

  if (outcomeRequired === true) {
    whereConditions.outcomeRequired = true;
  } else if (outcomeRequired === false) {
    whereConditions.outcomeRequired = false;
  }

  // Search across phone numbers, contact names, and notes
  if (search) {
    whereConditions.OR = [
      { fromE164: { contains: search } },
      { toE164: { contains: search } },
      { contact: { name: { contains: search, mode: 'insensitive' } } },
      { transcript: { path: ['metadata', 'notes'], string_contains: search } },
    ];
  }

  // Triage mode - special sorting and filtering
  let orderBy: any = { startedAt: 'desc' };
  if (triageMode) {
    // In triage mode, prioritize unhandled calls with outcome requirements
    orderBy = [
      { outcomeRequired: 'desc' },
      { queueStatus: 'desc' },
      { emergencyScore: 'desc' },
      { startedAt: 'asc' },
    ];
    
    // Filter to calls that need attention
    whereConditions.OR = whereConditions.OR || [];
    whereConditions.OR.push(
      { outcomeRequired: true, outcomeAt: null },
      { queueStatus: 'triage' },
      { disposition: null }
    );
  }

  // Cursor pagination
  if (cursor) {
    const decodedCursor = decodeCursor(cursor);
    if (!triageMode) {
      whereConditions.startedAt = {
        ...whereConditions.startedAt,
        lt: new Date(decodedCursor),
      };
    } else {
      // For triage mode, use ID-based cursor since we have complex sorting
      whereConditions.id = { lt: decodedCursor };
    }
  }

  const calls = await db.call.findMany({
    where: whereConditions,
    include: {
      contact: {
        select: { id: true, name: true, phones: true, doNotContact: true },
      },
      job: {
        select: { id: true, title: true, status: true },
      },
      followUpTasks: {
        select: { id: true, type: true, status: true, dueAt: true },
        where: { status: 'open' },
        orderBy: { dueAt: 'asc' },
        take: 1,
      },
    },
    orderBy: orderBy,
    take: limit + 1, // Get one extra to check if there are more
  });

  const hasMore = calls.length > limit;
  const data = hasMore ? calls.slice(0, limit) : calls;

  return createPaginatedResponse(
    data as Call[],
    limit,
    triageMode ? (item) => item.id : (item) => item.startedAt
  );
}

export async function getCallById(workspaceId: string, callId: string): Promise<Call | null> {
  const call = await db.call.findFirst({
    where: {
      id: callId,
      workspaceId,
    },
    include: {
      contact: true,
      job: true,
    },
  });

  return call as Call | null;
}

export async function updateCall(
  workspaceId: string, 
  callId: string, 
  data: Partial<Call>
): Promise<Call> {
  const updatedCall = await db.call.update({
    where: {
      id: callId,
      workspaceId,
    },
    data,
    include: {
      contact: true,
      job: true,
    },
  });

  return updatedCall as Call;
}

export async function createCall(data: Omit<Call, 'id' | 'createdAt'>): Promise<Call> {
  const call = await db.call.create({
    data,
    include: {
      contact: true,
      job: true,
    },
  });

  return call as Call;
}

export async function getCallsForAnalytics(
  workspaceId: string, 
  from: Date, 
  to: Date
) {
  return await db.call.findMany({
    where: {
      workspaceId,
      startedAt: {
        gte: from,
        lte: to,
      },
    },
    select: {
      id: true,
      startedAt: true,
      direction: true,
      disposition: true,
      intent: true,
      valueEstCents: true,
      emergencyScore: true,
      spamScore: true,
      agentType: true,
    },
  });
}