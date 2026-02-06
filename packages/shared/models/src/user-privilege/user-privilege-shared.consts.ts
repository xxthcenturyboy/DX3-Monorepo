/**
 * User roles in the system with hierarchical order.
 * Order determines privilege level (higher = more access).
 *
 * Hierarchy (sparse numbering for future insertions):
 * USER (100) → EDITOR (200) → ADMIN (300) → METRICS_ADMIN (400) → LOGGING_ADMIN (500) → SUPER_ADMIN (1000)
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
 *
 * Uses sparse numbering (gaps of 100) to allow inserting new roles
 * without renumbering existing ones. SUPER_ADMIN at 1000 ensures
 * it's always the highest privilege level.
 */
export const USER_ROLE_ORDER: Record<string, number> = {
  [USER_ROLE.ADMIN]: 300,
  [USER_ROLE.EDITOR]: 200,
  [USER_ROLE.LOGGING_ADMIN]: 500,
  [USER_ROLE.METRICS_ADMIN]: 400,
  [USER_ROLE.SUPER_ADMIN]: 1000,
  [USER_ROLE.USER]: 100,
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
