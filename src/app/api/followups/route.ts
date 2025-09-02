import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireWorkspace } from '@/lib/auth';
import { getFollowUpTasks, createFollowUpTask } from '@/server/repos/followups';
import { paginationSchema } from '@/lib/pagination';
import { followUpTypeSchema, followUpStatusSchema, taskPrioritySchema, createFollowUpTaskSchema } from '@/types/core';

const followUpQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  status: z.union([followUpStatusSchema, z.array(followUpStatusSchema)]).optional(),
  type: z.union([followUpTypeSchema, z.array(followUpTypeSchema)]).optional(),
  priority: z.union([taskPrioritySchema, z.array(taskPrioritySchema)]).optional(),
  assignedTo: z.string().optional(),
  callId: z.string().optional(),
  contactId: z.string().optional(),
  overdue: z.coerce.boolean().optional(),
}).merge(paginationSchema);

export async function GET(request: NextRequest) {
  try {
    const session = await requireWorkspace();
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const parseArrayParam = (param: string) => {
      const values = searchParams.getAll(param);
      if (values.length > 0) return values;
      const single = searchParams.get(param);
      return single ? [single] : undefined;
    };
    
    const queryParams = {
      from: searchParams.get('from') || undefined,
      to: searchParams.get('to') || undefined,
      status: parseArrayParam('status'),
      type: parseArrayParam('type'),
      priority: parseArrayParam('priority'),
      assignedTo: searchParams.get('assignedTo') || undefined,
      callId: searchParams.get('callId') || undefined,
      contactId: searchParams.get('contactId') || undefined,
      overdue: searchParams.get('overdue') || undefined,
      cursor: searchParams.get('cursor') || undefined,
      limit: searchParams.get('limit') || undefined,
    };

    const validatedParams = followUpQuerySchema.parse(queryParams);

    const result = await getFollowUpTasks({
      workspaceId: session.workspaceId,
      ...validatedParams,
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('Get follow-ups error:', error);
    
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
      { error: 'Failed to fetch follow-ups' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireWorkspace();
    const body = await request.json();

    const validatedData = createFollowUpTaskSchema.parse({
      ...body,
      workspaceId: session.workspaceId,
    });

    const followUpTask = await createFollowUpTask(validatedData);

    return NextResponse.json({ 
      success: true, 
      followUpTask 
    }, { status: 201 });

  } catch (error) {
    console.error('Create follow-up error:', error);
    
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