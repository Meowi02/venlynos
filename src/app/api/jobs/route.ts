import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireWorkspace } from '@/lib/auth';
import { getJobs, createJob } from '@/server/repos/jobs';
import { paginationSchema } from '@/lib/pagination';
import { createJobSchema, jobStatusSchema } from '@/types/core';
import { logAudit, AUDIT_ACTIONS, AUDIT_TARGETS } from '@/server/audit';

const jobsQuerySchema = z.object({
  status: z.union([jobStatusSchema, z.array(jobStatusSchema)]).optional(),
  assignedTo: z.string().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  range: z.enum(['today', 'week', 'month']).optional(),
}).merge(paginationSchema);

export async function GET(request: NextRequest) {
  try {
    const session = await requireWorkspace();
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const queryParams = {
      status: searchParams.getAll('status').length > 0 
        ? searchParams.getAll('status') as any[]
        : searchParams.get('status') ? [searchParams.get('status')] : undefined,
      assignedTo: searchParams.get('assignedTo') || undefined,
      from: searchParams.get('from') || undefined,
      to: searchParams.get('to') || undefined,
      range: searchParams.get('range') || undefined,
      cursor: searchParams.get('cursor') || undefined,
      limit: searchParams.get('limit') || undefined,
    };

    const validatedParams = jobsQuerySchema.parse(queryParams);

    // Handle range shortcuts
    let { from, to } = validatedParams;
    if (validatedParams.range) {
      const now = new Date();
      switch (validatedParams.range) {
        case 'today':
          from = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
          to = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
          break;
        case 'week':
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          from = weekStart.toISOString();
          to = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case 'month':
          from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
          to = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
          break;
      }
    }

    const result = await getJobs({
      workspaceId: session.workspaceId,
      ...validatedParams,
      from,
      to,
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('Get jobs error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}

// POST /api/jobs - Create new job
export async function POST(request: NextRequest) {
  try {
    const session = await requireWorkspace();
    const body = await request.json();
    
    const jobData = createJobSchema.parse({
      ...body,
      workspaceId: session.workspaceId,
    });

    const job = await createJob(jobData);

    // Audit log
    await logAudit({
      workspaceId: session.workspaceId,
      actor: session.userId,
      action: AUDIT_ACTIONS.CREATE,
      target: AUDIT_TARGETS.JOB,
      targetId: job.id,
      metadata: {
        source: 'api',
        createdBy: session.email,
      },
    });

    return NextResponse.json({ job }, { status: 201 });

  } catch (error) {
    console.error('Create job error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid job data', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    );
  }
}