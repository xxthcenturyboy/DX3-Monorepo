import type { CreateUserPayloadType } from '@dx3/models-shared'
import { PHONE_DEFAULT_REGION_CODE, USER_ROLE } from '@dx3/models-shared'

import { TEST_EMAIL_NEW } from './test-email.consts'
import { TEST_PHONE_2, TEST_PHONE_COUNTRY_CODE } from './test-phone.consts'
import { TEST_NAME_FIRST_USER, TEST_NAME_LAST_USER } from './test-user.consts'

export const TEST_AUTH_PASSWORD = 'password'
export const TEST_AUTH_USERNAME = 'username'

export const TEST_USER_CREATE: CreateUserPayloadType = {
  countryCode: TEST_PHONE_COUNTRY_CODE,
  email: TEST_EMAIL_NEW,
  firstName: TEST_NAME_FIRST_USER,
  lastName: TEST_NAME_LAST_USER,
  phone: TEST_PHONE_2,
  regionCode: PHONE_DEFAULT_REGION_CODE,
  roles: [USER_ROLE.USER],
  shouldValidate: true,
  username: TEST_AUTH_USERNAME,
}
