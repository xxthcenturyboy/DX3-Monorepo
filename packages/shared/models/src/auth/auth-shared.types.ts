import type { ManipulateType } from 'dayjs'

import type { DeviceAuthType } from '../devices/device-shared.types'
import type { UserProfileStateType } from '../user/user-shared.types'
import type { TOKEN_TYPE } from './auth-shared.consts'

export type AccountCreationPayloadType = {
  code: string
  device?: DeviceAuthType
  region?: string
  value: string
}

export type AuthSuccessResponseType = {
  accessToken: string
  profile: UserProfileStateType
}

export type BiometricLoginParamType = {
  signature: string
  userId: string
  device: DeviceAuthType | null
}

export type BiometricAuthType = {
  signature: string
  payload: string
  userId: string
  device: DeviceAuthType | null
}

export type GenerateTokenParams = {
  accessToken?: TokenExpiration
  refreshToken?: TokenExpiration
}

export type GenerateTokenResponse = {
  accessToken: string
  accessTokenExp: number
  refreshToken: string
  refreshTokenExp: number
}

export type JwtPayloadType = {
  _id: string
  exp: number
  issuer: string
  type: TokenTypeType
}

export type LoginPayloadType = {
  value: string
  biometric?: BiometricLoginParamType
  code?: string
  region?: string
  password?: string
}

export type LogoutResponse = { loggedOut: boolean }

export type OtpResponseType = {
  code: string
}

export type OtpLockoutResponseType = {
  locked: boolean
}

export type RefreshCacheType = {
  [token: string]: boolean
}

export type TokenExpiration = {
  time: number
  unit: ManipulateType
  addSub: 'ADD' | 'SUB'
}

export type UserLookupResponseType = {
  available: boolean
}

export type UserLookupQueryType = {
  type: string
  value: string
  code?: string
  region?: string
}

export type TokenTypeType = (typeof TOKEN_TYPE)[keyof typeof TOKEN_TYPE]
