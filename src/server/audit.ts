import 'server-only';
import { db } from './db';

export interface AuditLogParams {
  workspaceId: string;
  actor: string; // User ID or system identifier
  action: string; // 'create', 'update', 'delete', etc.
  target: string; // Type of entity (call, job, contact, etc.)
  targetId: string; // ID of the entity
  diff?: Record<string, any>; // Changes made (before/after)
  metadata?: Record<string, any>; // Additional context
}

export async function logAudit(params: AuditLogParams): Promise<void> {
  try {
    await db.auditEvent.create({
      data: {
        workspaceId: params.workspaceId,
        actor: params.actor,
        action: params.action,
        target: params.target,
        targetId: params.targetId,
        diff: params.diff || null,
        metadata: params.metadata || null,
      },
    });
  } catch (error) {
    // Log error but don't throw - audit failures shouldn't break the main operation
    console.error('Failed to log audit event:', error, params);
  }
}

export function createDiff(before: any, after: any): Record<string, any> {
  const diff: Record<string, any> = {};
  
  const allKeys = new Set([
    ...Object.keys(before || {}),
    ...Object.keys(after || {}),
  ]);

  for (const key of allKeys) {
    const beforeValue = before?.[key];
    const afterValue = after?.[key];
    
    if (beforeValue !== afterValue) {
      diff[key] = {
        before: beforeValue,
        after: afterValue,
      };
    }
  }
  
  return diff;
}

// Helper function to get audit events for a specific entity
export async function getAuditHistory(
  workspaceId: string,
  target: string,
  targetId: string,
  limit: number = 50
) {
  return await db.auditEvent.findMany({
    where: {
      workspaceId,
      target,
      targetId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  });
}

// Pre-defined audit actions for consistency
export const AUDIT_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LINK: 'link',
  UNLINK: 'unlink',
  ASSIGN: 'assign',
  UNASSIGN: 'unassign',
  ESCALATE: 'escalate',
  TAG: 'tag',
  UNTAG: 'untag',
} as const;

// Pre-defined target types
export const AUDIT_TARGETS = {
  CALL: 'call',
  JOB: 'job',
  CONTACT: 'contact',
  NUMBER: 'number',
  AGENT_CONFIG: 'agent_config',
  SOP: 'sop',
  USER: 'user',
  WORKSPACE: 'workspace',
} as const;