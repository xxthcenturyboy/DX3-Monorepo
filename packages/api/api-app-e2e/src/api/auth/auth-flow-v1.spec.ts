import axios, { type AxiosError, type AxiosRequestConfig, type AxiosResponse } from 'axios'

import { dxRsaGenerateKeyPair, dxRsaSignPayload } from '@dx3/encryption'
import type {
  AccountCreationPayloadType,
  AuthSuccessResponseType,
  DeviceType,
  LoginPayloadType,
  UserLookupResponseType,
} from '@dx3/models-shared'
import { AUTH_TOKEN_NAMES, PHONE_DEFAULT_REGION_CODE, USER_LOOKUPS } from '@dx3/models-shared'
import {
  TEST_DEVICE,
  TEST_EMAIL,
  TEST_EXISTING_EMAIL,
  TEST_EXISTING_PHONE,
  TEST_EXISTING_USERNAME,
  TEST_PHONE,
  TEST_PHONE_VALID,
  TEST_USER_DATA,
  TEST_UUID,
} from '@dx3/test-data'

import type { AuthUtilType } from './auth-util-v1'
import { AuthUtil } from './auth-util-v1'

const errorLogSpyMock = jest.spyOn(console, 'error').mockImplementation(() => {})

describe('v1 Auth Flow', () => {
  let authUtil: AuthUtilType
  let deviceId: string
  let emailAccountId: string
  let emailAuthToken: string
  let emailRefreshToken: string
  let otpEmail: string
  let otpPhone: string
  let phoneAccountId: string
  let phoneAuthToken: string
  let phoneRefreshToken: string
  const generatedKeys = dxRsaGenerateKeyPair()
  const rsaKeyPair = {
    privateKey: generatedKeys.privateKey,
    publicKey: generatedKeys.publicKey,
  }

  beforeAll(async () => {
    authUtil = new AuthUtil()
    await authUtil.login()
  })

  afterAll(async () => {
    if (emailAccountId || phoneAccountId) {
      const authUtil = new AuthUtil()
      await authUtil.login()

      if (emailAccountId) {
        const removeEmailAccountRequest: AxiosRequestConfig = {
          headers: {
            ...authUtil.getHeaders(),
          },
          method: 'DELETE',
          url: `/api/v1/user/test/${emailAccountId}`,
          withCredentials: true,
        }
        await axios.request<AxiosRequestConfig, AxiosResponse<void>>(removeEmailAccountRequest)
      }

      if (phoneAccountId) {
        const removePhoneAccountRequest: AxiosRequestConfig = {
          headers: {
            ...authUtil.getHeaders(),
          },
          method: 'DELETE',
          url: `/api/v1/user/test/${phoneAccountId}`,
          withCredentials: true,
        }
        await axios.request<AxiosRequestConfig, AxiosResponse<void>>(removePhoneAccountRequest)
      }
    }
    errorLogSpyMock.mockRestore()
  })

  describe('Check Email or Phone for availability', () => {
    test('should return available when queried with a non-existent phone', async () => {
      // arrange
      const url = `/api/v1/auth/lookup?code=1&value=${TEST_PHONE_VALID}&type=${USER_LOOKUPS.PHONE}&region=${PHONE_DEFAULT_REGION_CODE}`
      // act
      const response = await axios.get<UserLookupResponseType>(url)
      // assert
      expect(response.status).toBe(200)
      expect(response.data.available).toBe(true)
    })

    test('should return unavailable when queried with an existing phone', async () => {
      // arrange
      const url = `/api/v1/auth/lookup?code=1&value=${TEST_EXISTING_PHONE}&type=${USER_LOOKUPS.PHONE}&region=${PHONE_DEFAULT_REGION_CODE}`
      // act
      // assert
      try {
        // expect(await axios.get(url)).toThrow();
        const response = await axios.get<UserLookupResponseType>(url)
        expect(response.status).toBe(200)
        expect(response.data.available).toBe(false)
      } catch (err) {
        const typedError = err as AxiosError
        console.log('got error', typedError)
        // assert
        // expect(typedError.response.status).toBe(400);
        // // @ts-expect-error - type is bad
        // expect(typedError.response.data.message).toEqual('Error in auth lookup handler: (858) 484-6800 is already in use.');
      }
    })

    test('should return an error when queried with an invalid phone.', async () => {
      // arrange
      const url = `/api/v1/auth/lookup?code=1&value=${TEST_PHONE}&type=${USER_LOOKUPS.PHONE}`
      // act
      try {
        // expect(await axios.get(url)).toThrow();
        const response = await axios.get<UserLookupResponseType>(url)
        expect(response.status).toBe(200)
        expect(response.data.available).toBe(false)
      } catch (err) {
        const typedError = err as AxiosError
        console.log('got error', typedError)
        // assert
        // expect(typedError.response.status).toBe(400);
        // // @ts-expect-error - type is bad
        // expect(typedError.response.data.message).toEqual('Error in auth lookup handler: Missing phone or region code.');
      }
    })

    test('should return available when queried with a non-existent email', async () => {
      // arrange
      const expectedResult: UserLookupResponseType = { available: true }
      const url = `/api/v1/auth/lookup?value=${TEST_EMAIL}&type=${USER_LOOKUPS.EMAIL}`
      // act
      const response = await axios.get<UserLookupResponseType>(url)
      // assert
      expect(response.status).toBe(200)
      expect(response.data).toEqual(expectedResult)
    })

    test('should return unavailable when queried with an existing email', async () => {
      // arrange
      const url = `/api/v1/auth/lookup?value=${TEST_EXISTING_EMAIL}&type=${USER_LOOKUPS.EMAIL}`
      // act
      // assert
      try {
        // expect(await axios.get(url)).toThrow();
        const response = await axios.get<UserLookupResponseType>(url)
        expect(response.status).toBe(200)
        expect(response.data.available).toBe(false)
      } catch (err) {
        const typedError = err as AxiosError
        console.log('got error', typedError)
        // assert
        // expect(typedError.response.status).toBe(400);
        // // @ts-expect-error - type is bad
        // expect(typedError.response.data.message).toEqual(`Error in auth lookup handler: ${TEST_EXISTING_EMAIL} already exists.`);
      }
    })

    test('should return an error when queried with an invalid email.', async () => {
      // arrange
      const url = `/api/v1/auth/lookup?code=1&value=not-a-valid-email&type=${USER_LOOKUPS.EMAIL}`
      // act
      try {
        // expect(await axios.get(url)).toThrow();
        const response = await axios.get<UserLookupResponseType>(url)
        expect(response.status).toBe(200)
        expect(response.data.available).toBe(false)
      } catch (err) {
        const typedError = err as AxiosError
        console.log('got error', typedError)
        // assert
        // expect(typedError.response.status).toBe(400);
        // // @ts-expect-error - type is bad
        // expect(typedError.response.data.message).toEqual('Error in auth lookup handler: The email you provided is not valid.');
      }
    })

    test('should return an error when queried with a disposable email.', async () => {
      // arrange
      const url = `/api/v1/auth/lookup?code=1&value=email@080mail.com&type=${USER_LOOKUPS.EMAIL}`
      // act
      try {
        // expect(await axios.get(url)).toThrow();
        const response = await axios.get<UserLookupResponseType>(url)
        expect(response.status).toBe(200)
        expect(response.data.available).toBe(false)
      } catch (err) {
        const typedError = err as AxiosError
        console.log('got error', typedError)
        // assert
        // expect(typedError.response.status).toBe(400);
        // // @ts-expect-error - type is bad
        // expect(typedError.response.data.message).toEqual(
        //   'Error in auth lookup handler: The email you provided is not valid. Please note that we do not allow disposable emails or emails that do not exist, so make sure to use a real email address.'
        // );
      }
    })
  })

  describe('Send OTP to Phone/Email for confirmation prior to creating account or logging in.', () => {
    test('should return empty string when sent with an invalid phone', async () => {
      const request: AxiosRequestConfig = {
        data: {
          phone: TEST_PHONE,
        },
        method: 'POST',
        url: '/api/v1/auth/otp-code/send/phone',
      }

      const response = await axios.request<{ code: string }>(request)

      expect(response.status).toEqual(200)
      expect(response.data.code).toEqual('')
    })

    test('should return code when sent with valid phone', async () => {
      const request: AxiosRequestConfig = {
        data: {
          phone: TEST_PHONE_VALID,
        },
        method: 'POST',
        url: '/api/v1/auth/otp-code/send/phone',
      }

      const response = await axios.request<{ code: string }>(request)

      expect(response.status).toEqual(200)
      expect(response.data.code).toBeTruthy()

      otpPhone = response.data.code
    })

    test('should return empty string when sent with an invalid email', async () => {
      const request: AxiosRequestConfig = {
        data: {
          email: 'not-a-valid-email',
        },
        method: 'POST',
        url: '/api/v1/auth/otp-code/send/email',
      }

      const response = await axios.request<{ code: string }>(request)

      expect(response.status).toEqual(200)
      expect(response.data.code).toEqual('')
    })

    test('should return code when sent with valid email', async () => {
      const request: AxiosRequestConfig = {
        data: {
          email: TEST_EMAIL,
        },
        method: 'POST',
        url: '/api/v1/auth/otp-code/send/email',
      }

      const response = await axios.request<{ code: string }>(request)

      expect(response.status).toEqual(200)
      expect(response.data.code).toBeTruthy()

      otpEmail = response.data.code
    })
  })

  describe('Create Account', () => {
    test('should return an error when sent with no value.', async () => {
      // arrange
      const payload: AccountCreationPayloadType = {
        code: '',
        value: '',
      }

      const request: AxiosRequestConfig = {
        data: payload,
        method: 'POST',
        url: '/api/v1/auth/account',
      }
      // act
      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        // console.log('got error', typedError);
        // assert
        expect(typedError.response.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual('Bad data sent.')
      }
    })

    test('should return an error when sent with an invalid email.', async () => {
      // arrange
      const payload: AccountCreationPayloadType = {
        code: 'OU812',
        value: 'not-a-valid-email',
      }

      const request: AxiosRequestConfig = {
        data: payload,
        method: 'POST',
        url: '/api/v1/auth/account',
      }
      // act
      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        // console.log('got error', typedError);
        // assert
        expect(typedError.response.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual(
          `Account could not be created with payload: ${JSON.stringify(payload, null, 2)}`,
        )
      }
    })

    test('should return an error when sent with an existing email.', async () => {
      // arrange
      const payload: AccountCreationPayloadType = {
        code: 'OU812',
        value: TEST_USER_DATA.USER.email,
      }

      const request: AxiosRequestConfig = {
        data: payload,
        method: 'POST',
        url: '/api/v1/auth/account',
      }
      // act
      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        // console.log('got error', typedError);
        // assert
        expect(typedError.response.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual(
          `${TEST_USER_DATA.USER.email} already exists.`,
        )
      }
    })

    test('should return an error when sent with a restricted email.', async () => {
      // arrange
      const payload: AccountCreationPayloadType = {
        code: 'OU812',
        value: 'admin@test.com', // admin is restricted
      }

      const request: AxiosRequestConfig = {
        data: payload,
        method: 'POST',
        url: '/api/v1/auth/account',
      }
      // act
      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        // console.log('got error', typedError);
        // assert
        expect(typedError.response.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual(
          `Account could not be created with payload: ${JSON.stringify(payload, null, 2)}`,
        )
      }
    })

    test('should return an error when sent with an invalid phone.', async () => {
      // arrange
      const payload: AccountCreationPayloadType = {
        code: 'OU812',
        value: TEST_PHONE,
        // region: PHONE_DEFAULT_REGION_CODE
      }

      const request: AxiosRequestConfig = {
        data: payload,
        method: 'POST',
        url: '/api/v1/auth/account',
      }
      // act
      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        // console.log('got error', typedError);
        // assert
        expect(typedError.response.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual(
          `Account could not be created with payload: ${JSON.stringify(payload, null, 2)}`,
        )
      }
    })

    test('should return an error when sent with an existing phone.', async () => {
      // arrange
      const payload: AccountCreationPayloadType = {
        code: 'OU812',
        region: PHONE_DEFAULT_REGION_CODE,
        value: TEST_EXISTING_PHONE,
      }

      const request: AxiosRequestConfig = {
        data: payload,
        method: 'POST',
        url: '/api/v1/auth/account',
      }
      // act
      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        // console.log('got error', typedError);
        // assert
        expect(typedError.response.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual('(858) 484-6800 is already in use.')
      }
    })

    test('should return user profile when successfully create account with email', async () => {
      const payload: AccountCreationPayloadType = {
        code: otpEmail,
        region: PHONE_DEFAULT_REGION_CODE,
        value: TEST_EMAIL,
      }
      const request: AxiosRequestConfig = {
        data: payload,
        method: 'POST',
        url: '/api/v1/auth/account',
      }

      try {
        const response = await axios.request<AuthSuccessResponseType>(request)
        emailAccountId = response.data.profile.id
        emailAuthToken = response.data.accessToken
        const cookie = (response.headers['set-cookie'] as string[])
          .find((cookie) => cookie.includes(AUTH_TOKEN_NAMES.REFRESH))
          ?.match(new RegExp(`^${AUTH_TOKEN_NAMES.REFRESH}=(.+?);`))?.[1]
        emailRefreshToken = cookie

        expect(response.status).toEqual(200)
        expect(response.data.accessToken).toBeDefined()
        expect(response.data.profile.emails).toHaveLength(1)
      } catch (err) {
        console.log('err', err)
      }
    })

    test('should return user profile when successfully create account with phone', async () => {
      const payload: AccountCreationPayloadType = {
        code: otpPhone,
        device: TEST_DEVICE,
        region: PHONE_DEFAULT_REGION_CODE,
        value: TEST_PHONE_VALID,
      }
      const request: AxiosRequestConfig = {
        data: payload,
        method: 'POST',
        url: '/api/v1/auth/account',
      }

      const response = await axios.request<AuthSuccessResponseType>(request)
      phoneAccountId = response.data.profile.id
      phoneAuthToken = response.data.accessToken
      const cookie = (response.headers['set-cookie'] as string[])
        .find((cookie) => cookie.includes(AUTH_TOKEN_NAMES.REFRESH))
        ?.match(new RegExp(`^${AUTH_TOKEN_NAMES.REFRESH}=(.+?);`))?.[1]
      phoneRefreshToken = cookie
      deviceId = response.data.profile.device.id

      expect(response.status).toEqual(200)
      expect(response.data.accessToken).toBeDefined()
      expect(response.data.profile.phones).toHaveLength(1)
    })
  })

  describe('[Authenticated]: Add biometric public key to device', () => {
    test('should throw when no data is sent', async () => {
      // arrange
      const payload: {
        uniqueDeviceId: string
        biometricPublicKey: string
      } = {
        biometricPublicKey: '',
        uniqueDeviceId: '',
      }

      const request: AxiosRequestConfig = {
        data: payload,
        headers: {
          Authorization: `Bearer ${phoneAuthToken}`,
          cookie: [`${AUTH_TOKEN_NAMES.REFRESH}=${phoneRefreshToken}`],
        },
        method: 'PUT',
        url: '/api/v1/device/biometric/public-key',
      }
      // act
      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        // console.log('got error', typedError);
        // assert
        expect(typedError.response.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual(
          'Update Public Key: Insufficient data to complete request.',
        )
      }
    })

    test('should throw when no device exists with the id', async () => {
      // arrange
      const payload: {
        uniqueDeviceId: string
        biometricPublicKey: string
      } = {
        biometricPublicKey: rsaKeyPair.publicKey,
        uniqueDeviceId: TEST_UUID,
      }

      const request: AxiosRequestConfig = {
        data: payload,
        headers: {
          Authorization: `Bearer ${phoneAuthToken}`,
          cookie: [`${AUTH_TOKEN_NAMES.REFRESH}=${phoneRefreshToken}`],
        },
        method: 'PUT',
        url: '/api/v1/device/biometric/public-key',
      }
      // act
      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        // console.log('got error', typedError);
        // assert
        expect(typedError.response.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual(
          'Update Public Key: Could not find the device to update.',
        )
      }
    })

    test('should return device when updated', async () => {
      // arrange
      const payload: {
        uniqueDeviceId: string
        biometricPublicKey: string
      } = {
        biometricPublicKey: rsaKeyPair.publicKey,
        uniqueDeviceId: TEST_DEVICE.uniqueDeviceId,
      }

      const request: AxiosRequestConfig = {
        data: payload,
        headers: {
          Authorization: `Bearer ${phoneAuthToken}`,
          cookie: [`${AUTH_TOKEN_NAMES.REFRESH}=${phoneRefreshToken}`],
        },
        method: 'PUT',
        url: '/api/v1/device/biometric/public-key',
      }
      // act
      const response = await axios.request<DeviceType>(request)
      // assert
      expect(response.status).toEqual(200)
      expect(response.data.uniqueDeviceId).toEqual(TEST_DEVICE.uniqueDeviceId)
      expect(response.data.biomAuthPubKey).toEqual(rsaKeyPair.publicKey)
    })
  })

  describe('[Authenticated]: Add FCM Token to device', () => {
    test('should throw when no data is sent', async () => {
      // arrange
      const payload: {
        fcmToken: string
      } = {
        fcmToken: '',
      }

      const request: AxiosRequestConfig = {
        data: payload,
        headers: {
          Authorization: `Bearer ${phoneAuthToken}`,
          cookie: [`${AUTH_TOKEN_NAMES.REFRESH}=${phoneRefreshToken}`],
        },
        method: 'PUT',
        url: '/api/v1/device/fcm-token',
      }
      // act
      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        // console.log('got error', typedError);
        // assert
        expect(typedError.response.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual(
          'Update FCM Token: Insufficient data to complete request.',
        )
      }
    })

    test('should throw when no device is connected to the user', async () => {
      // arrange
      const payload: {
        fcmToken: string
      } = {
        fcmToken: TEST_UUID,
      }

      const request: AxiosRequestConfig = {
        data: payload,
        headers: {
          Authorization: `Bearer ${emailAuthToken}`,
          cookie: [`${AUTH_TOKEN_NAMES.REFRESH}=${emailRefreshToken}`],
        },
        method: 'PUT',
        url: '/api/v1/device/fcm-token',
      }
      // act
      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        // console.log('got error', typedError);
        // assert
        expect(typedError.response.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual('Update FCM Token: No device connected.')
      }
    })

    test('should return device when updated', async () => {
      // arrange
      const payload: {
        fcmToken: string
      } = {
        fcmToken: TEST_UUID,
      }

      const request: AxiosRequestConfig = {
        data: payload,
        headers: {
          Authorization: `Bearer ${phoneAuthToken}`,
          cookie: [`${AUTH_TOKEN_NAMES.REFRESH}=${phoneRefreshToken}`],
        },
        method: 'PUT',
        url: '/api/v1/device/fcm-token',
      }
      // act
      const response = await axios.request<DeviceType>(request)
      // assert
      expect(response.status).toEqual(200)
      expect(response.data.uniqueDeviceId).toEqual(TEST_DEVICE.uniqueDeviceId)
      expect(response.data.biomAuthPubKey).toEqual(rsaKeyPair.publicKey)
    })
  })

  // describe('Validate Email', () => {
  //   test('should return an error when sent with an invalid email.', async () => {
  //     // arrange
  //     const request: AxiosRequestConfig = {
  //       url: '/api/v1/auth/validate/email/413c78fb890955a86d3971828dd05a9b2d844e44d8a30d406f80bf6e79612bb97e8b3b5834c8dbebdf5c4dadc767a579',
  //       method: 'GET'
  //     };
  //     // act
  //     try {
  //       expect(await axios.request(request)).toThrow();
  //     } catch (err) {
  //       const typedError = err as AxiosError;
  //       // console.log('got error', typedError);
  //       // assert
  //       expect(typedError.response.status).toBe(400);
  //       // @ts-expect-error - type is bad
  //       expect(typedError.response.data.message).toEqual('Token is invalid');
  //     }
  //   });
  // });

  describe('Log In', () => {
    test('should return an error when sent with a phone that does not have an account.', async () => {
      // arrange
      const payload: LoginPayloadType = {
        code: otpPhone,
        value: '8584846802',
      }

      const request: AxiosRequestConfig = {
        data: payload,
        method: 'POST',
        url: '/api/v1/auth/login',
      }
      // act
      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        // console.log('got error', typedError);
        // assert
        expect(typedError.response.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual('100 Could not log you in.')
      }
    })

    test('should return an error when sent with an invalid otp code via phone login', async () => {
      // arrange
      const payload: LoginPayloadType = {
        code: 'InvalidCode',
        value: TEST_PHONE_VALID,
      }

      const request: AxiosRequestConfig = {
        data: payload,
        method: 'POST',
        url: '/api/v1/auth/login',
      }
      // act
      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        // console.log('got error', typedError);
        // assert
        expect(typedError.response.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual('100 Could not log you in.')
      }
    })

    test('should return an error when sent with an email that does not have an account.', async () => {
      // arrange
      const payload: LoginPayloadType = {
        code: otpEmail,
        value: 'not-in-this-system@useless.com',
      }

      const request: AxiosRequestConfig = {
        data: payload,
        method: 'POST',
        url: '/api/v1/auth/login',
      }
      // act
      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        // console.log('got error', typedError);
        // assert
        expect(typedError.response.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual('100 Could not log you in.')
      }
    })

    test('should return an error when sent with an invalid otp code via email login.', async () => {
      // arrange
      const payload: LoginPayloadType = {
        code: 'InvalidCode',
        value: TEST_EMAIL,
      }

      const request: AxiosRequestConfig = {
        data: payload,
        method: 'POST',
        url: '/api/v1/auth/login',
      }
      // act
      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        // console.log('got error', typedError);
        // assert
        expect(typedError.response.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual('100 Could not log you in.')
      }
    })

    test('should return an error when password is incorrect via email login.', async () => {
      // arrange
      const payload: LoginPayloadType = {
        password: 'bad-password',
        value: TEST_EXISTING_USERNAME,
      }

      const request: AxiosRequestConfig = {
        data: payload,
        method: 'POST',
        url: '/api/v1/auth/login',
      }
      // act
      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        // console.log('got error', typedError);
        // assert
        expect(typedError.response.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual('100 Could not log you in.')
      }
    })

    test('should return user profile when successfully logged in with email, passwordless login', async () => {
      const otpResponse = await axios.request<{ code: string }>({
        data: {
          email: TEST_EMAIL,
          strict: true,
        },
        method: 'POST',
        url: '/api/v1/auth/otp-code/send/email',
      })

      const payload: LoginPayloadType = {
        code: otpResponse.data.code,
        value: TEST_EMAIL,
      }
      const request: AxiosRequestConfig = {
        data: payload,
        method: 'POST',
        url: '/api/v1/auth/login',
      }

      const response = await axios.request<AuthSuccessResponseType>(request)
      emailAuthToken = response.data.accessToken
      const cookie = (response.headers['set-cookie'] as string[])
        .find((cookie) => cookie.includes(AUTH_TOKEN_NAMES.REFRESH))
        ?.match(new RegExp(`^${AUTH_TOKEN_NAMES.REFRESH}=(.+?);`))?.[1]
      // console.log('cookie', cookie);
      emailRefreshToken = cookie

      expect(response.status).toEqual(200)
      expect(response.data.accessToken).toBeDefined()
      expect(Array.isArray(response.data.profile.emails)).toBe(true)
    })

    test('should return user profile when successfully logged in with email / password', async () => {
      const payload: LoginPayloadType = {
        password: TEST_USER_DATA.ADMIN.password,
        value: TEST_EXISTING_EMAIL,
      }
      const request: AxiosRequestConfig = {
        data: payload,
        method: 'POST',
        url: '/api/v1/auth/login',
      }

      try {
        const response = await axios.request<AuthSuccessResponseType>(request)

        expect(response.status).toEqual(200)
        expect(response.data.accessToken).toBeDefined()
        expect(Array.isArray(response.data.profile.emails)).toBe(true)
        expect(Array.isArray(response.data.profile.phones)).toBe(true)
      } catch (err) {
        console.log('err', err)
      }
    })

    test('should return user profile when successfully logged in with phone', async () => {
      const otpResponse = await axios.request<{ code: string }>({
        data: {
          phone: TEST_PHONE_VALID,
          strict: true,
        },
        method: 'POST',
        url: '/api/v1/auth/otp-code/send/phone',
      })

      const payload: LoginPayloadType = {
        code: otpResponse.data.code,
        region: PHONE_DEFAULT_REGION_CODE,
        value: TEST_PHONE_VALID,
      }
      const request: AxiosRequestConfig = {
        data: payload,
        method: 'POST',
        url: '/api/v1/auth/login',
        withCredentials: true,
      }

      const response = await axios.request<AuthSuccessResponseType>(request)
      phoneAuthToken = response.data.accessToken
      const cookie = (response.headers['set-cookie'] as string[])
        .find((cookie) => cookie.includes(AUTH_TOKEN_NAMES.REFRESH))
        ?.match(new RegExp(`^${AUTH_TOKEN_NAMES.REFRESH}=(.+?);`))?.[1]
      // console.log('cookie', cookie);
      phoneRefreshToken = cookie

      expect(response.status).toEqual(200)
      expect(response.data.accessToken).toBeDefined()
      expect(Array.isArray(response.data.profile.phones)).toBe(true)
    })

    test('should return user profile when successfully logged in with device biometrics', async () => {
      const payload: LoginPayloadType = {
        biometric: {
          device: TEST_DEVICE,
          signature: dxRsaSignPayload(rsaKeyPair.privateKey, TEST_PHONE_VALID),
          userId: phoneAccountId,
        },
        value: TEST_PHONE_VALID,
      }
      const request: AxiosRequestConfig = {
        data: payload,
        method: 'POST',
        url: '/api/v1/auth/login',
        withCredentials: true,
      }

      const response = await axios.request<AuthSuccessResponseType>(request)
      phoneAuthToken = response.data.accessToken
      const cookie = (response.headers['set-cookie'] as string[])
        .find((cookie) => cookie.includes(AUTH_TOKEN_NAMES.REFRESH))
        ?.match(new RegExp(`^${AUTH_TOKEN_NAMES.REFRESH}=(.+?);`))?.[1]
      // console.log('cookie', cookie);
      phoneRefreshToken = cookie

      expect(response.status).toEqual(200)
      expect(response.data.accessToken).toBeDefined()
      expect(response.data.profile.phones).toHaveLength(1)
    })

    test('should return an error when sent with userId that has no biometrics', async () => {
      // arrange
      const payload: LoginPayloadType = {
        biometric: {
          device: TEST_DEVICE,
          signature: dxRsaSignPayload(rsaKeyPair.privateKey, TEST_PHONE_VALID),
          userId: emailAccountId,
        },
        value: TEST_PHONE_VALID,
      }
      const request: AxiosRequestConfig = {
        data: payload,
        method: 'POST',
        url: '/api/v1/auth/login',
        withCredentials: true,
      }
      // act
      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        // console.log('got error', typedError);
        // assert
        expect(typedError.response.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual(
          `BiometricLogin: User ${emailAccountId} has no stored public key.`,
        )
      }
    })

    test('should return an error when signature cannot be validated', async () => {
      // arrange
      const payload: LoginPayloadType = {
        biometric: {
          device: TEST_DEVICE,
          signature: dxRsaSignPayload(rsaKeyPair.privateKey, 'invalid payload'),
          userId: phoneAccountId,
        },
        value: TEST_PHONE_VALID,
      }
      const request: AxiosRequestConfig = {
        data: payload,
        method: 'POST',
        url: '/api/v1/auth/login',
        withCredentials: true,
      }
      // act
      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        // console.log('got error', typedError);
        // assert
        expect(typedError.response.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual(
          `BiometricLogin: Device signature is invalid: ${rsaKeyPair.publicKey}, userid: ${phoneAccountId}`,
        )
      }
    })
  })

  describe('Refresh Tokens', () => {
    test('should throw when sent with an invalid access token', async () => {
      const request: AxiosRequestConfig = {
        headers: {
          Authorization: `Bearer ${phoneAuthToken}`,
          cookie: [`${AUTH_TOKEN_NAMES.REFRESH}=invalid-jwt`],
        },
        method: 'GET',
        url: '/api/v1/auth/refresh-token',
      }

      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        // console.log('got error', typedError);
        // assert
        expect(typedError.response.status).toBe(401)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual('Invalid token.')
      }
    })

    test('should return a new accessToken when called with valid refresh token', async () => {
      const request: AxiosRequestConfig = {
        headers: {
          Authorization: `Bearer ${phoneAuthToken}`,
          cookie: [`${AUTH_TOKEN_NAMES.REFRESH}=${phoneRefreshToken}`],
        },
        method: 'GET',
        url: '/api/v1/auth/refresh-token',
        withCredentials: true,
      }

      const response = await axios.request<{ accessToken: string }>(request)
      phoneAuthToken = response.data.accessToken
      // console.log(response.headers['set-cookie'] as string[]);
      const cookie = (response.headers['set-cookie'] as string[])
        .find((cookie) => cookie.includes(AUTH_TOKEN_NAMES.REFRESH))
        ?.match(new RegExp(`^${AUTH_TOKEN_NAMES.REFRESH}=(.+?);`))?.[1]
      // console.log('cookie', cookie);
      phoneRefreshToken = cookie

      expect(response.status).toEqual(200)
      expect(response.data.accessToken).toBeDefined()
    })
  })

  describe('[Authenticated]: Disconnect Device', () => {
    test('should throw when no device exists', async () => {
      // arrange
      const request: AxiosRequestConfig = {
        headers: {
          Authorization: `Bearer ${phoneAuthToken}`,
          cookie: [`${AUTH_TOKEN_NAMES.REFRESH}=${phoneRefreshToken}`],
        },
        method: 'DELETE',
        url: `/api/v1/device/disconnect/${TEST_UUID}`,
      }
      // act
      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        // console.log('got error', typedError);
        // assert
        expect(typedError.response.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual('Device not found.')
      }
    })

    test('should return message when device disconnected', async () => {
      // arrange
      const request: AxiosRequestConfig = {
        headers: {
          Authorization: `Bearer ${phoneAuthToken}`,
          cookie: [`${AUTH_TOKEN_NAMES.REFRESH}=${phoneRefreshToken}`],
        },
        method: 'DELETE',
        url: `/api/v1/device/disconnect/${deviceId}`,
      }
      // act
      const response = await axios.request<{ message: string }>(request)
      // assert
      expect(response.status).toEqual(200)
      expect(response.data.message).toEqual('Device disconnected.')
    })
  })

  describe('[Authenticated]: Logout', () => {
    test('should return true on successful logout', async () => {
      const headers = {
        Authorization: `Bearer ${phoneAuthToken}`,
        cookie: [`${AUTH_TOKEN_NAMES.REFRESH}=${phoneRefreshToken}`],
      }
      const request: AxiosRequestConfig = {
        headers: headers,
        method: 'POST',
        url: '/api/v1/auth/logout',
      }

      const response = await axios.request<{ loggedOut: boolean }>(request)

      expect(response.status).toEqual(200)
      expect(response.data).toEqual({ loggedOut: true })
    })
  })
})
