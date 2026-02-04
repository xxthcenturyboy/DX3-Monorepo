/**
 * User Privilege Sets Seed Data
 * Defines the available roles in the system
 *
 * Role Hierarchy (order 1-6):
 * USER (1) → EDITOR (2) → ADMIN (3) → METRICS_ADMIN (4) → LOGGING_ADMIN (5) → SUPER_ADMIN (6)
 */

import type { USER_ROLE } from '@dx3/models-shared'

export interface UserPrivilegeSetSeedData {
  description: string
  name: keyof typeof USER_ROLE
  order: number
}

export const USER_PRIVILEGE_SETS_SEED: UserPrivilegeSetSeedData[] = [
  {
    description: 'Standard user with basic access permissions',
    name: 'USER',
    order: 1,
  },
  {
    description: 'Editor with blog and content management permissions',
    name: 'EDITOR',
    order: 2,
  },
  {
    description: 'Administrator with elevated permissions for user management',
    name: 'ADMIN',
    order: 3,
  },
  {
    description: 'Metrics administrator with access to business analytics and metrics dashboards',
    name: 'METRICS_ADMIN',
    order: 4,
  },
  {
    description: 'Logging administrator with access to system logs (security-sensitive)',
    name: 'LOGGING_ADMIN',
    order: 5,
  },
  {
    description: 'Super administrator with full system access',
    name: 'SUPER_ADMIN',
    order: 6,
  },
]
