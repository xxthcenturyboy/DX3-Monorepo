import axios, { type AxiosError, type AxiosRequestConfig } from 'axios'

import { dxRsaGenerateKeyPair, dxRsaSignPayload } from '@dx3/encryption'
import type { AuthSuccessResponseType, DeviceType, LoginPayloadType } from '@dx3/models-shared'
import { AUTH_TOKEN_NAMES, ERROR_CODES, PHONE_DEFAULT_REGION_CODE } from '@dx3/models-shared'
import { TEST_DEVICE, TEST_EMAIL_BIOMETRIC, TEST_PHONE_3, TEST_UUID } from '@dx3/test-data'

const errorLogSpyMock = jest.spyOn(console, 'error').mockImplementation(() => {})

describe('v1 Auth — Biometric Login', () => {
  const generatedKeys = dxRsaGenerateKeyPair()
  const rsaKeyPair = {
    privateKey: generatedKeys.privateKey,
    publicKey: generatedKeys.publicKey,
  }

  let phoneAccountId: string
  let phoneAuthToken: string
  let phoneRefreshToken: string
  let emailAccountId: string
  let deviceId: string

  beforeAll(async () => {
    // Create a phone-based account to use for biometric tests
    const otpResponse = await axios.request<{ code: string }>({
      data: { phone: TEST_PHONE_3 },
      method: 'POST',
      url: '/api/auth/otp-code/send/phone',
    })

    const accountResponse = await axios.request<AuthSuccessResponseType>({
      data: {
        code: otpResponse.data.code,
        device: TEST_DEVICE,
        region: PHONE_DEFAULT_REGION_CODE,
        value: TEST_PHONE_3,
      },
      method: 'POST',
      url: '/api/auth/account',
    })

    phoneAccountId = accountResponse.data.profile.id
    phoneAuthToken = accountResponse.data.accessToken
    deviceId = accountResponse.data.profile.device?.id
    phoneRefreshToken = (accountResponse.headers['set-cookie'] as string[])
      .find((c) => c.includes(AUTH_TOKEN_NAMES.REFRESH))
      ?.match(new RegExp(`^${AUTH_TOKEN_NAMES.REFRESH}=(.+?);`))?.[1] as string

    // Also create an email-based account (no device) for negative tests
    const emailOtpResponse = await axios.request<{ code: string }>({
      data: { email: TEST_EMAIL_BIOMETRIC },
      method: 'POST',
      url: '/api/auth/otp-code/send/email',
    })

    const emailAccountResponse = await axios.request<AuthSuccessResponseType>({
      data: {
        code: emailOtpResponse.data.code,
        value: TEST_EMAIL_BIOMETRIC,
      },
      method: 'POST',
      url: '/api/auth/account',
    })

    emailAccountId = emailAccountResponse.data.profile.id
  })

  afterAll(() => {
    errorLogSpyMock.mockRestore()
  })

  describe('PUT /api/device/biometric/public-key', () => {
    test('should throw when no data is sent', async () => {
      const request: AxiosRequestConfig = {
        data: { biometricPublicKey: '', uniqueDeviceId: '' },
        headers: {
          Authorization: `Bearer ${phoneAuthToken}`,
          cookie: [`${AUTH_TOKEN_NAMES.REFRESH}=${phoneRefreshToken}`],
        },
        method: 'PUT',
        url: '/api/device/biometric/public-key',
      }
      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        expect(typedError.response?.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual(
          `${ERROR_CODES.GENERIC_VALIDATION_FAILED} Update Public Key: Insufficient data to complete request.`,
        )
      }
    })

    test('should throw when no device exists with the given id', async () => {
      const request: AxiosRequestConfig = {
        data: { biometricPublicKey: rsaKeyPair.publicKey, uniqueDeviceId: TEST_UUID },
        headers: {
          Authorization: `Bearer ${phoneAuthToken}`,
          cookie: [`${AUTH_TOKEN_NAMES.REFRESH}=${phoneRefreshToken}`],
        },
        method: 'PUT',
        url: '/api/device/biometric/public-key',
      }
      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        expect(typedError.response?.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual(
          `${ERROR_CODES.GENERIC_SERVER_ERROR} Update Public Key: Could not find the device to update.`,
        )
      }
    })

    test('should update and return device with the public key', async () => {
      const request: AxiosRequestConfig = {
        data: {
          biometricPublicKey: rsaKeyPair.publicKey,
          uniqueDeviceId: TEST_DEVICE.uniqueDeviceId,
        },
        headers: {
          Authorization: `Bearer ${phoneAuthToken}`,
          cookie: [`${AUTH_TOKEN_NAMES.REFRESH}=${phoneRefreshToken}`],
        },
        method: 'PUT',
        url: '/api/device/biometric/public-key',
      }
      const response = await axios.request<DeviceType>(request)
      expect(response.status).toEqual(200)
      expect(response.data.uniqueDeviceId).toEqual(TEST_DEVICE.uniqueDeviceId)
      expect(response.data.biomAuthPubKey).toEqual(rsaKeyPair.publicKey)
    })
  })

  describe('PUT /api/device/fcm-token', () => {
    test('should throw when no FCM token is sent', async () => {
      const request: AxiosRequestConfig = {
        data: { fcmToken: '' },
        headers: {
          Authorization: `Bearer ${phoneAuthToken}`,
          cookie: [`${AUTH_TOKEN_NAMES.REFRESH}=${phoneRefreshToken}`],
        },
        method: 'PUT',
        url: '/api/device/fcm-token',
      }
      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        expect(typedError.response?.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual(
          `${ERROR_CODES.GENERIC_VALIDATION_FAILED} Update FCM Token: Insufficient data to complete request`,
        )
      }
    })

    test('should update and return device with FCM token', async () => {
      const request: AxiosRequestConfig = {
        data: { fcmToken: TEST_UUID },
        headers: {
          Authorization: `Bearer ${phoneAuthToken}`,
          cookie: [`${AUTH_TOKEN_NAMES.REFRESH}=${phoneRefreshToken}`],
        },
        method: 'PUT',
        url: '/api/device/fcm-token',
      }
      const response = await axios.request<DeviceType>(request)
      expect(response.status).toEqual(200)
      expect(response.data.uniqueDeviceId).toEqual(TEST_DEVICE.uniqueDeviceId)
    })
  })

  describe('POST /api/auth/login — biometric', () => {
    test('should return an error when user has no stored public key', async () => {
      const payload: LoginPayloadType = {
        biometric: {
          device: TEST_DEVICE,
          signature: dxRsaSignPayload(rsaKeyPair.privateKey!, TEST_PHONE_3) as string,
          userId: emailAccountId,
        },
        value: TEST_PHONE_3,
      }
      const request: AxiosRequestConfig = {
        data: payload,
        method: 'POST',
        url: '/api/auth/login',
        withCredentials: true,
      }
      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        expect(typedError.response?.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual(
          `${ERROR_CODES.AUTH_INVALID_BIOMETRIC} BiometricLogin: User ${emailAccountId} has no stored public key.`,
        )
      }
    })

    test('should return an error when signature is invalid', async () => {
      const payload: LoginPayloadType = {
        biometric: {
          device: TEST_DEVICE,
          signature: dxRsaSignPayload(rsaKeyPair.privateKey!, 'wrong payload') as string,
          userId: phoneAccountId,
        },
        value: TEST_PHONE_3,
      }
      const request: AxiosRequestConfig = {
        data: payload,
        method: 'POST',
        url: '/api/auth/login',
        withCredentials: true,
      }
      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        expect(typedError.response?.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual(
          `${ERROR_CODES.AUTH_INVALID_BIOMETRIC} BiometricLogin: Device signature is invalid: ${rsaKeyPair.publicKey}, userid: ${phoneAccountId}`,
        )
      }
    })

    test('should log in successfully with valid RSA signature', async () => {
      const payload: LoginPayloadType = {
        biometric: {
          device: TEST_DEVICE,
          signature: dxRsaSignPayload(rsaKeyPair.privateKey!, TEST_PHONE_3) as string,
          userId: phoneAccountId,
        },
        value: TEST_PHONE_3,
      }
      const request: AxiosRequestConfig = {
        data: payload,
        method: 'POST',
        url: '/api/auth/login',
        withCredentials: true,
      }
      const response = await axios.request<AuthSuccessResponseType>(request)

      // Update tokens for disconnect test
      phoneAuthToken = response.data.accessToken
      phoneRefreshToken = (response.headers['set-cookie'] as string[])
        .find((c) => c.includes(AUTH_TOKEN_NAMES.REFRESH))
        ?.match(new RegExp(`^${AUTH_TOKEN_NAMES.REFRESH}=(.+?);`))?.[1] as string

      expect(response.status).toEqual(200)
      expect(response.data.accessToken).toBeDefined()
      expect(response.data.profile.phones).toHaveLength(1)
    })
  })

  describe('DELETE /api/device/disconnect/:id', () => {
    test('should throw when device does not exist', async () => {
      const request: AxiosRequestConfig = {
        headers: {
          Authorization: `Bearer ${phoneAuthToken}`,
          cookie: [`${AUTH_TOKEN_NAMES.REFRESH}=${phoneRefreshToken}`],
        },
        method: 'DELETE',
        url: `/api/device/disconnect/${TEST_UUID}`,
      }
      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        expect(typedError.response?.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual(`${ERROR_CODES.GENERIC_SERVER_ERROR} Device not found.`)
      }
    })

    test('should disconnect device successfully', async () => {
      const request: AxiosRequestConfig = {
        headers: {
          Authorization: `Bearer ${phoneAuthToken}`,
          cookie: [`${AUTH_TOKEN_NAMES.REFRESH}=${phoneRefreshToken}`],
        },
        method: 'DELETE',
        url: `/api/device/disconnect/${deviceId}`,
      }
      const response = await axios.request<{ message: string }>(request)
      expect(response.status).toEqual(200)
      expect(response.data.message).toEqual('Device disconnected.')
    })
  })
})
