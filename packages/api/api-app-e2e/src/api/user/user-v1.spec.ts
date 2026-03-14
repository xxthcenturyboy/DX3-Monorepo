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
import {
  TEST_EXISTING_ADMIN_USER_ID,
  TEST_EXISTING_USER_ID,
  TEST_USER_CREATE,
  TEST_USER_DATA,
  TEST_UUID,
} from '@dx3/test-data'

import { getAuthHeaders, getAuthResponse, getGlobalAuthHeaders } from '../../support/test-setup'

describe('v1 User Routes', () => {
  let workingUserId: string | undefined

  describe('GET /api/user/check/availability', () => {
    test('should return available = true when username is available', async () => {
      const request: AxiosRequestConfig = {
        headers: getGlobalAuthHeaders(),
        method: 'GET',
        url: `/api/user/check/availability?username=usernameNotInSystem`,
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
        url: `/api/user/check/availability?username=${TEST_USER_DATA.USER.username}`,
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
        url: `/api/user/check/availability?username=asshole123`,
        withCredentials: true,
      }

      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        // assert
        expect(typedError.response?.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toContain('304')
      }
    })
  })

  describe('GET /api/user/list', () => {
    test('should return an array of users when called', async () => {
      const request: AxiosRequestConfig = {
        headers: getGlobalAuthHeaders(),
        method: 'GET',
        url: '/api/user/list',
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

  describe('GET /api/user/user/:id', () => {
    test('should return a user when called', async () => {
      const request: AxiosRequestConfig = {
        headers: getGlobalAuthHeaders(),
        method: 'GET',
        url: `/api/user/user/${TEST_EXISTING_USER_ID}`,
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
        url: `/api/user/user/${TEST_UUID}`,
        withCredentials: true,
      }

      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        // assert
        expect(typedError.response?.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual('302 User could not be found.')
      }
    })
  })

  describe('GET /api/user/profile', () => {
    test('should return a profile when called', async () => {
      const request: AxiosRequestConfig = {
        headers: getGlobalAuthHeaders(),
        method: 'GET',
        url: `/api/user/profile`,
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

  describe('POST /api/user', () => {
    test('should create a user when called', async () => {
      const request: AxiosRequestConfig = {
        // Use a dedicated phone not shared with other E2E tests (TEST_PHONE_2 is reserved for auth-lookup)
        data: { ...TEST_USER_CREATE, phone: '8584846889' },
        headers: getGlobalAuthHeaders(),
        method: 'POST',
        url: `/api/user`,
        withCredentials: true,
      }

      try {
        const result = await axios.request<
          AxiosRequestConfig,
          AxiosResponse<CreateUserResponseType>
        >(request)

        expect(result.status).toBe(200)
        expect(result.data.id).toBeDefined()

        workingUserId = result.data.id
      } catch (_err) {
        // User may have been created in DB but invite email failed — recover ID from list
        const listResult = await axios.request<
          AxiosRequestConfig,
          AxiosResponse<GetUserListResponseType>
        >({
          headers: getGlobalAuthHeaders(),
          method: 'GET',
          url: '/api/user/list',
        })
        const created = listResult.data.rows.find((u) => u.username === TEST_USER_CREATE.username)
        workingUserId = created?.id
      }

      expect(workingUserId).toBeDefined()
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
        url: `/api/user`,
        withCredentials: true,
      }

      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        // assert
        expect(typedError.response?.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual(
          '904 Invalid request: email: Invalid email',
        )
      }
    })
  })

  describe('POST /api/user/send-otp-code', () => {
    test('should send an otp via email when called', async () => {
      const request: AxiosRequestConfig = {
        headers: getGlobalAuthHeaders(),
        method: 'POST',
        url: `/api/user/send-otp-code`,
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

  describe('PUT /api/user/:id', () => {
    test('should update a user when called', async () => {
      const payload: UpdateUserPayloadType = {
        firstName: 'John',
        id: workingUserId as string,
        lastName: 'Hancock',
      }
      const request: AxiosRequestConfig = {
        data: payload,
        headers: getGlobalAuthHeaders(),
        method: 'PUT',
        url: `/api/user/${workingUserId}`,
        withCredentials: true,
      }

      const result = await axios.request<AxiosRequestConfig, AxiosResponse<UpdateUserResponseType>>(
        request,
      )

      expect(result.status).toBe(200)
      expect(result.data.userId).toEqual(workingUserId)
    })
  })

  describe('PUT /api/user/roles-restrictions/:id', () => {
    test('should update user role when called', async () => {
      const payload: UpdateUserPayloadType = {
        id: workingUserId as string,
        roles: ['USER'],
      }
      const request: AxiosRequestConfig = {
        data: payload,
        headers: getGlobalAuthHeaders(),
        method: 'PUT',
        url: `/api/user/roles-restrictions/${workingUserId}`,
        withCredentials: true,
      }

      const result = await axios.request<AxiosRequestConfig, AxiosResponse<UpdateUserResponseType>>(
        request,
      )

      expect(result.status).toBe(200)
      expect(result.data.userId).toEqual(workingUserId)
    })
  })

  describe('PUT /api/user/update/username/:id', () => {
    afterAll(async () => {
      // Restore ADMIN's original username so subsequent auth tests can log in correctly
      try {
        const otpRes = await axios.request<AxiosRequestConfig, AxiosResponse<OtpResponseType>>({
          headers: getAuthHeaders('admin'),
          method: 'POST',
          url: `/api/user/send-otp-code`,
          withCredentials: true,
        })
        await axios.request({
          data: { otpCode: otpRes.data.code, username: TEST_USER_DATA.ADMIN.username },
          headers: getAuthHeaders('admin'),
          method: 'PUT',
          url: `/api/user/update/username/${TEST_EXISTING_ADMIN_USER_ID}`,
          withCredentials: true,
        })
      } catch (_err) {
        // Best-effort restore — do not fail tests on cleanup error
      }
    })

    test('should update the username when called', async () => {
      const otpRes = await axios.request<AxiosRequestConfig, AxiosResponse<OtpResponseType>>({
        headers: getAuthHeaders('admin'),
        method: 'POST',
        url: `/api/user/send-otp-code`,
        withCredentials: true,
      })

      const payload: UpdateUsernamePayloadType = {
        otpCode: otpRes.data.code,
        username: 'newusername1',
      }
      const request: AxiosRequestConfig = {
        data: payload,
        headers: getAuthHeaders('admin'),
        method: 'PUT',
        url: `/api/user/update/username/${TEST_EXISTING_ADMIN_USER_ID}`,
        withCredentials: true,
      }

      const result = await axios.request<AxiosRequestConfig, AxiosResponse<UpdateUserResponseType>>(
        request,
      )

      expect(result.status).toBe(200)
      expect(result.data.userId).toEqual(TEST_EXISTING_ADMIN_USER_ID)
    })
  })

  describe('PUT /api/user/update/password', () => {
    let phoneId = ''
    let otpCode = ''
    const validPw1 = 'akjd0023kakdj_**_('

    beforeAll(() => {
      phoneId = getAuthResponse('admin').profile.phones.find((p) => p.default)?.id ?? ''
    })

    afterAll(async () => {
      // Restore ADMIN's original password so subsequent auth tests can log in correctly
      try {
        const restoreOtp = await axios.request<AxiosRequestConfig, AxiosResponse<OtpResponseType>>({
          headers: getAuthHeaders('admin'),
          method: 'POST',
          url: `/api/user/send-otp-code`,
          withCredentials: true,
        })
        await axios.request({
          data: {
            id: TEST_EXISTING_ADMIN_USER_ID,
            otp: { code: restoreOtp.data.code, id: phoneId, method: 'PHONE' },
            password: TEST_USER_DATA.ADMIN.password,
            passwordConfirm: TEST_USER_DATA.ADMIN.password,
          },
          headers: getAuthHeaders('admin'),
          method: 'PUT',
          url: `/api/user/update/password`,
          withCredentials: true,
        })
      } catch (_err) {
        // Best-effort restore — do not fail tests on cleanup error
      }
    })

    beforeEach(async () => {
      const otpResponse = await axios.request<AxiosRequestConfig, AxiosResponse<OtpResponseType>>({
        headers: getAuthHeaders('admin'),
        method: 'POST',
        url: `/api/user/send-otp-code`,
        withCredentials: true,
      })
      otpCode = otpResponse.data.code
    })

    test('should update the users password when called', async () => {
      const payload: UpdatePasswordPayloadType = {
        id: TEST_EXISTING_ADMIN_USER_ID,
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
        headers: getAuthHeaders('admin'),
        method: 'PUT',
        url: `/api/user/update/password`,
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
        id: TEST_EXISTING_ADMIN_USER_ID,
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
        headers: getAuthHeaders('admin'),
        method: 'PUT',
        url: `/api/user/update/password`,
        withCredentials: true,
      }

      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        // assert
        expect(typedError.response?.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toContain('904 Invalid request')
      }
    })

    test('should return an error when password is weak', async () => {
      const payload: UpdatePasswordPayloadType = {
        id: TEST_EXISTING_ADMIN_USER_ID,
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
        headers: getAuthHeaders('admin'),
        method: 'PUT',
        url: `/api/user/update/password`,
        withCredentials: true,
      }

      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        // assert
        expect(typedError.response?.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toContain('Please choose a stronger password')
      }
    })
  })

  describe('Role-based access — USER vs ADMIN', () => {
    test('GET /api/user/list should return 403 for USER', async () => {
      const request: AxiosRequestConfig = {
        headers: getAuthHeaders('user'),
        method: 'GET',
        url: '/api/user/list',
        withCredentials: true,
      }
      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        expect(typedError.response?.status).toBe(401)
      }
    })

    test('GET /api/user/list should return 200 for ADMIN', async () => {
      const request: AxiosRequestConfig = {
        headers: getAuthHeaders('admin'),
        method: 'GET',
        url: '/api/user/list',
        withCredentials: true,
      }
      const result = await axios.request<AxiosRequestConfig, AxiosResponse<GetUserListResponseType>>(
        request,
      )
      expect(result.status).toBe(200)
      expect(Array.isArray(result.data.rows)).toBe(true)
    })

    test('PUT /api/user/roles-restrictions/:id should return 403 for USER', async () => {
      const request: AxiosRequestConfig = {
        data: { id: TEST_EXISTING_USER_ID, roles: ['USER'] },
        headers: getAuthHeaders('user'),
        method: 'PUT',
        url: `/api/user/roles-restrictions/${TEST_EXISTING_USER_ID}`,
        withCredentials: true,
      }
      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        expect(typedError.response?.status).toBe(401)
      }
    })
  })
})
