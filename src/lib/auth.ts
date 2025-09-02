import 'server-only';
import { cookies } from 'next/headers';
import { z } from 'zod';
import type { Role } from '@prisma/client';

// Session schema
const sessionSchema = z.object({
  userId: z.string(),
  workspaceId: z.string(),
  role: z.enum(['owner', 'admin', 'dispatcher', 'tech', 'viewer']),
  email: z.string().email(),
});

export type Session = z.infer<typeof sessionSchema>;

// Get session from cookie
export async function getSession(): Promise<Session | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('venlyn-session');
    
    if (!sessionCookie) {
      return null;
    }

    const sessionData = JSON.parse(sessionCookie.value);
    return sessionSchema.parse(sessionData);
  } catch (error) {
    return null;
  }
}

// Require authenticated session
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  
  if (!session) {
    throw new Error('Unauthorized - session required');
  }
  
  return session;
}

// Require workspace access
export async function requireWorkspace(workspaceId?: string): Promise<Session> {
  const session = await requireSession();
  
  if (workspaceId && session.workspaceId !== workspaceId) {
    throw new Error('Forbidden - workspace access denied');
  }
  
  return session;
}

// Check role permission
export function hasRolePermission(userRole: Role, requiredRole: Role): boolean {
  const roleHierarchy: Record<Role, number> = {
    owner: 5,
    admin: 4,
    dispatcher: 3,
    tech: 2,
    viewer: 1,
  };
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

// Set session cookie
export function createSessionCookie(session: Session): string {
  return JSON.stringify(session);
}