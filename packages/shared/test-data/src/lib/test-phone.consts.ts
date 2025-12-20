import { dxRsaGenerateKeyPair } from '@dx3/encryption'
import type { DeviceAuthType } from '@dx3/models-shared'
import { PHONE_DEFAULT_REGION_CODE } from '@dx3/models-shared'

import { TEST_UUID } from './test.consts'

// Generate a real RSA key pair for biometric testing
const testRsaKeyPair = dxRsaGenerateKeyPair()
export const TEST_BIOMETRIC_PUBLIC_KEY = testRsaKeyPair.publicKey
export const TEST_BIOMETRIC_PRIVATE_KEY = testRsaKeyPair.privateKey

export const TEST_PHONE_1 = '8584846800'
export const TEST_PHONE_2 = '0123456789'
export const TEST_PHONE_CARRIER = 'ATT'
export const TEST_PHONE_COUNTRY_CODE = '1'
export const TEST_PHONE_COUNTRY_CODE_IT = '39'
export const TEST_PHONE_IT_INVALID = '11 111 1111'
export const TEST_PHONE_IT_VALID = '06 555 5555'
export const TEST_PHONE_NAME = 'iphone,16'
export const TEST_PHONE_REGION_CODE_IT = 'IT'
export const TEST_PHONE_VALID = '8584846801'
export const TEST_PHONE_UNIQUE_DEVICE_ID = 'e5a96fa3-ab58-4d27-b607-3a32d4cf7270'

export const TEST_DEVICE: DeviceAuthType = {
  carrier: TEST_PHONE_CARRIER,
  deviceCountry: PHONE_DEFAULT_REGION_CODE,
  deviceId: TEST_UUID,
  name: TEST_PHONE_NAME,
  uniqueDeviceId: TEST_PHONE_UNIQUE_DEVICE_ID,
}
