import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { createSessionCookie } from '@/lib/auth';

const loginSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = loginSchema.parse(body);

    // Mock session data for development
    // In a real app, you'd look up the user and workspace from the database
    const mockSession = {
      userId: 'user_dev_123',
      workspaceId: 'workspace_dev_123',
      role: 'owner' as const,
      email,
    };

    // Set session cookie
    const sessionData = createSessionCookie(mockSession);
    const cookieStore = await cookies();
    
    cookieStore.set('venlyn-session', sessionData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return NextResponse.json({ 
      success: true, 
      user: { email, role: mockSession.role },
      workspace: { id: mockSession.workspaceId, name: 'Main Workspace' }
    });

  } catch (error) {
    console.error('Login error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}