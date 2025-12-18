import { v4 as uuidv4 } from 'uuid'

import {
  regexEmail,
  regexNoWhiteSpaceString,
  regexPhone,
  regexPhoneUS,
  regexPostgresUrl,
  regexUuid,
} from './regex-patterns'

describe('regexEmail', () => {
  // arrange
  const email = 'my-email@my-domain.com'
  const nonEmail = 'not-an-email'
  // act
  const validTest = regexEmail.test(email)
  const invalidTest = regexEmail.test(nonEmail)
  // assert
  it('should exist when imported', () => {
    expect(regexEmail).toBeDefined()
  })
  it('should return true when tested against a valid email', () => {
    expect(validTest).toBeTruthy()
  })
  it('should return false when tested against an invalid email', () => {
    expect(invalidTest).toBeFalsy()
  })
})

describe('regexNoWhiteSpaceString', () => {
  // arrange
  const stringWithWhiteSpace = 'no-whitespace'
  const stringWithoutWhiteSpace = 'this is full of gaps'
  // act
  const validTest = regexNoWhiteSpaceString.test(stringWithWhiteSpace)
  const invalidTest = regexNoWhiteSpaceString.test(stringWithoutWhiteSpace)
  // assert
  it('should exist when imported', () => {
    expect(regexEmail).toBeDefined()
  })
  it('should return true when tested against a valid string', () => {
    expect(validTest).toBeTruthy()
  })
  it('should return false when tested against an invalid string', () => {
    expect(invalidTest).toBeFalsy()
  })
})

describe('regexPhone', () => {
  // arrange
  const validPhone = '1234567890'
  const invalidPhone = '1234567890123'
  // act
  const validTest = regexPhone.test(validPhone)
  const invalidTest = regexPhone.test(invalidPhone)
  // assert
  it('should exist when imported', () => {
    expect(regexEmail).toBeDefined()
  })
  it('should return true when tested against a valid phone', () => {
    expect(validTest).toBeTruthy()
  })
  it('should return false when tested against an invalid phone', () => {
    expect(invalidTest).toBeFalsy()
  })
})

describe('regexPhoneUS', () => {
  // arrange
  const validPhone = '(123) 456-7890'
  const invalidPhone = '123456789'
  // act
  const validTest = regexPhoneUS.test(validPhone)
  const invalidTest = regexPhoneUS.test(invalidPhone)
  // assert
  it('should exist when imported', () => {
    expect(regexEmail).toBeDefined()
  })
  it('should return true when tested against a valid phone', () => {
    expect(validTest).toBeTruthy()
  })
  it('should return false when tested against an invalid phone', () => {
    expect(invalidTest).toBeFalsy()
  })
})

describe('regexPostgresUrl', () => {
  // arrange
  const validUrl = 'postgres://pguser:password@postgres:5432/app'
  // act
  const matching = validUrl.match(regexPostgresUrl)
  // assert
  it('should exist when imported', () => {
    expect(regexEmail).toBeDefined()
  })
  it('should return an array of length 9 when matched', () => {
    expect(Array.isArray(matching)).toBeTruthy()
    expect(matching.length === 6).toBeTruthy()
  })
  it('should have correct values at indexes when matched', () => {
    expect(matching[0] === validUrl).toBeTruthy()
    expect(matching[1] === 'postgres').toBeTruthy()
    expect(matching[2] === 'pguser:password').toBeTruthy()
    expect(matching[3] === 'postgres:5432').toBeTruthy()
    expect(matching[4] === 'app').toBeTruthy()
    expect(matching[5]).toBeUndefined()
  })
})

describe('regexUuid', () => {
  // arrange
  const uuid = uuidv4()
  const nonUuid = 'someRandomString'
  // act
  const validTest = regexUuid.test(uuid)
  const invalidTest = regexUuid.test(nonUuid)
  // assert
  it('should exist when imported', () => {
    expect(regexUuid).toBeDefined()
  })
  it('should return true when tested against a valid UUID', () => {
    expect(validTest).toBeTruthy()
  })
  it('should return false when tested against an invalid UUID', () => {
    expect(invalidTest).toBeFalsy()
  })
})
