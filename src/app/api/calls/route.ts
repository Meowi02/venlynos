import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireWorkspace } from '@/lib/auth';
import { getCalls } from '@/server/repos/calls';
import { paginationSchema } from '@/lib/pagination';
import { intentSchema, callDispositionSchema, agentTypeSchema } from '@/types/core';

const callsQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  intent: z.union([intentSchema, z.array(intentSchema)]).optional(),
  disposition: z.union([callDispositionSchema, z.array(callDispositionSchema)]).optional(),
  agentType: agentTypeSchema.optional(),
}).merge(paginationSchema);

export async function GET(request: NextRequest) {
  try {
    const session = await requireWorkspace();
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const queryParams = {
      from: searchParams.get('from') || undefined,
      to: searchParams.get('to') || undefined,
      intent: searchParams.getAll('intent').length > 0 
        ? searchParams.getAll('intent') as any[] 
        : searchParams.get('intent') ? [searchParams.get('intent')] : undefined,
      disposition: searchParams.getAll('disposition').length > 0 
        ? searchParams.getAll('disposition') as any[]
        : searchParams.get('disposition') ? [searchParams.get('disposition')] : undefined,
      agentType: searchParams.get('agentType') || undefined,
      cursor: searchParams.get('cursor') || undefined,
      limit: searchParams.get('limit') || undefined,
    };

    const validatedParams = callsQuerySchema.parse(queryParams);

    const result = await getCalls({
      workspaceId: session.workspaceId,
      ...validatedParams,
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('Get calls error:', error);
    
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
      { error: 'Failed to fetch calls' },
      { status: 500 }
    );
  }
}