import { TEST_EMAIL } from '@dx3/test-data'

import { ApiLoggingClass } from '../logger'
import { MailSendgrid, type MailSendgridType } from './mail-api-sendgrid'
import { UNSUBSCRIBE_GROUPS } from './mail-api-sendgrid.const'
import { SG_TEMPLATES } from './mail-api-templates-sendgrid'

jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))
jest.unmock('./mail-api-sendgrid')

describe('MailSendgrid', () => {
  let mail: MailSendgridType

  beforeAll(() => {
    new ApiLoggingClass({ appName: 'unit-test' })
  })

  beforeEach(() => {
    mail = new MailSendgrid()
  })

  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(MailSendgrid).toBeDefined()
  })

  it('should exist when instantiated', () => {
    // arrange
    // act
    // assert
    expect(mail).toBeDefined()
    expect(mail.logger).toBeDefined()
    expect(mail.sendConfirmation).toBeDefined()
    expect(mail.sendInvite).toBeDefined()
    expect(mail.sendOtp).toBeDefined()
    expect(mail.sendAccountAlert).toBeDefined()
  })

  test('should sendConfirmation when invoked', async () => {
    // arrange
    // act
    const result = await mail.sendConfirmation(TEST_EMAIL, 'http://url-to-comfirm.com')
    // assert
    expect(result).toBeDefined()
    expect(typeof result).toEqual('string')
  })

  test('should sendInvite when invoked', async () => {
    // arrange
    // act
    const result = await mail.sendInvite(TEST_EMAIL, 'http://url-to-invite.com')
    // assert
    expect(result).toBeDefined()
    expect(typeof result).toEqual('string')
  })

  test('should sendReset when invoked', async () => {
    // arrange
    // act
    const result = await mail.sendAccountAlert({
      body: '',
      cta: '',
      ctaUrl: '',
      from: TEST_EMAIL,
      subject: '',
      templateId: SG_TEMPLATES.ACCOUNT_ALERT,
      to: TEST_EMAIL,
      unsubscribeGroup: UNSUBSCRIBE_GROUPS.TRANSACTIONAL,
    })
    // assert
    expect(result).toBeDefined()
    expect(typeof result).toEqual('string')
  })

  test('should sendOtp when invoked', async () => {
    // arrange
    // act
    const result = await mail.sendOtp(TEST_EMAIL, 'otp-code')
    // assert
    expect(result).toBeDefined()
    expect(typeof result).toEqual('string')
  })
})
