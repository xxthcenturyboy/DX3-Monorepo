/**
 * User Privilege Sets Seed Data
 * Defines the available roles in the system
 */

import { USER_ROLE } from '@dx3/models-shared'

export interface UserPrivilegeSetSeedData {
  name: keyof typeof USER_ROLE
  description: string
  order: number
}

export const USER_PRIVILEGE_SETS_SEED: UserPrivilegeSetSeedData[] = [
  {
    name: 'USER',
    description: 'Standard user with basic access permissions',
    order: 1,
  },
  {
    name: 'ADMIN',
    description: 'Administrator with elevated permissions for user management',
    order: 2,
  },
  {
    name: 'SUPER_ADMIN',
    description: 'Super administrator with full system access',
    order: 3,
  },
]
