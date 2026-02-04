/**
 * User roles in the system with hierarchical order.
 * Order determines privilege level (higher = more access).
 *
 * Hierarchy:
 * USER (1) → EDITOR (2) → ADMIN (3) → METRICS_ADMIN (4) → LOGGING_ADMIN (5) → SUPER_ADMIN (6)
 */
export const USER_ROLE = {
  ADMIN: 'ADMIN',
  EDITOR: 'EDITOR',
  LOGGING_ADMIN: 'LOGGING_ADMIN',
  METRICS_ADMIN: 'METRICS_ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
  USER: 'USER',
} as const

/**
 * Role order mapping for privilege comparison.
 * Higher order = higher privileges.
 */
export const USER_ROLE_ORDER: Record<string, number> = {
  [USER_ROLE.ADMIN]: 3,
  [USER_ROLE.EDITOR]: 2,
  [USER_ROLE.LOGGING_ADMIN]: 5,
  [USER_ROLE.METRICS_ADMIN]: 4,
  [USER_ROLE.SUPER_ADMIN]: 6,
  [USER_ROLE.USER]: 1,
}

export const USER_ROLE_ARRAY = Object.values(USER_ROLE)

/**
 * Check if a user has at least the specified role level.
 * Uses role hierarchy to determine access.
 */
export function hasRoleOrHigher(userRoles: string[], requiredRole: string): boolean {
  const requiredOrder = USER_ROLE_ORDER[requiredRole] ?? 0
  return userRoles.some((role) => (USER_ROLE_ORDER[role] ?? 0) >= requiredOrder)
}
