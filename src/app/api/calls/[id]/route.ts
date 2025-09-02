import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspace } from '@/lib/auth';
import { getCallById } from '@/server/repos/calls';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireWorkspace();
    const { id } = params;

    const call = await getCallById(session.workspaceId, id);

    if (!call) {
      return NextResponse.json(
        { error: 'Call not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ call });

  } catch (error) {
    console.error('Get call by ID error:', error);
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch call' },
      { status: 500 }
    );
  }
}