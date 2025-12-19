/**
 * User Privilege Sets Seed Data
 * Defines the available roles in the system
 */

import type { USER_ROLE } from '@dx3/models-shared'

export interface UserPrivilegeSetSeedData {
  name: keyof typeof USER_ROLE
  description: string
  order: number
}

export const USER_PRIVILEGE_SETS_SEED: UserPrivilegeSetSeedData[] = [
  {
    description: 'Standard user with basic access permissions',
    name: 'USER',
    order: 1,
  },
  {
    description: 'Administrator with elevated permissions for user management',
    name: 'ADMIN',
    order: 2,
  },
  {
    description: 'Super administrator with full system access',
    name: 'SUPER_ADMIN',
    order: 3,
  },
]
