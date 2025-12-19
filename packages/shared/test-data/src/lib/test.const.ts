import type { CreateUserPayloadType, DeviceAuthType } from '@dx3/models-shared'
import { APP_DOMAIN, PHONE_DEFAULT_REGION_CODE, USER_ROLE } from '@dx3/models-shared'

export const TEST_COUNTRY_CODE = '1'
export const TEST_DEVICE: DeviceAuthType = {
  carrier: 'ATT',
  deviceCountry: 'US',
  deviceId: 'test-device-id',
  name: 'iPhone,16',
  uniqueDeviceId: 'e5a96fa3-ab58-4d27-b607-3a32d4cf7270',
}
export const TEST_EMAIL = `test@${APP_DOMAIN}`
export const TEST_EXISTING_EMAIL = `admin@${APP_DOMAIN}`
export const TEST_EXISTING_PASSWORD = 'admin123'
export const TEST_EXISTING_PHONE = '8584846800'
export const TEST_EXISTING_USERNAME = 'admin'
export const TEST_EXISTING_USER_ID = '2cf4aebd-d30d-4c9e-9047-e52c10fe8d4d'
export const TEST_FIRST_NAME = 'George'
export const TEST_LAST_NAME = 'Washington'
export const TEST_PASSWORD = 'password'
export const TEST_PHONE = '0123456789'
export const TEST_PHONE_IT_INVALID = '11 111 1111'
export const TEST_PHONE_VALID = '8584846801'
export const TEST_PHONE_IT_VALID = '06 555 5555'
export const TEST_UUID = '9472bfb8-f7a9-4146-951e-15520f392baf'
export const TEST_BAD_UUID = '9472bfb8-f7a9-4146-951e-15520f392baf'
export const TEST_USERNAME = 'username'
export const TEST_USER_CREATE: CreateUserPayloadType = {
  countryCode: TEST_COUNTRY_CODE,
  email: TEST_EMAIL,
  firstName: TEST_FIRST_NAME,
  lastName: TEST_LAST_NAME,
  phone: TEST_PHONE_VALID,
  regionCode: PHONE_DEFAULT_REGION_CODE,
  roles: ['USER'],
  shouldValidate: true,
  username: TEST_USERNAME,
}
export const TEST_WEB_URL = 'http://localhost:3000'
export const TEST_USER_DATA = {
  ADMIN: {
    email: TEST_EXISTING_EMAIL,
    firstName: TEST_FIRST_NAME,
    id: TEST_EXISTING_USER_ID,
    lastName: TEST_LAST_NAME,
    password: TEST_EXISTING_PASSWORD,
    phone: TEST_EXISTING_PHONE,
    phoneCountryCode: TEST_COUNTRY_CODE,
    phoneRegionCode: PHONE_DEFAULT_REGION_CODE,
    roles: [USER_ROLE.USER, USER_ROLE.ADMIN],
    username: TEST_EXISTING_USERNAME,
  },
  SUPERADMIN: {
    email: `superadmin@${APP_DOMAIN}`,
    firstName: 'Super',
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    lastName: 'Admin',
    password: 'superadmin123',
    phone: '8584846800',
    phoneCountryCode: TEST_COUNTRY_CODE,
    phoneRegionCode: PHONE_DEFAULT_REGION_CODE,
    roles: [USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN],
    username: 'superadmin',
  },
  USER: {
    email: `user@${APP_DOMAIN}`,
    firstName: 'Test',
    id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    lastName: 'User',
    password: 'testuser123',
    phone: TEST_PHONE_IT_VALID,
    phoneCountryCode: '36',
    phoneRegionCode: 'IT',
    roles: [USER_ROLE.USER],
    username: 'testuser',
  },
} as const
