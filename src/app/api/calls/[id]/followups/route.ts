import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireWorkspace } from '@/lib/auth';
import { createFollowUpTask } from '@/server/repos/followups';
import { getCallById } from '@/server/repos/calls';
import { followUpTypeSchema, taskPrioritySchema } from '@/types/core';

const createCallFollowUpSchema = z.object({
  type: followUpTypeSchema,
  dueAt: z.string().datetime(),
  assignedTo: z.string().optional(),
  priority: taskPrioritySchema.default('normal'),
  note: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireWorkspace();
    const body = await request.json();

    // Validate the call exists
    const call = await getCallById(session.workspaceId, params.id);
    if (!call) {
      return NextResponse.json(
        { error: 'Call not found' },
        { status: 404 }
      );
    }

    const validatedData = createCallFollowUpSchema.parse(body);

    const followUpTask = await createFollowUpTask({
      workspaceId: session.workspaceId,
      callId: params.id,
      contactId: call.contactId,
      ...validatedData,
    });

    // Auto-update call with follow-up requirement
    if (validatedData.type === 'callback' && !call.outcomeRequired) {
      // This would be handled by the audit/business rules system
      // For now, we'll just create the task
    }

    return NextResponse.json({ 
      success: true, 
      followUpTask 
    }, { status: 201 });

  } catch (error) {
    console.error('Create call follow-up error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid follow-up data', details: error.errors },
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
      { error: 'Failed to create follow-up' },
      { status: 500 }
    );
  }
}