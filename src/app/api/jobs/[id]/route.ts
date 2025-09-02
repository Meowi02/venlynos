import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireWorkspace } from '@/lib/auth';
import { getJobById, updateJob } from '@/server/repos/jobs';
import { updateJobSchema } from '@/types/core';
import { logAudit, AUDIT_ACTIONS, AUDIT_TARGETS, createDiff } from '@/server/audit';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireWorkspace();
    const { id } = params;

    const job = await getJobById(session.workspaceId, id);

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ job });

  } catch (error) {
    console.error('Get job by ID error:', error);
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch job' },
      { status: 500 }
    );
  }
}

// PATCH /api/jobs/[id] - Update job
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireWorkspace();
    const { id } = params;
    const body = await request.json();

    // Get the current job for diff logging
    const currentJob = await getJobById(session.workspaceId, id);
    
    if (!currentJob) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    const updateData = updateJobSchema.parse(body);

    const updatedJob = await updateJob(session.workspaceId, id, updateData);

    // Create diff and audit log
    const diff = createDiff(currentJob, updatedJob);
    
    if (Object.keys(diff).length > 0) {
      await logAudit({
        workspaceId: session.workspaceId,
        actor: session.userId,
        action: AUDIT_ACTIONS.UPDATE,
        target: AUDIT_TARGETS.JOB,
        targetId: id,
        diff,
        metadata: {
          source: 'api',
          updatedBy: session.email,
        },
      });
    }

    return NextResponse.json({ job: updatedJob });

  } catch (error) {
    console.error('Update job error:', error);
    
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
      { error: 'Failed to update job' },
      { status: 500 }
    );
  }
}