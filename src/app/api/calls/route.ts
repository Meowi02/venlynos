import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireWorkspace } from '@/lib/auth';
import { getCalls } from '@/server/repos/calls';
import { paginationSchema } from '@/lib/pagination';
import { 
  intentSchema, 
  callDispositionSchema, 
  agentTypeSchema, 
  queueStatusSchema,
  callSourceSchema,
  leadSourceSchema 
} from '@/types/core';

const callsQuerySchema = z.object({
  // Date range
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  
  // Basic filters
  intent: z.union([intentSchema, z.array(intentSchema)]).optional(),
  disposition: z.union([callDispositionSchema, z.array(callDispositionSchema)]).optional(),
  agentType: z.union([agentTypeSchema, z.array(agentTypeSchema)]).optional(),
  
  // Value range
  valueMin: z.coerce.number().int().optional(),
  valueMax: z.coerce.number().int().optional(),
  
  // Boolean flags
  hasJob: z.coerce.boolean().optional(),
  hasRecording: z.coerce.boolean().optional(),
  hasTranscript: z.coerce.boolean().optional(),
  dnc: z.coerce.boolean().optional(),
  
  // Tags
  tag: z.union([z.string(), z.array(z.string())]).optional(),
  
  // Source filters
  numberId: z.string().optional(),
  source: z.union([callSourceSchema, z.array(callSourceSchema)]).optional(),
  leadSource: z.union([leadSourceSchema, z.array(leadSourceSchema)]).optional(),
  
  // Queue and outcome
  queueStatus: z.union([queueStatusSchema, z.array(queueStatusSchema)]).optional(),
  outcomeRequired: z.coerce.boolean().optional(),
  
  // Search
  search: z.string().optional(),
  
  // Special modes
  triageMode: z.coerce.boolean().optional(),
}).merge(paginationSchema);

export async function GET(request: NextRequest) {
  try {
    const session = await requireWorkspace();
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters with comprehensive filtering
    const parseArrayParam = (param: string) => {
      const values = searchParams.getAll(param);
      if (values.length > 0) return values;
      const single = searchParams.get(param);
      return single ? [single] : undefined;
    };
    
    const queryParams = {
      // Date range
      from: searchParams.get('from') || undefined,
      to: searchParams.get('to') || undefined,
      
      // Basic filters
      intent: parseArrayParam('intent'),
      disposition: parseArrayParam('disposition'), 
      agentType: parseArrayParam('agentType'),
      
      // Value range
      valueMin: searchParams.get('valueMin') || undefined,
      valueMax: searchParams.get('valueMax') || undefined,
      
      // Boolean flags
      hasJob: searchParams.get('hasJob') || undefined,
      hasRecording: searchParams.get('hasRecording') || undefined,
      hasTranscript: searchParams.get('hasTranscript') || undefined,
      dnc: searchParams.get('dnc') || undefined,
      
      // Tags
      tag: parseArrayParam('tag'),
      
      // Source filters
      numberId: searchParams.get('numberId') || undefined,
      source: parseArrayParam('source'),
      leadSource: parseArrayParam('leadSource'),
      
      // Queue and outcome
      queueStatus: parseArrayParam('queueStatus'),
      outcomeRequired: searchParams.get('outcomeRequired') || undefined,
      
      // Search
      search: searchParams.get('search') || undefined,
      
      // Special modes
      triageMode: searchParams.get('triageMode') || undefined,
      
      // Pagination
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