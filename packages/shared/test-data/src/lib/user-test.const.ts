import { dxRsaGenerateKeyPair } from '@dx3/encryption'
import { USER_ROLE } from '@dx3/models-shared'

import { TEST_COUNTRY_CODE, TEST_EMAIL, TEST_EXISTING_USER_ID, TEST_PHONE } from './test.const'

// Generate a real RSA key pair for biometric testing
const testRsaKeyPair = dxRsaGenerateKeyPair()
export const TEST_BIOMETRIC_PUBLIC_KEY = testRsaKeyPair.publicKey
export const TEST_BIOMETRIC_PRIVATE_KEY = testRsaKeyPair.privateKey

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
      countryCode: TEST_COUNTRY_CODE,
      phone: TEST_PHONE,
      regionCode: 'US',
      verified: true,
    },
    id: TEST_EXISTING_USER_ID,
    roles: [USER_ROLE.USER],
  },
  'admin-user': {
    accountLocked: false,
    defaultEmail: {
      email: 'admin@test.com',
      verified: true,
    },
    defaultPhone: null,
    id: 'admin-user',
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
