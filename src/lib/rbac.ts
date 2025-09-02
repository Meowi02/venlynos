export type Role = 'owner' | 'admin' | 'dispatcher' | 'tech' | 'viewer';

export const roleHierarchy: Record<Role, number> = {
  owner: 5,
  admin: 4,
  dispatcher: 3,
  tech: 2,
  viewer: 1,
};

export function hasPermission(userRole: Role, requiredRole: Role): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

export function canManageUsers(role: Role): boolean {
  return hasPermission(role, 'admin');
}

export function canManageJobs(role: Role): boolean {
  return hasPermission(role, 'dispatcher');
}

export function canViewCalls(role: Role): boolean {
  return hasPermission(role, 'viewer');
}

export function canConfigureSystem(role: Role): boolean {
  return hasPermission(role, 'owner');
}