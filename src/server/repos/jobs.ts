import 'server-only';
import { db } from '../db';
import { decodeCursor, createPaginatedResponse } from '@/lib/pagination';
import type { PaginatedResult } from '@/lib/pagination';
import type { Job, JobStatus } from '@/types/core';

export interface JobsFilters {
  workspaceId: string;
  status?: JobStatus[];
  assignedTo?: string;
  from?: string;
  to?: string;
  cursor?: string;
  limit?: number;
}

export async function getJobs(filters: JobsFilters): Promise<PaginatedResult<Job>> {
  const { workspaceId, status, assignedTo, from, to, cursor, limit = 20 } = filters;

  let whereConditions: any = {
    workspaceId,
  };

  // Status filter
  if (status?.length) {
    whereConditions.status = { in: status };
  }

  // Assigned to filter
  if (assignedTo) {
    whereConditions.assignedTo = assignedTo;
  }

  // Date range filters (for slot times)
  if (from || to) {
    whereConditions.slotStart = {};
    if (from) whereConditions.slotStart.gte = new Date(from);
    if (to) whereConditions.slotStart.lte = new Date(to);
  }

  // Cursor pagination
  if (cursor) {
    const decodedCursor = decodeCursor(cursor);
    whereConditions.createdAt = {
      lt: new Date(decodedCursor),
    };
  }

  const jobs = await db.job.findMany({
    where: whereConditions,
    include: {
      contact: {
        select: { id: true, name: true, phones: true },
      },
      calls: {
        select: { id: true, startedAt: true, disposition: true },
        orderBy: { startedAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
  });

  const hasMore = jobs.length > limit;
  const data = hasMore ? jobs.slice(0, limit) : jobs;

  return createPaginatedResponse(
    data as Job[],
    limit,
    (item) => item.createdAt
  );
}

export async function getJobById(workspaceId: string, jobId: string): Promise<Job | null> {
  const job = await db.job.findFirst({
    where: {
      id: jobId,
      workspaceId,
    },
    include: {
      contact: true,
      calls: {
        orderBy: { startedAt: 'desc' },
      },
    },
  });

  return job as Job | null;
}

export async function createJob(data: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>): Promise<Job> {
  const job = await db.job.create({
    data,
    include: {
      contact: true,
      calls: true,
    },
  });

  return job as Job;
}

export async function updateJob(
  workspaceId: string, 
  jobId: string, 
  data: Partial<Job>
): Promise<Job> {
  const updatedJob = await db.job.update({
    where: {
      id: jobId,
      workspaceId,
    },
    data,
    include: {
      contact: true,
      calls: true,
    },
  });

  return updatedJob as Job;
}

export async function getJobsForCalendar(
  workspaceId: string, 
  from: Date, 
  to: Date
): Promise<Job[]> {
  const jobs = await db.job.findMany({
    where: {
      workspaceId,
      slotStart: {
        gte: from,
        lte: to,
      },
    },
    include: {
      contact: {
        select: { id: true, name: true, phones: true },
      },
    },
    orderBy: { slotStart: 'asc' },
  });

  return jobs as Job[];
}

export async function getTodaysJobs(workspaceId: string): Promise<Job[]> {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  return getJobsForCalendar(workspaceId, startOfDay, endOfDay);
}