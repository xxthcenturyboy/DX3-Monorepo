/**
 * Users Seed Data
 * Defines initial users for the system
 */

import { dxHashString } from '@dx3/encryption'
import { USER_ROLE } from '@dx3/models-shared'

export interface UserSeedData {
  id: string
  username: string
  firstName: string
  lastName: string
  roles: string[]
  hashword?: string
}

export interface EmailSeedData {
  userId: string
  email: string
  default: boolean
  label: string
  verifiedAt: Date | null
}

export interface PhoneSeedData {
  userId: string
  phone: string
  countryCode: string
  regionCode: string
  default: boolean
  label: string
  verifiedAt: Date | null
}

// Predefined UUIDs for consistent seeding
export const SEED_USER_IDS = {
  ADMIN: '2cf4aebd-d30d-4c9e-9047-e52c10fe8d4d',
  SUPER_ADMIN: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  TEST_USER: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
} as const

/**
 * Get admin user seed data with hashed password
 */
export const getAdminUserSeed = async (): Promise<UserSeedData> => ({
  firstName: 'Admin',
  hashword: await dxHashString('advancedbasics1'),
  id: SEED_USER_IDS.ADMIN,
  lastName: 'User',
  roles: [USER_ROLE.ADMIN, USER_ROLE.USER],
  username: 'admin',
})

/**
 * Get super admin user seed data with hashed password
 */
export const getSuperAdminUserSeed = async (): Promise<UserSeedData> => ({
  firstName: 'Super',
  hashword: await dxHashString('superadmin123'),
  id: SEED_USER_IDS.SUPER_ADMIN,
  lastName: 'Admin',
  roles: [USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.USER],
  username: 'superadmin',
})

/**
 * Get test user seed data (no password - login via OTP)
 */
export const getTestUserSeed = async (): Promise<UserSeedData> => ({
  firstName: 'Test',
  id: SEED_USER_IDS.TEST_USER,
  lastName: 'User',
  roles: [USER_ROLE.USER],
  username: 'testuser',
})

/**
 * Get all user seed data
 */
export const getAllUsersSeed = async (): Promise<UserSeedData[]> => {
  return Promise.all([getAdminUserSeed(), getSuperAdminUserSeed(), getTestUserSeed()])
}

/**
 * Get email seed data for users
 */
export const getEmailsSeed = (): EmailSeedData[] => [
  {
    default: true,
    email: 'admin@danex.software',
    label: 'Work',
    userId: SEED_USER_IDS.ADMIN,
    verifiedAt: new Date(),
  },
  {
    default: true,
    email: 'superadmin@danex.software',
    label: 'Work',
    userId: SEED_USER_IDS.SUPER_ADMIN,
    verifiedAt: new Date(),
  },
  {
    default: true,
    email: 'test@danex.software',
    label: 'Personal',
    userId: SEED_USER_IDS.TEST_USER,
    verifiedAt: new Date(),
  },
]

/**
 * Get phone seed data for users
 */
export const getPhonesSeed = (): PhoneSeedData[] => [
  {
    countryCode: '1',
    default: true,
    label: 'Mobile',
    phone: '8584846800',
    regionCode: 'US',
    userId: SEED_USER_IDS.ADMIN,
    verifiedAt: new Date(),
  },
  {
    countryCode: '1',
    default: true,
    label: 'Mobile',
    phone: '5551234567',
    regionCode: 'US',
    userId: SEED_USER_IDS.TEST_USER,
    verifiedAt: null,
  },
]
