import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireWorkspace } from '@/lib/auth';
import { getOverviewData } from '@/server/repos/analytics';

const overviewQuerySchema = z.object({
  days: z.coerce.number().min(1).max(90).optional().default(7),
});

export async function GET(request: NextRequest) {
  try {
    const session = await requireWorkspace();
    const { searchParams } = new URL(request.url);
    
    const queryParams = {
      days: searchParams.get('days') || undefined,
    };

    const validatedParams = overviewQuerySchema.parse(queryParams);

    const data = await getOverviewData(session.workspaceId);

    return NextResponse.json(data);

  } catch (error) {
    console.error('Get overview analytics error:', error);
    
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
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}