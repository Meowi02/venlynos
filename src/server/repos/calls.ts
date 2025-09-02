import 'server-only';
import { db } from '../db';
import { decodeCursor, createPaginatedResponse } from '@/lib/pagination';
import type { PaginatedResult } from '@/lib/pagination';
import type { Call, CallDisposition, Intent, AgentType } from '@/types/core';

export interface CallsFilters {
  workspaceId: string;
  from?: string;
  to?: string;
  intent?: Intent[];
  disposition?: CallDisposition[];
  agentType?: AgentType;
  cursor?: string;
  limit?: number;
}

export async function getCalls(filters: CallsFilters): Promise<PaginatedResult<Call>> {
  const { workspaceId, from, to, intent, disposition, agentType, cursor, limit = 20 } = filters;

  let whereConditions: any = {
    workspaceId,
  };

  // Date range filters
  if (from || to) {
    whereConditions.startedAt = {};
    if (from) whereConditions.startedAt.gte = new Date(from);
    if (to) whereConditions.startedAt.lte = new Date(to);
  }

  // Intent filter
  if (intent?.length) {
    whereConditions.intent = { in: intent };
  }

  // Disposition filter
  if (disposition?.length) {
    whereConditions.disposition = { in: disposition };
  }

  // Agent type filter
  if (agentType) {
    whereConditions.agentType = agentType;
  }

  // Cursor pagination
  if (cursor) {
    const decodedCursor = decodeCursor(cursor);
    whereConditions.startedAt = {
      ...whereConditions.startedAt,
      lt: new Date(decodedCursor),
    };
  }

  const calls = await db.call.findMany({
    where: whereConditions,
    include: {
      contact: {
        select: { id: true, name: true, phones: true },
      },
      job: {
        select: { id: true, title: true, status: true },
      },
    },
    orderBy: { startedAt: 'desc' },
    take: limit + 1, // Get one extra to check if there are more
  });

  const hasMore = calls.length > limit;
  const data = hasMore ? calls.slice(0, limit) : calls;

  return createPaginatedResponse(
    data as Call[],
    limit,
    (item) => item.startedAt
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