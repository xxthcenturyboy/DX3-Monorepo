import axios, { type AxiosError, type AxiosRequestConfig, type AxiosResponse } from 'axios'

import type {
  CreateUserResponseType,
  GetUserListResponseType,
  GetUserProfileReturnType,
  GetUserResponseType,
  OtpResponseType,
  UpdatePasswordPayloadType,
  UpdateUsernamePayloadType,
  UpdateUserPayloadType,
  UpdateUserResponseType,
  UserProfileStateType,
} from '@dx3/models-shared'
import { TEST_EXISTING_USER_ID, TEST_USER_CREATE, TEST_USER_DATA, TEST_UUID } from '@dx3/test-data'

import { getGlobalAuthHeaders } from '../../support/test-setup'
import type { AuthUtilType } from '../auth/auth-util-v1'
import { AuthUtil } from '../auth/auth-util-v1'

describe('v1 User Routes', () => {
  let workingUserId: string

  describe('GET /api/v1/user/check/availabilty', () => {
    test('should return available = true when username is available', async () => {
      const request: AxiosRequestConfig = {
        headers: getGlobalAuthHeaders(),
        method: 'GET',
        url: `/api/v1/user/check/availabilty?username=usernameNotInSystem`,
        withCredentials: true,
      }

      const result = await axios.request<AxiosRequestConfig, AxiosResponse<{ available: boolean }>>(
        request,
      )

      expect(result.status).toBe(200)
      expect(result.data.available).toBe(true)
    })

    test('should return available = false when username is not available', async () => {
      const request: AxiosRequestConfig = {
        headers: getGlobalAuthHeaders(),
        method: 'GET',
        url: `/api/v1/user/check/availabilty?username=admin`,
        withCredentials: true,
      }

      const result = await axios.request<AxiosRequestConfig, AxiosResponse<{ available: boolean }>>(
        request,
      )

      expect(result.status).toBe(200)
      expect(result.data.available).toBe(false)
    })

    test('should return an error when username is profane', async () => {
      const request: AxiosRequestConfig = {
        headers: getGlobalAuthHeaders(),
        method: 'GET',
        url: `/api/v1/user/check/availabilty?username=asshole`,
        withCredentials: true,
      }

      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        // assert
        expect(typedError.response.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual('Profanity is not allowed')
      }
    })
  })

  describe('GET /api/v1/user/list', () => {
    test('should return an array of users when called', async () => {
      const request: AxiosRequestConfig = {
        headers: getGlobalAuthHeaders(),
        method: 'GET',
        url: '/api/v1/user/list',
        withCredentials: true,
      }

      const result = await axios.request<
        AxiosRequestConfig,
        AxiosResponse<GetUserListResponseType>
      >(request)

      expect(result.status).toBe(200)
      expect(result.data.count).toBeTruthy()
      expect(Array.isArray(result.data.rows)).toBe(true)
      expect(result.data.rows.length).toBeGreaterThan(0)
    })
  })

  describe('GET /api/v1/user/user/:id', () => {
    test('should return a user when called', async () => {
      const request: AxiosRequestConfig = {
        headers: getGlobalAuthHeaders(),
        method: 'GET',
        url: `/api/v1/user/user/${TEST_EXISTING_USER_ID}`,
        withCredentials: true,
      }

      const result = await axios.request<AxiosRequestConfig, AxiosResponse<GetUserResponseType>>(
        request,
      )

      expect(result.status).toBe(200)
      expect(result.data.id).toEqual(TEST_EXISTING_USER_ID)
    })

    test('should return an error when queried with an id for a non-existent user', async () => {
      const request: AxiosRequestConfig = {
        headers: getGlobalAuthHeaders(),
        method: 'GET',
        url: `/api/v1/user/user/${TEST_UUID}`,
        withCredentials: true,
      }

      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        // assert
        expect(typedError.response.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual('Search for user failed.')
      }
    })
  })

  describe('GET /api/v1/user/profile', () => {
    test('should return a profile when called', async () => {
      const request: AxiosRequestConfig = {
        headers: getGlobalAuthHeaders(),
        method: 'GET',
        url: `/api/v1/user/profile`,
        withCredentials: true,
      }

      const result = await axios.request<
        AxiosRequestConfig,
        AxiosResponse<GetUserProfileReturnType>
      >(request)

      expect(result.status).toBe(200)
      expect((result.data.profile as UserProfileStateType).id).toEqual(TEST_USER_DATA.SUPERADMIN.id)
    })
  })

  describe('POST /api/v1/user', () => {
    test('should create a user when called', async () => {
      const request: AxiosRequestConfig = {
        data: TEST_USER_CREATE,
        headers: getGlobalAuthHeaders(),
        method: 'POST',
        url: `/api/v1/user`,
        withCredentials: true,
      }

      const result = await axios.request<AxiosRequestConfig, AxiosResponse<CreateUserResponseType>>(
        request,
      )

      expect(result.status).toBe(200)
      expect(result.data.id).toBeDefined()

      workingUserId = result.data.id
    })

    test('should return an error when no email is sent', async () => {
      const request: AxiosRequestConfig = {
        data: {
          ...TEST_USER_CREATE,
          email: '',
          username: '',
        },
        headers: getGlobalAuthHeaders(),
        method: 'POST',
        url: `/api/v1/user`,
        withCredentials: true,
      }

      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        // assert
        expect(typedError.response.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual('Not enough information to create a user.')
      }
    })
  })

  describe('POST /api/v1/user/send-otp-code', () => {
    test('should send an otp via email when called', async () => {
      const request: AxiosRequestConfig = {
        headers: getGlobalAuthHeaders(),
        method: 'POST',
        url: `/api/v1/user/send-otp-code`,
        withCredentials: true,
      }

      const result = await axios.request<AxiosRequestConfig, AxiosResponse<OtpResponseType>>(
        request,
      )

      expect(result.status).toBe(200)
      expect(result.data.code).toBeDefined()
      expect(typeof result.data.code === 'string').toBe(true)
    })
  })

  describe('PUT /api/v1/user/:id', () => {
    test('should update a user when called', async () => {
      const payload: UpdateUserPayloadType = {
        firstName: 'John',
        id: workingUserId,
        lastName: 'Hancock',
      }
      const request: AxiosRequestConfig = {
        data: payload,
        headers: getGlobalAuthHeaders(),
        method: 'PUT',
        url: `/api/v1/user/${workingUserId}`,
        withCredentials: true,
      }

      const result = await axios.request<AxiosRequestConfig, AxiosResponse<UpdateUserResponseType>>(
        request,
      )

      expect(result.status).toBe(200)
      expect(result.data.userId).toEqual(workingUserId)
    })
  })

  describe('PUT /api/v1/user/roles-restrictions/:id', () => {
    test('should update user role when called', async () => {
      const payload: UpdateUserPayloadType = {
        id: workingUserId,
        roles: ['USER'],
      }
      const request: AxiosRequestConfig = {
        data: payload,
        headers: getGlobalAuthHeaders(),
        method: 'PUT',
        url: `/api/v1/user/roles-restrictions/${workingUserId}`,
        withCredentials: true,
      }

      const result = await axios.request<AxiosRequestConfig, AxiosResponse<UpdateUserResponseType>>(
        request,
      )

      expect(result.status).toBe(200)
      expect(result.data.userId).toEqual(workingUserId)
    })
  })

  describe('PUT /api/v1/user/update/username/:id', () => {
    test('should update the username when called', async () => {
      const otpResponse = await axios.request<{ code: string }>({
        data: {
          email: TEST_USER_CREATE.email,
        },
        method: 'POST',
        url: '/api/v1/auth/otp-code/send/email',
      })
      // Create a separate auth instance for this test user
      const testUserAuthUtil = new AuthUtil()
      await testUserAuthUtil.loginEmalPasswordless(TEST_USER_CREATE.email, otpResponse.data.code)

      const otpRes = await axios.request<AxiosRequestConfig, AxiosResponse<OtpResponseType>>({
        headers: {
          ...testUserAuthUtil.getHeaders(),
        },
        method: 'POST',
        url: `/api/v1/user/send-otp-code`,
        withCredentials: true,
      })

      const payload: UpdateUsernamePayloadType = {
        otpCode: otpRes.data.code,
        username: 'test-username',
      }
      const request: AxiosRequestConfig = {
        data: payload,
        headers: {
          ...testUserAuthUtil.getHeaders(),
        },
        method: 'PUT',
        url: `/api/v1/user/update/username/${workingUserId}`,
        withCredentials: true,
      }

      const result = await axios.request<AxiosRequestConfig, AxiosResponse<UpdateUserResponseType>>(
        request,
      )

      expect(result.status).toBe(200)
      expect(result.data.userId).toEqual(workingUserId)
    })
  })

  describe('PUT /api/v1/user/update/password', () => {
    let authUtilUpdate: AuthUtilType
    let phoneId = ''
    let otpCode = ''
    const validPw1 = 'akjd0023kakdj_**_('

    beforeAll(async () => {
      const otpResponse = await axios.request<{ code: string }>({
        data: {
          email: TEST_USER_CREATE.email,
        },
        method: 'POST',
        url: '/api/v1/auth/otp-code/send/email',
      })
      authUtilUpdate = new AuthUtil()
      const authResponse = await authUtilUpdate.loginEmalPasswordless(
        TEST_USER_CREATE.email,
        otpResponse.data.code,
      )
      phoneId = authResponse.profile.phones.find((phone) => phone.default).id
    })

    beforeEach(async () => {
      const otpResponse = await axios.request<AxiosRequestConfig, AxiosResponse<OtpResponseType>>({
        headers: {
          ...authUtilUpdate.getHeaders(),
        },
        method: 'POST',
        url: `/api/v1/user/send-otp-code`,
        withCredentials: true,
      })
      otpCode = otpResponse.data.code
    })

    test('should update the users password when called', async () => {
      const payload: UpdatePasswordPayloadType = {
        id: workingUserId,
        otp: {
          code: otpCode,
          id: phoneId,
          method: 'PHONE',
        },
        password: validPw1,
        passwordConfirm: validPw1,
      }
      const request: AxiosRequestConfig = {
        data: payload,
        headers: getGlobalAuthHeaders(),
        method: 'PUT',
        url: `/api/v1/user/update/password`,
        withCredentials: true,
      }

      const result = await axios.request<AxiosRequestConfig, AxiosResponse<{ success: boolean }>>(
        request,
      )

      expect(result.status).toBe(200)
      expect(result.data.success).toBe(true)
    })

    test('should return an error when incomplete data is sent', async () => {
      const payload: UpdatePasswordPayloadType = {
        id: workingUserId,
        otp: {
          code: otpCode,
          id: '',
          method: 'EMAIL',
        },
        password: '',
        passwordConfirm: '',
      }
      const request: AxiosRequestConfig = {
        data: payload,
        headers: {
          ...authUtilUpdate.getHeaders(),
        },
        method: 'PUT',
        url: `/api/v1/user/update/password`,
        withCredentials: true,
      }

      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        // assert
        expect(typedError.response.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual('Request is invalid.')
      }
    })

    test('should return an error when password is weak', async () => {
      const payload: UpdatePasswordPayloadType = {
        id: workingUserId,
        otp: {
          code: otpCode,
          id: phoneId,
          method: 'PHONE',
        },
        password: 'password',
        passwordConfirm: 'password',
      }
      const request: AxiosRequestConfig = {
        data: payload,
        headers: {
          ...authUtilUpdate.getHeaders(),
        },
        method: 'PUT',
        url: `/api/v1/user/update/password`,
        withCredentials: true,
      }

      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        // assert
        expect(typedError.response.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toContain('Please choose a stronger password')
      }
    })
  })

  describe('DELETE /api/v1/user', () => {
    test('should delete a user when called', async () => {
      const request: AxiosRequestConfig = {
        headers: getGlobalAuthHeaders(),
        method: 'DELETE',
        url: `/api/v1/user/${workingUserId}`,
        withCredentials: true,
      }

      const result = await axios.request<AxiosRequestConfig, AxiosResponse<{ userId: string }>>(
        request,
      )

      expect(result.status).toBe(200)
      expect(result.data.userId).toEqual(workingUserId)
    })

    test('should permanently delete a user when called', async () => {
      const request: AxiosRequestConfig = {
        headers: getGlobalAuthHeaders(),
        method: 'DELETE',
        url: `/api/v1/user/test/${workingUserId}`,
        withCredentials: true,
      }

      const result = await axios.request<AxiosRequestConfig, AxiosResponse<void>>(request)

      expect(result.status).toBe(200)
    })
  })
})
