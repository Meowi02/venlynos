import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireWorkspace } from '@/lib/auth';
import { getFollowUpTaskById, updateFollowUpTask, deleteFollowUpTask } from '@/server/repos/followups';
import { updateFollowUpTaskSchema } from '@/types/core';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireWorkspace();
    const followUpTask = await getFollowUpTaskById(session.workspaceId, params.id);

    if (!followUpTask) {
      return NextResponse.json(
        { error: 'Follow-up task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ followUpTask });

  } catch (error) {
    console.error('Get follow-up task error:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch follow-up task' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireWorkspace();
    const body = await request.json();

    const validatedData = updateFollowUpTaskSchema.parse(body);

    const updatedTask = await updateFollowUpTask(
      session.workspaceId,
      params.id,
      validatedData
    );

    return NextResponse.json({ 
      success: true, 
      followUpTask: updatedTask 
    });

  } catch (error) {
    console.error('Update follow-up task error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid follow-up task data', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Follow-up task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update follow-up task' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireWorkspace();

    await deleteFollowUpTask(session.workspaceId, params.id);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete follow-up task error:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Follow-up task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete follow-up task' },
      { status: 500 }
    );
  }
}