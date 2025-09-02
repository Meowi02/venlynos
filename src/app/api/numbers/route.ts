import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspace } from '@/lib/auth';
import { getNumbers } from '@/server/repos/numbers';

export async function GET(request: NextRequest) {
  try {
    const session = await requireWorkspace();

    const numbers = await getNumbers(session.workspaceId);

    return NextResponse.json({ numbers });

  } catch (error) {
    console.error('Get numbers error:', error);
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch numbers' },
      { status: 500 }
    );
  }
}