import { APP_DOMAIN } from '@dx3/models-shared'
import { TEST_EMAIL } from '@dx3/test-data'

import { ApiLoggingClass } from '../../../logger'
import { EmailUtil, type EmailUtilType } from './email.util'

describe('email.util', () => {
  let emailUtil: EmailUtilType

  beforeAll(() => {
    new ApiLoggingClass({ appName: 'test' })
  })

  test('should invalidate a bogus email', () => {
    // arrange
    emailUtil = new EmailUtil('not-an-email')
    // act
    const isValid = emailUtil.validate()
    // assert
    expect(isValid).toBe(false)
  })

  test('should invalidate a blacklisted domain', () => {
    // arrange
    emailUtil = new EmailUtil(`any@027168.com`)
    // act
    const isValid = emailUtil.validate()
    // assert
    expect(isValid).toBe(false)
  })

  test('should invalidate an email with restricted name', () => {
    // arrange
    emailUtil = new EmailUtil(`admin@email.com`)
    // act
    const isValid = emailUtil.validate()
    // assert
    expect(isValid).toBe(false)
  })

  test('should flag an email with potentially bad gmail', async () => {
    // arrange
    emailUtil = new EmailUtil(`d.j.u@gmail.com`)
    // act
    const isValid = emailUtil.validate()
    const isBadGmail = await emailUtil.isMaybeBadGmail()
    // assert
    expect(isValid).toBe(true)
    expect(isBadGmail).toBe(true)
    expect(emailUtil.countOfDotsInName()).toEqual(2)
  })

  test('should strip all + symbols from an email', () => {
    // arrange
    emailUtil = new EmailUtil(`dan+2@gmail.com`)
    // act
    const isValid = emailUtil.validate()
    // assert
    expect(isValid).toBe(true)
    expect(emailUtil.formattedEmail()).toEqual('dan@gmail.com')
  })

  test('should validate a whitelisted email', () => {
    // arrange
    emailUtil = new EmailUtil(`admin@${APP_DOMAIN}`)
    // act
    const isValid = emailUtil.validate()
    // assert
    expect(isValid).toBe(true)
  })

  test('should validate a valid email', () => {
    // arrange
    emailUtil = new EmailUtil(TEST_EMAIL)
    // act
    const isValid = emailUtil.validate()
    // assert
    expect(isValid).toBe(true)
  })

  test('should invalidate email with consecutive dots', () => {
    // arrange
    emailUtil = new EmailUtil('test..user@gmail.com')
    // act
    const hasConsecutiveDots = emailUtil.hasConsecutiveDots()
    const formattedName = emailUtil.formattedName()
    // assert
    expect(hasConsecutiveDots).toBe(true)
    expect(formattedName).toBe('testuser')
  })

  test('should strip dots from name', () => {
    // arrange
    emailUtil = new EmailUtil('test.user@gmail.com')
    // act
    const strippedName = emailUtil.strippedName()
    // assert
    expect(strippedName).toBe('testuser')
  })

  test('should return stripped email for indexing', () => {
    // arrange
    emailUtil = new EmailUtil('test.user+tag@gmail.com')
    // act
    const strippedEmail = emailUtil.strippedEmailForIndex()
    // assert
    expect(strippedEmail).toBe('testuser@gmail.com')
  })

  test('should preserve dx3_ aliases', () => {
    // arrange
    emailUtil = new EmailUtil('test+dx3_1234@gmail.com')
    // act
    const formatted = emailUtil.formattedEmail()
    // assert
    expect(formatted).toBe('test+dx3_1234@gmail.com')
  })

  test('should strip regular aliases', () => {
    // arrange
    emailUtil = new EmailUtil('test+sometag@gmail.com')
    // act
    const formatted = emailUtil.formattedEmail()
    // assert
    expect(formatted).toBe('test@gmail.com')
  })

  test('should recover common provider domains', () => {
    // arrange
    emailUtil = new EmailUtil('test@gmail.co')
    // act
    emailUtil.recoverDomain()
    const formatted = emailUtil.formattedEmail()
    // assert
    expect(emailUtil.recoveredDomain).toBe('gmail.com')
    expect(formatted).toBe('test@gmail.com')
  })

  test('should recover gmx.us domain correctly', () => {
    // arrange
    emailUtil = new EmailUtil('test@gmx.us')
    // act
    emailUtil.recoverDomain()
    // assert
    expect(emailUtil.recoveredDomain).toBe('gmx.us')
  })

  test('should invalidate email with only numbers as name', () => {
    // arrange
    emailUtil = new EmailUtil('123456@gmail.com')
    // act
    const isValid = emailUtil.validate()
    // assert
    expect(isValid).toBe(false)
    expect(emailUtil.isNumbers).toBe(true)
  })

  test('should invalidate email that is too long', () => {
    // arrange
    const longEmail = `${'a'.repeat(256)}@gmail.com`
    emailUtil = new EmailUtil(longEmail)
    // act
    const isValid = emailUtil.validate()
    // assert
    expect(isValid).toBe(false)
  })

  test('should invalidate email with name part too long', () => {
    // arrange
    const longName = 'a'.repeat(65)
    emailUtil = new EmailUtil(`${longName}@gmail.com`)
    // act
    const isValid = emailUtil.validate()
    // assert
    expect(isValid).toBe(false)
  })

  test('should invalidate email with domain part too long', () => {
    // arrange
    const longDomainPart = 'a'.repeat(64)
    emailUtil = new EmailUtil(`test@${longDomainPart}.com`)
    // act
    const isValid = emailUtil.validate()
    // assert
    expect(isValid).toBe(false)
  })

  test('should get domain from email', () => {
    // arrange
    emailUtil = new EmailUtil('test@example.com')
    // act
    const domain = emailUtil.domain
    // assert
    expect(domain).toBe('example.com')
  })

  test('should get domain parts from email', () => {
    // arrange
    emailUtil = new EmailUtil('test@mail.example.com')
    // act
    const domainParts = emailUtil.domainParts
    // assert
    expect(domainParts).toEqual(['mail', 'example', 'com'])
  })

  test('should get name from email', () => {
    // arrange
    emailUtil = new EmailUtil('testuser@example.com')
    // act
    const name = emailUtil.name
    // assert
    expect(name).toBe('testuser')
  })

  test('should validate TLD with valid email', async () => {
    // arrange
    emailUtil = new EmailUtil('test@example.com')
    // act
    const isValidTld = await emailUtil.validateTld()
    // assert
    expect(isValidTld).toBe(true)
  })

  test('should invalidate TLD with invalid email', async () => {
    // arrange
    emailUtil = new EmailUtil('test@example.invalid')
    // act
    const isValidTld = await emailUtil.validateTld()
    // assert
    expect(isValidTld).toBe(false)
  })

  test('should detect disposable domain', () => {
    // arrange
    emailUtil = new EmailUtil('test@027168.com')
    // act
    const isDisposable = emailUtil.isDisposableDomain()
    // assert
    expect(isDisposable).toBe(true)
  })

  test('should get MX records', async () => {
    // arrange
    emailUtil = new EmailUtil('test@gmail.com')
    // act
    const mxRecords = await emailUtil.getMxRecords()
    // assert
    expect(mxRecords).toBeTruthy()
  })

  test('should return cached MX records on second call', async () => {
    // arrange
    emailUtil = new EmailUtil('test@gmail.com')
    await emailUtil.getMxRecords()
    // act
    const mxRecords = await emailUtil.getMxRecords()
    // assert
    expect(mxRecords).toBeTruthy()
    expect(emailUtil.mxData).toBeTruthy()
  })
})
