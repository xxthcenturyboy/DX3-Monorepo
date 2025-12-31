import type { IZXCVBNResult } from 'zxcvbn-typescript'

import type {
  AccountCreationPayloadType,
  AuthSuccessResponseType,
  LoginPayloadType,
  LogoutResponse,
} from '@dx3/models-shared'

import type { CustomResponseErrorType } from '../data/rtk-query/axios-web.types'
import { apiWeb } from '../data/rtk-query/web.api'
import { getAuthApiErrors } from './auth-web-api-errors'

function transformAuthApiError(response: CustomResponseErrorType): CustomResponseErrorType {
  const AUTH_API_ERRORS = getAuthApiErrors()

  if (response.code === '100') {
    return {
      ...response,
      error: AUTH_API_ERRORS[response.code] || response.error,
    }
  }

  return response
}

export const apiWebAuth = apiWeb.injectEndpoints({
  endpoints: (build) => ({
    checkPasswordStrength: build.mutation<IZXCVBNResult, { password: string }>({
      query: (payload) => ({
        data: payload,
        method: 'POST',
        url: 'v1/auth/password-strength',
      }),
      transformErrorResponse: transformAuthApiError,
    }),
    createAccount: build.mutation<AuthSuccessResponseType, AccountCreationPayloadType>({
      query: (payload) => ({
        data: payload,
        method: 'POST',
        url: 'v1/auth/account',
      }),
      transformErrorResponse: transformAuthApiError,
    }),
    login: build.mutation<AuthSuccessResponseType, LoginPayloadType>({
      query: (payload) => ({
        data: payload,
        method: 'POST',
        url: 'v1/auth/login',
      }),
      transformErrorResponse: transformAuthApiError,
    }),
    logout: build.mutation<LogoutResponse, void>({
      query: () => ({
        method: 'POST',
        url: 'v1/auth/logout',
      }),
      transformErrorResponse: transformAuthApiError,
      transformResponse: (response: LogoutResponse) => {
        return response
      },
    }),
    otpRequestEmail: build.mutation<{ code?: string }, { email: string }>({
      query: (payload) => ({
        data: payload,
        method: 'POST',
        url: 'v1/auth/otp-code/send/email',
      }),
      transformErrorResponse: transformAuthApiError,
    }),
    otpRequestId: build.mutation<{ code?: string }, { id: string; type: 'PHONE' | 'EMAIL' }>({
      query: (payload) => ({
        data: payload,
        method: 'POST',
        url: 'v1/auth/otp-code/send/id',
      }),
      transformErrorResponse: transformAuthApiError,
    }),
    otpRequestPhone: build.mutation<{ code?: string }, { phone: string; regionCode?: string }>({
      query: (payload) => ({
        data: payload,
        method: 'POST',
        url: 'v1/auth/otp-code/send/phone',
      }),
      transformErrorResponse: transformAuthApiError,
    }),
  }),
  overrideExisting: false,
})

export const {
  useCheckPasswordStrengthMutation,
  useCreateAccountMutation,
  useLoginMutation,
  useLogoutMutation,
  useOtpRequestEmailMutation,
  useOtpRequestIdMutation,
  useOtpRequestPhoneMutation,
} = apiWebAuth
