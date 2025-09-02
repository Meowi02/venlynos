import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireWorkspace } from '@/lib/auth';
import { getCallById, updateCall } from '@/server/repos/calls';
import { createJob } from '@/server/repos/jobs';
import { createJobSchema } from '@/types/core';
import { logAudit, AUDIT_ACTIONS, AUDIT_TARGETS } from '@/server/audit';

const linkJobSchema = createJobSchema.extend({
  linkToCall: z.boolean().optional().default(true),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireWorkspace();
    const { id: callId } = params;
    const body = await request.json();

    // Get the call to link to
    const call = await getCallById(session.workspaceId, callId);
    
    if (!call) {
      return NextResponse.json(
        { error: 'Call not found' },
        { status: 404 }
      );
    }

    const jobData = linkJobSchema.parse({
      ...body,
      workspaceId: session.workspaceId,
      sourceCallId: callId,
      contactId: call.contactId,
    });

    // Create the job
    const job = await createJob(jobData);

    // Link the call to the job
    if (jobData.linkToCall) {
      await updateCall(session.workspaceId, callId, {
        jobId: job.id,
        disposition: 'booked', // Automatically mark as booked when linked to job
      });
    }

    // Audit logs
    await Promise.all([
      // Log job creation
      logAudit({
        workspaceId: session.workspaceId,
        actor: session.userId,
        action: AUDIT_ACTIONS.CREATE,
        target: AUDIT_TARGETS.JOB,
        targetId: job.id,
        metadata: {
          source: 'call_link',
          createdBy: session.email,
          linkedFromCall: callId,
        },
      }),
      // Log call linking
      logAudit({
        workspaceId: session.workspaceId,
        actor: session.userId,
        action: AUDIT_ACTIONS.LINK,
        target: AUDIT_TARGETS.CALL,
        targetId: callId,
        metadata: {
          source: 'api',
          linkedBy: session.email,
          linkedToJob: job.id,
        },
      }),
    ]);

    return NextResponse.json({ 
      job, 
      message: 'Job created and linked to call successfully' 
    }, { status: 201 });

  } catch (error) {
    console.error('Link job to call error:', error);
    
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
      { error: 'Failed to create and link job' },
      { status: 500 }
    );
  }
}