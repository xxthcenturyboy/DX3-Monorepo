/**
 * User Privilege Sets Seed Data
 * Defines the available roles in the system
 *
 * Role Hierarchy (sparse numbering for future insertions):
 * USER (100) → EDITOR (200) → ADMIN (300) → METRICS_ADMIN (400) → LOGGING_ADMIN (500) → SUPER_ADMIN (1000)
 *
 * Gaps of 100 allow inserting new roles without renumbering.
 * SUPER_ADMIN at 1000 ensures it's always the highest privilege level.
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
    order: 100,
  },
  {
    description: 'Editor with blog and content management permissions',
    name: 'EDITOR',
    order: 200,
  },
  {
    description: 'Administrator with elevated permissions for user management',
    name: 'ADMIN',
    order: 300,
  },
  {
    description: 'Metrics administrator with access to business analytics and metrics dashboards',
    name: 'METRICS_ADMIN',
    order: 400,
  },
  {
    description: 'Logging administrator with access to system logs (security-sensitive)',
    name: 'LOGGING_ADMIN',
    order: 500,
  },
  {
    description: 'Super administrator with full system access',
    name: 'SUPER_ADMIN',
    order: 1000,
  },
]
