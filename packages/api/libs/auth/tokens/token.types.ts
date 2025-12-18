import type { ManipulateType } from 'dayjs'

export type RefreshCacheType = {
  [token: string]: boolean
}

export type GenerateTokenResponse = {
  accessToken: string
  accessTokenExp: number
  refreshToken: string
  refreshTokenExp: number
}

export type TokenExpiration = {
  time: number
  unit: ManipulateType
  addSub: 'ADD' | 'SUB'
}

export type GenerateTokenParams = {
  accessToken?: TokenExpiration
  refreshToken?: TokenExpiration
}
