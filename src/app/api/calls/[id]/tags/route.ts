import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireWorkspace } from '@/lib/auth';
import { getCallById, updateCall } from '@/server/repos/calls';
import { logAudit, AUDIT_ACTIONS, AUDIT_TARGETS, createDiff } from '@/server/audit';

const tagsUpdateSchema = z.object({
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  disposition: z.enum(['answered', 'missed', 'booked', 'spam', 'callback']).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireWorkspace();
    const { id } = params;
    const body = await request.json();

    // Get the current call for diff logging
    const currentCall = await getCallById(session.workspaceId, id);
    
    if (!currentCall) {
      return NextResponse.json(
        { error: 'Call not found' },
        { status: 404 }
      );
    }

    const updateData = tagsUpdateSchema.parse(body);

    // For now, we'll store tags and notes in metadata or as separate fields
    // This is a simplified implementation - you might want to add a separate tags table
    const callUpdate: any = {};
    
    if (updateData.notes !== undefined) {
      callUpdate.metadata = {
        ...(currentCall.transcript as any)?.metadata || {},
        notes: updateData.notes,
        tags: updateData.tags || (currentCall.transcript as any)?.metadata?.tags || [],
      };
    }
    
    if (updateData.disposition !== undefined) {
      callUpdate.disposition = updateData.disposition;
    }

    const updatedCall = await updateCall(session.workspaceId, id, callUpdate);

    // Create diff and audit log
    const diff = createDiff(currentCall, updatedCall);
    
    if (Object.keys(diff).length > 0) {
      await logAudit({
        workspaceId: session.workspaceId,
        actor: session.userId,
        action: AUDIT_ACTIONS.TAG,
        target: AUDIT_TARGETS.CALL,
        targetId: id,
        diff,
        metadata: {
          source: 'api',
          updatedBy: session.email,
          action_type: updateData.tags ? 'tag_update' : 'notes_update',
        },
      });
    }

    return NextResponse.json({ call: updatedCall });

  } catch (error) {
    console.error('Update call tags error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid tag data', details: error.errors },
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
      { error: 'Failed to update call tags' },
      { status: 500 }
    );
  }
}