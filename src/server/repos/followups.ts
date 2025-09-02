import 'server-only';
import { db } from '../db';
import { decodeCursor, createPaginatedResponse } from '@/lib/pagination';
import type { PaginatedResult } from '@/lib/pagination';
import type { 
  FollowUpTask, 
  FollowUpType, 
  FollowUpStatus, 
  TaskPriority 
} from '@/types/core';

export interface FollowUpFilters {
  workspaceId: string;
  from?: string;
  to?: string;
  status?: FollowUpStatus[];
  type?: FollowUpType[];
  priority?: TaskPriority[];
  assignedTo?: string;
  callId?: string;
  contactId?: string;
  overdue?: boolean;
  cursor?: string;
  limit?: number;
}

export async function getFollowUpTasks(filters: FollowUpFilters): Promise<PaginatedResult<FollowUpTask>> {
  const { 
    workspaceId, 
    from, 
    to, 
    status, 
    type, 
    priority,
    assignedTo,
    callId,
    contactId,
    overdue,
    cursor, 
    limit = 20 
  } = filters;

  let whereConditions: any = {
    workspaceId,
  };

  // Date range filters for due date
  if (from || to) {
    whereConditions.dueAt = {};
    if (from) whereConditions.dueAt.gte = new Date(from);
    if (to) whereConditions.dueAt.lte = new Date(to);
  }

  // Status filter
  if (status?.length) {
    whereConditions.status = { in: status };
  }

  // Type filter
  if (type?.length) {
    whereConditions.type = { in: type };
  }

  // Priority filter
  if (priority?.length) {
    whereConditions.priority = { in: priority };
  }

  // Assignment filter
  if (assignedTo) {
    whereConditions.assignedTo = assignedTo;
  }

  // Related entity filters
  if (callId) {
    whereConditions.callId = callId;
  }

  if (contactId) {
    whereConditions.contactId = contactId;
  }

  // Overdue filter - tasks past due date that are still open
  if (overdue === true) {
    whereConditions.AND = [
      { status: 'open' },
      { dueAt: { lt: new Date() } }
    ];
  } else if (overdue === false) {
    whereConditions.OR = [
      { status: 'done' },
      { dueAt: { gte: new Date() } }
    ];
  }

  // Cursor pagination
  if (cursor) {
    const decodedCursor = decodeCursor(cursor);
    whereConditions.dueAt = {
      ...whereConditions.dueAt,
      lt: new Date(decodedCursor),
    };
  }

  const tasks = await db.followUpTask.findMany({
    where: whereConditions,
    include: {
      call: {
        select: { 
          id: true, 
          startedAt: true, 
          fromE164: true, 
          intent: true, 
          disposition: true 
        },
      },
      contact: {
        select: { 
          id: true, 
          name: true, 
          phones: true,
          doNotContact: true 
        },
      },
    },
    orderBy: [
      { status: 'asc' }, // Open tasks first
      { priority: 'desc' }, // High priority first
      { dueAt: 'asc' }, // Earliest due first
    ],
    take: limit + 1, // Get one extra to check if there are more
  });

  const hasMore = tasks.length > limit;
  const data = hasMore ? tasks.slice(0, limit) : tasks;

  return createPaginatedResponse(
    data as FollowUpTask[],
    limit,
    (item) => item.dueAt
  );
}

export async function getFollowUpTaskById(
  workspaceId: string, 
  taskId: string
): Promise<FollowUpTask | null> {
  const task = await db.followUpTask.findFirst({
    where: {
      id: taskId,
      workspaceId,
    },
    include: {
      call: {
        select: { 
          id: true, 
          startedAt: true, 
          fromE164: true, 
          intent: true, 
          disposition: true,
          recordingUrl: true,
        },
      },
      contact: {
        select: { 
          id: true, 
          name: true, 
          phones: true, 
          email: true,
          doNotContact: true,
          preferredChannel: true,
        },
      },
    },
  });

  return task as FollowUpTask | null;
}

export async function createFollowUpTask(
  data: Omit<FollowUpTask, 'id' | 'createdAt' | 'updatedAt'>
): Promise<FollowUpTask> {
  // Set default status if not provided
  const taskData = {
    ...data,
    status: data.status || 'open' as FollowUpStatus,
    priority: data.priority || 'normal' as TaskPriority,
  };

  const task = await db.followUpTask.create({
    data: taskData,
    include: {
      call: {
        select: { 
          id: true, 
          startedAt: true, 
          fromE164: true, 
          intent: true, 
          disposition: true 
        },
      },
      contact: {
        select: { 
          id: true, 
          name: true, 
          phones: true,
          doNotContact: true 
        },
      },
    },
  });

  return task as FollowUpTask;
}

export async function updateFollowUpTask(
  workspaceId: string, 
  taskId: string, 
  data: Partial<FollowUpTask>
): Promise<FollowUpTask> {
  // First check if task exists
  const existingTask = await db.followUpTask.findFirst({
    where: {
      id: taskId,
      workspaceId,
    },
  });

  if (!existingTask) {
    throw new Error('Follow-up task not found');
  }

  const updatedTask = await db.followUpTask.update({
    where: {
      id: taskId,
    },
    data,
    include: {
      call: {
        select: { 
          id: true, 
          startedAt: true, 
          fromE164: true, 
          intent: true, 
          disposition: true 
        },
      },
      contact: {
        select: { 
          id: true, 
          name: true, 
          phones: true,
          doNotContact: true 
        },
      },
    },
  });

  return updatedTask as FollowUpTask;
}

export async function deleteFollowUpTask(
  workspaceId: string, 
  taskId: string
): Promise<void> {
  // First check if task exists
  const existingTask = await db.followUpTask.findFirst({
    where: {
      id: taskId,
      workspaceId,
    },
  });

  if (!existingTask) {
    throw new Error('Follow-up task not found');
  }

  await db.followUpTask.delete({
    where: {
      id: taskId,
    },
  });
}

export async function getOverdueFollowUpTasks(
  workspaceId: string
): Promise<FollowUpTask[]> {
  const tasks = await db.followUpTask.findMany({
    where: {
      workspaceId,
      status: 'open',
      dueAt: {
        lt: new Date(),
      },
    },
    include: {
      call: {
        select: { 
          id: true, 
          startedAt: true, 
          fromE164: true, 
          intent: true, 
          disposition: true 
        },
      },
      contact: {
        select: { 
          id: true, 
          name: true, 
          phones: true,
          doNotContact: true 
        },
      },
    },
    orderBy: [
      { priority: 'desc' },
      { dueAt: 'asc' },
    ],
  });

  return tasks as FollowUpTask[];
}

export async function getFollowUpTasksForCall(
  workspaceId: string,
  callId: string
): Promise<FollowUpTask[]> {
  const tasks = await db.followUpTask.findMany({
    where: {
      workspaceId,
      callId,
    },
    orderBy: [
      { status: 'asc' },
      { dueAt: 'asc' },
    ],
  });

  return tasks as FollowUpTask[];
}

export async function getMyFollowUpTasks(
  workspaceId: string,
  assignedTo: string,
  status?: FollowUpStatus
): Promise<FollowUpTask[]> {
  let whereConditions: any = {
    workspaceId,
    assignedTo,
  };

  if (status) {
    whereConditions.status = status;
  }

  const tasks = await db.followUpTask.findMany({
    where: whereConditions,
    include: {
      call: {
        select: { 
          id: true, 
          startedAt: true, 
          fromE164: true, 
          intent: true, 
          disposition: true 
        },
      },
      contact: {
        select: { 
          id: true, 
          name: true, 
          phones: true,
          doNotContact: true 
        },
      },
    },
    orderBy: [
      { status: 'asc' },
      { priority: 'desc' },
      { dueAt: 'asc' },
    ],
  });

  return tasks as FollowUpTask[];
}