import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSession } from '@/lib/auth';

const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(100),
  timezone: z.string().optional().default('America/New_York'),
});

// GET /api/workspaces - List user's workspaces
export async function GET(request: NextRequest) {
  try {
    const session = await requireSession();

    // Mock data for now - in real app would query database
    const mockWorkspaces = [
      {
        id: session.workspaceId,
        name: 'Main Workspace',
        timezone: 'America/New_York',
        role: session.role,
        createdAt: new Date().toISOString(),
      }
    ];

    return NextResponse.json({ workspaces: mockWorkspaces });

  } catch (error) {
    console.error('Get workspaces error:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch workspaces' },
      { status: 500 }
    );
  }
}

// POST /api/workspaces - Create new workspace
export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    const body = await request.json();
    const { name, timezone } = createWorkspaceSchema.parse(body);

    // Mock creation - in real app would create in database
    const mockWorkspace = {
      id: `workspace_${Date.now()}`,
      name,
      timezone,
      createdAt: new Date().toISOString(),
      role: 'owner' as const,
    };

    return NextResponse.json({ workspace: mockWorkspace }, { status: 201 });

  } catch (error) {
    console.error('Create workspace error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid workspace data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create workspace' },
      { status: 500 }
    );
  }
}