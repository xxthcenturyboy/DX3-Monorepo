import { PHONE_DEFAULT_REGION_CODE, USER_ROLE } from '@dx3/models-shared'

import { TEST_EMAIL, TEST_EMAIL_ADMIN, TEST_EMAIL_SUPERADMIN } from './test-email.consts'
import {
  TEST_BIOMETRIC_PUBLIC_KEY,
  TEST_PHONE_1,
  TEST_PHONE_2,
  TEST_PHONE_COUNTRY_CODE,
  TEST_PHONE_COUNTRY_CODE_IT,
  TEST_PHONE_IT_VALID,
  TEST_PHONE_REGION_CODE_IT,
  TEST_PHONE_VALID,
} from './test-phone.consts'

/**
 * Test credentials from environment variables (with defaults for backwards compatibility)
 * These can be overridden by setting the corresponding env vars in packages/api/.env
 */
export const TEST_ADMIN_USERNAME = process.env.SEED_USER_ADMIN_USERNAME ?? 'admin'
export const TEST_ADMIN_PASSWORD = process.env.SEED_USER_ADMIN_PASSWORD ?? 'admin123'
export const TEST_SUPERADMIN_USERNAME = process.env.SEED_USER_SUPERADMIN_USERNAME ?? 'superadmin'
export const TEST_SUPERADMIN_PASSWORD = process.env.SEED_USER_SUPERADMIN_PASSWORD ?? 'superadmin123'
export const TEST_USER_USERNAME = process.env.SEED_USER_TEST_USERNAME ?? 'testuser'
export const TEST_USER_PASSWORD = process.env.SEED_USER_TEST_PASSWORD ?? 'testuser123'

export const TEST_EXISTING_ADMIN_USER_ID = '2cf4aebd-d30d-4c9e-9047-e52c10fe8d4d'
export const TEST_EXISTING_PASSWORD = TEST_ADMIN_PASSWORD
export const TEST_EXISTING_SUPERADMIN_USER_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
export const TEST_EXISTING_USERNAME = TEST_ADMIN_USERNAME
export const TEST_EXISTING_USER_ID = 'b2c3d4e5-f6a7-8901-bcde-f12345678901'
export const TEST_NAME_FIRST_ADMIN = 'Admin'
export const TEST_NAME_FIRST_SUPERADMIN = 'Superadmin'
export const TEST_NAME_FIRST_USER = 'Test'
export const TEST_NAME_LAST_ADMIN = 'User'
export const TEST_NAME_LAST_SUPERADMIN = 'User'
export const TEST_NAME_LAST_USER = 'User'

export const TEST_USER_DATA = {
  ADMIN: {
    email: TEST_EMAIL_ADMIN,
    firstName: TEST_NAME_FIRST_ADMIN,
    id: TEST_EXISTING_ADMIN_USER_ID,
    lastName: TEST_NAME_LAST_ADMIN,
    password: TEST_ADMIN_PASSWORD,
    phone: TEST_PHONE_1,
    phoneCountryCode: TEST_PHONE_COUNTRY_CODE,
    phoneRegionCode: PHONE_DEFAULT_REGION_CODE,
    roles: [USER_ROLE.USER, USER_ROLE.ADMIN],
    username: TEST_ADMIN_USERNAME,
  },
  SUPERADMIN: {
    email: TEST_EMAIL_SUPERADMIN,
    firstName: TEST_NAME_FIRST_SUPERADMIN,
    id: TEST_EXISTING_SUPERADMIN_USER_ID,
    lastName: TEST_NAME_LAST_SUPERADMIN,
    password: TEST_SUPERADMIN_PASSWORD,
    phone: TEST_PHONE_VALID,
    phoneCountryCode: TEST_PHONE_COUNTRY_CODE,
    phoneRegionCode: PHONE_DEFAULT_REGION_CODE,
    roles: [USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN],
    username: TEST_SUPERADMIN_USERNAME,
  },
  USER: {
    email: TEST_EMAIL,
    firstName: TEST_NAME_FIRST_USER,
    id: TEST_EXISTING_USER_ID,
    lastName: TEST_NAME_LAST_USER,
    password: TEST_USER_PASSWORD,
    phone: TEST_PHONE_IT_VALID,
    phoneCountryCode: TEST_PHONE_COUNTRY_CODE_IT,
    phoneRegionCode: TEST_PHONE_REGION_CODE_IT,
    roles: [USER_ROLE.USER],
    username: TEST_USER_USERNAME,
  },
}

export type MockUserDataType = {
  id: string
  accountLocked?: boolean
  biomAuthKey?: string
  roles?: string[]
  defaultEmail?: {
    email: string
    verified?: boolean
  } | null
  defaultPhone?: {
    phone: string
    countryCode: string
    regionCode?: string
    verified?: boolean
  } | null
  // biome-ignore lint/suspicious/noExplicitAny: allow for this
  [key: string]: any
}

export const MOCK_USERS: Record<string, MockUserDataType> = {
  [TEST_EXISTING_USER_ID]: {
    accountLocked: false,
    biomAuthKey: TEST_BIOMETRIC_PUBLIC_KEY,
    defaultEmail: {
      email: TEST_EMAIL,
      verified: true,
    },
    defaultPhone: {
      countryCode: TEST_PHONE_COUNTRY_CODE,
      phone: TEST_PHONE_2,
      regionCode: PHONE_DEFAULT_REGION_CODE,
      verified: true,
    },
    id: TEST_EXISTING_USER_ID,
    roles: [USER_ROLE.USER],
  },
  'admin-user': {
    accountLocked: false,
    defaultEmail: {
      email: TEST_EMAIL_ADMIN,
      verified: true,
    },
    defaultPhone: null,
    id: TEST_USER_DATA.ADMIN.id,
    roles: [USER_ROLE.ADMIN, USER_ROLE.USER],
  },
  'locked-user': {
    accountLocked: true,
    defaultEmail: {
      email: 'locked@test.com',
      verified: true,
    },
    defaultPhone: null,
    id: 'locked-user',
    roles: [USER_ROLE.USER],
  },
}
