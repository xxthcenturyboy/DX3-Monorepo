import { APP_PREFIX } from '../config/config-shared.consts'
import {
  ACCOUNT_RESTRICTIONS,
  AUTH_TOKEN_NAMES,
  OTP_LENGTH,
  USER_LOOKUPS,
} from './auth-shared.consts'

describe('ACCOUNT_RESTRICTIONS ', () => {
  // arrange
  // act
  // assert
  it('should exist when imported', () => {
    expect(ACCOUNT_RESTRICTIONS).toBeDefined()
  })

  it('should have correct value', () => {
    expect(ACCOUNT_RESTRICTIONS.ADMIN_LOCKOUT).toEqual('ADMIN_LOCKOUT')
    expect(ACCOUNT_RESTRICTIONS.LOGIN_ATTEMPTS).toEqual('LOGIN_ATTEMPTS')
    expect(ACCOUNT_RESTRICTIONS.OTP_LOCKOUT).toEqual('OTP_LOCKOUT')
  })
})

describe('ACCOUNT_RESTRICTIONS ', () => {
  // arrange
  // act
  // assert
  it('should exist when imported', () => {
    expect(ACCOUNT_RESTRICTIONS).toBeDefined()
  })

  it('should have correct value', () => {
    expect(ACCOUNT_RESTRICTIONS.ADMIN_LOCKOUT).toEqual('ADMIN_LOCKOUT')
    expect(ACCOUNT_RESTRICTIONS.LOGIN_ATTEMPTS).toEqual('LOGIN_ATTEMPTS')
    expect(ACCOUNT_RESTRICTIONS.OTP_LOCKOUT).toEqual('OTP_LOCKOUT')
  })
})

describe('AUTH_TOKEN_NAMES ', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(AUTH_TOKEN_NAMES).toBeDefined()
  })

  it('should have correct value', () => {
    // arrange
    // act
    // assert
    expect(AUTH_TOKEN_NAMES.AUTH).toEqual('token')
    expect(AUTH_TOKEN_NAMES.EXP).toEqual('exp')
    expect(AUTH_TOKEN_NAMES.REFRESH).toEqual('jwt')
    expect(AUTH_TOKEN_NAMES.ACCTSECURE).toEqual(`${APP_PREFIX}-accts`)
  })
})

describe('OTP_LENGTH ', () => {
  // arrange
  // act
  // assert
  it('should exist when imported', () => {
    expect(OTP_LENGTH).toBeDefined()
  })

  it('should have correct value', () => {
    expect(OTP_LENGTH).toEqual(6)
  })
})

describe('USER_LOOKUPS ', () => {
  // arrange
  // act
  // assert
  it('should exist when imported', () => {
    expect(USER_LOOKUPS).toBeDefined()
  })

  it('should have correct value', () => {
    expect(USER_LOOKUPS.EMAIL).toEqual('email')
    expect(USER_LOOKUPS.PHONE).toEqual('phone')
  })
})
