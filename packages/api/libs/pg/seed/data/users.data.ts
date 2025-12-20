/**
 * Users Seed Data
 * Defines initial users for the system
 */

import { dxHashString } from '@dx3/encryption'
import { USER_ROLE } from '@dx3/models-shared'
import { TEST_USER_DATA } from '@dx3/test-data'

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

/**
 * Get admin user seed data with hashed password
 */
export const getAdminUserSeed = async (): Promise<UserSeedData> => ({
  firstName: TEST_USER_DATA.ADMIN.firstName,
  hashword: await dxHashString(TEST_USER_DATA.ADMIN.password),
  id: TEST_USER_DATA.ADMIN.id,
  lastName: TEST_USER_DATA.ADMIN.lastName,
  roles: [USER_ROLE.ADMIN, USER_ROLE.USER],
  username: TEST_USER_DATA.ADMIN.username,
})

/**
 * Get super admin user seed data with hashed password
 */
export const getSuperAdminUserSeed = async (): Promise<UserSeedData> => ({
  firstName: TEST_USER_DATA.SUPERADMIN.firstName,
  hashword: await dxHashString(TEST_USER_DATA.SUPERADMIN.password),
  id: TEST_USER_DATA.SUPERADMIN.id,
  lastName: TEST_USER_DATA.SUPERADMIN.lastName,
  roles: [USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.USER],
  username: TEST_USER_DATA.SUPERADMIN.username,
})

/**
 * Get test user seed data (no password - login via OTP)
 */
export const getTestUserSeed = async (): Promise<UserSeedData> => ({
  firstName: TEST_USER_DATA.USER.firstName,
  hashword: await dxHashString(TEST_USER_DATA.USER.password),
  id: TEST_USER_DATA.USER.id,
  lastName: TEST_USER_DATA.USER.lastName,
  roles: [USER_ROLE.USER],
  username: TEST_USER_DATA.USER.username,
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
    email: TEST_USER_DATA.ADMIN.email,
    label: 'Work',
    userId: TEST_USER_DATA.ADMIN.id,
    verifiedAt: new Date(),
  },
  {
    default: true,
    email: TEST_USER_DATA.SUPERADMIN.email,
    label: 'Work',
    userId: TEST_USER_DATA.SUPERADMIN.id,
    verifiedAt: new Date(),
  },
  {
    default: true,
    email: TEST_USER_DATA.USER.email,
    label: 'Personal',
    userId: TEST_USER_DATA.USER.id,
    verifiedAt: new Date(),
  },
]

/**
 * Get phone seed data for users
 */
export const getPhonesSeed = (): PhoneSeedData[] => [
  {
    countryCode: TEST_USER_DATA.ADMIN.phoneCountryCode,
    default: true,
    label: 'Mobile',
    phone: TEST_USER_DATA.ADMIN.phone,
    regionCode: TEST_USER_DATA.ADMIN.phoneRegionCode,
    userId: TEST_USER_DATA.ADMIN.id,
    verifiedAt: new Date(),
  },
  {
    countryCode: TEST_USER_DATA.SUPERADMIN.phoneCountryCode,
    default: true,
    label: 'Mobile',
    phone: TEST_USER_DATA.SUPERADMIN.phone,
    regionCode: TEST_USER_DATA.SUPERADMIN.phoneRegionCode,
    userId: TEST_USER_DATA.SUPERADMIN.id,
    verifiedAt: new Date(),
  },
  {
    countryCode: TEST_USER_DATA.USER.phoneCountryCode,
    default: true,
    label: 'Mobile',
    phone: TEST_USER_DATA.USER.phone,
    regionCode: TEST_USER_DATA.USER.phoneRegionCode,
    userId: TEST_USER_DATA.USER.id,
    verifiedAt: null,
  },
]
