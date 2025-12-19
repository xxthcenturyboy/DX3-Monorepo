import axios, { type AxiosError, type AxiosRequestConfig } from 'axios'

import type { AuthSuccessResponseType, LoginPayloadType } from '@dx3/models-shared'
import { TEST_USER_DATA } from '@dx3/test-data'

export class AuthUtil {
  accessToken: string
  cookies: Record<string, string>
  cookeisRaw: string[]

  private setCookies(cookies: string[]) {
    this.cookeisRaw = cookies
    if (Array.isArray(cookies)) {
      for (const cookie of cookies) {
        const property = cookie.slice(0, cookie.indexOf('='))
        const value = cookie.slice(cookie.indexOf('=') + 1)
        this.cookies = {
          ...this.cookies,
          [property]: value,
        }
      }
    }
  }

  public async login(email?: string, password?: string): Promise<AuthSuccessResponseType> {
    const payload: LoginPayloadType = {
      // password: password || 'akjd0023kakdj_**_('
      password: password || TEST_USER_DATA.SUPERADMIN.password,
      value: email || TEST_USER_DATA.SUPERADMIN.email,
    }

    const request: AxiosRequestConfig = {
      data: payload,
      method: 'POST',
      url: '/api/v1/auth/login',
    }

    try {
      const response = await axios.request<AuthSuccessResponseType>(request)
      this.setCookies(response.headers['set-cookie'])
      this.accessToken = response.data.accessToken
      return response.data
    } catch (err) {
      const typedError = err as AxiosError
      if (typedError.response) {
        console.error(
          typedError.response.status,
          // @ts-expect-error - type is bad
          typedError.response.data.message,
        )
      }

      if (typedError.message) {
        console.error(500, typedError.message)
      }
    }

    return {
      accessToken: undefined,
      profile: undefined,
    }
  }

  public async loginEmalPasswordless(
    email: string,
    code: string,
  ): Promise<AuthSuccessResponseType> {
    const request: AxiosRequestConfig = {
      data: {
        code: code,
        value: email,
      },
      method: 'POST',
      url: '/api/v1/auth/login',
    }

    try {
      const response = await axios.request<AuthSuccessResponseType>(request)
      this.setCookies(response.headers['set-cookie'])
      this.accessToken = response.data.accessToken
      return response.data
    } catch (err) {
      const typedError = err as AxiosError
      if (typedError.response) {
        console.error(
          typedError.response.status,
          // @ts-expect-error - type is bad
          typedError.response.data.message,
        )
      }

      if (typedError.message) {
        console.error(500, typedError.message)
      }
    }

    return {
      accessToken: undefined,
      profile: undefined,
    }
  }

  public getHeaders() {
    return {
      Authorization: `Bearer ${this.accessToken}`,
      cookie: this.cookeisRaw,
    }
  }
}

export type AuthUtilType = typeof AuthUtil.prototype
