import { APP_DOMAIN } from '@dx3/models-shared'
import { TEST_EMAIL } from '@dx3/test-data'

import { ApiLoggingClass } from '../../../logger'
import { EmailUtil, type EmailUtilType } from './email.util'

jest.mock('node:dns/promises', () => require('../../../testing/mocks/node-dns.promises.mock'))
jest.mock('@dx3/api-libs/reference-data/reference-data-api.client', () =>
  require('../../../testing/mocks/reference-data-api.client.mock'),
)

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
    const isValidTld = await emailUtil.isValidTldAsync()
    // assert
    expect(isValidTld).toBe(true)
  })

  test('should invalidate TLD with invalid email', async () => {
    // arrange
    emailUtil = new EmailUtil('test@example.invalid')
    // act
    const isValidTld = await emailUtil.isValidTldAsync()
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

  test('should resolve getMx in constructor when getMx is true', async () => {
    const { mockResolveMx } = require('../../../testing/mocks/node-dns.promises.mock')
    mockResolveMx.mockResolvedValueOnce([{ exchange: 'mx.gmail.com', priority: 5 }])

    emailUtil = new EmailUtil('test@gmail.com', true)
    // Give the async getMxRecords time to complete
    await new Promise((resolve) => setTimeout(resolve, 10))

    expect(mockResolveMx).toHaveBeenCalled()
  })

  test('should log error in constructor getMx catch block', async () => {
    const { mockResolveMx } = require('../../../testing/mocks/node-dns.promises.mock')
    mockResolveMx.mockRejectedValueOnce(new Error('DNS failure'))

    emailUtil = new EmailUtil('test@gmail.com', true)
    await new Promise((resolve) => setTimeout(resolve, 10))

    expect(mockResolveMx).toHaveBeenCalled()
  })

  test('isEmail getter should return true for valid email', () => {
    emailUtil = new EmailUtil('test@gmail.com')
    expect(emailUtil.isEmail).toBe(true)
  })

  test('isEmail getter should return false for invalid email', () => {
    emailUtil = new EmailUtil('not-an-email')
    expect(emailUtil.isEmail).toBe(false)
  })

  test('isValid getter should proxy validate()', () => {
    emailUtil = new EmailUtil('test@gmail.com')
    expect(emailUtil.isValid).toBe(emailUtil.validate())
  })

  test('should return empty string from getMxRecords when no records returned', async () => {
    const { mockResolveMx } = require('../../../testing/mocks/node-dns.promises.mock')
    mockResolveMx.mockResolvedValueOnce([])

    emailUtil = new EmailUtil('test@gmail.com')
    const result = await emailUtil.getMxRecords()

    expect(result).toBe('')
  })

  test('should return empty string from getMxRecords on DNS error', async () => {
    const { mockResolveMx } = require('../../../testing/mocks/node-dns.promises.mock')
    mockResolveMx.mockRejectedValueOnce(new Error('DNS error'))

    emailUtil = new EmailUtil('test@nodomain.xyz')
    const result = await emailUtil.getMxRecords()

    expect(result).toBe('')
  })

  test('validateDomain should call checkDomain when reference data API is configured', async () => {
    const {
      mockReferenceDataApiClient,
      resetReferenceDataApiClientMock,
    } = require('../../../testing/mocks/reference-data-api.client.mock')

    mockReferenceDataApiClient({
      checkDomainResult: { disposable: false, validTld: true },
      configured: true,
    })

    emailUtil = new EmailUtil('test@gmail.com')
    const result = await emailUtil.validateDomain()

    expect(result).toEqual({ disposable: false, validTld: true })
    resetReferenceDataApiClientMock()
  })

  test('validateDomain should return cached result on second call', async () => {
    const {
      mockReferenceDataApiClient,
      mockCheckDomain,
      resetReferenceDataApiClientMock,
    } = require('../../../testing/mocks/reference-data-api.client.mock')

    mockReferenceDataApiClient({
      checkDomainResult: { disposable: false, validTld: true },
      configured: true,
    })

    emailUtil = new EmailUtil('test@gmail.com')
    await emailUtil.validateDomain()
    const result = await emailUtil.validateDomain()

    expect(mockCheckDomain).toHaveBeenCalledTimes(1)
    expect(result).toEqual({ disposable: false, validTld: true })
    resetReferenceDataApiClientMock()
  })

  test('isDisposableDomainAsync should use reference data API when configured', async () => {
    const {
      mockReferenceDataApiClient,
      resetReferenceDataApiClientMock,
    } = require('../../../testing/mocks/reference-data-api.client.mock')

    mockReferenceDataApiClient({
      checkDomainResult: { disposable: true, validTld: true },
      configured: true,
    })

    emailUtil = new EmailUtil('test@disposable.com')
    const result = await emailUtil.isDisposableDomainAsync()

    expect(result).toBe(true)
    resetReferenceDataApiClientMock()
  })

  test('isDisposableDomainAsync should fall back to static list when API not configured', async () => {
    emailUtil = new EmailUtil('test@gmail.com')
    const result = await emailUtil.isDisposableDomainAsync()
    expect(result).toBe(false)
  })

  test('isValidTldAsync should use domainCheckResult when provided', async () => {
    emailUtil = new EmailUtil('test@example.com')
    const result = await emailUtil.isValidTldAsync({ validTld: false })
    expect(result).toBe(false)
  })

  test('isValidTldAsync should use reference data API when configured', async () => {
    const {
      mockReferenceDataApiClient,
      resetReferenceDataApiClientMock,
    } = require('../../../testing/mocks/reference-data-api.client.mock')

    mockReferenceDataApiClient({
      checkDomainResult: { disposable: false, validTld: true },
      configured: true,
    })

    emailUtil = new EmailUtil('test@example.com')
    const result = await emailUtil.isValidTldAsync()

    expect(result).toBe(true)
    resetReferenceDataApiClientMock()
  })

  test('isValidTldAsync should return false when tld is missing', async () => {
    emailUtil = new EmailUtil('test@')
    const result = await emailUtil.isValidTldAsync()
    expect(result).toBe(false)
  })

  test('validateAsync should return true for a valid email', async () => {
    emailUtil = new EmailUtil('test@gmail.com')
    const result = await emailUtil.validateAsync()
    expect(result).toBe(true)
  })

  test('validateAsync should return false when common validation fails', async () => {
    emailUtil = new EmailUtil('not-an-email')
    const result = await emailUtil.validateAsync()
    expect(result).toBe(false)
  })

  test('validateAsync should return false when domain is disposable', async () => {
    emailUtil = new EmailUtil('test@027168.com')
    const result = await emailUtil.validateAsync()
    expect(result).toBe(false)
  })

  test('validateAsync should use reference data API when configured', async () => {
    const {
      mockReferenceDataApiClient,
      resetReferenceDataApiClientMock,
    } = require('../../../testing/mocks/reference-data-api.client.mock')

    mockReferenceDataApiClient({
      checkDomainResult: { disposable: false, validTld: true },
      configured: true,
    })

    emailUtil = new EmailUtil('test@gmail.com')
    const result = await emailUtil.validateAsync()

    expect(result).toBe(true)
    resetReferenceDataApiClientMock()
  })

  test('validateAsync should return false when reference data says disposable', async () => {
    const {
      mockReferenceDataApiClient,
      resetReferenceDataApiClientMock,
    } = require('../../../testing/mocks/reference-data-api.client.mock')

    mockReferenceDataApiClient({
      checkDomainResult: { disposable: true, validTld: true },
      configured: true,
    })

    emailUtil = new EmailUtil('test@gmail.com')
    const result = await emailUtil.validateAsync()

    expect(result).toBe(false)
    resetReferenceDataApiClientMock()
  })
})
