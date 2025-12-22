import { APP_PREFIX } from '../config/config-shared.consts'

export const OTP_LENGTH = 6

export const ACCOUNT_RESTRICTIONS = {
  ADMIN_LOCKOUT: 'ADMIN_LOCKOUT',
  LOGIN_ATTEMPTS: 'LOGIN_ATTEMPTS',
  OTP_LOCKOUT: 'OTP_LOCKOUT',
}

export const AUTH_TOKEN_NAMES = {
  ACCTSECURE: `${APP_PREFIX}-accts`,
  AUTH: 'token',
  EXP: 'exp',
  REFRESH: 'jwt',
}

export const USER_LOOKUPS = {
  EMAIL: 'email',
  PHONE: 'phone',
}

export const TOKEN_TYPE = {
  ACCESS: 'access',
  REFRESH: 'refresh',
} as const
