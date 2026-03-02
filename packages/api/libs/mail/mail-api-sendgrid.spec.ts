import sgMail from '@sendgrid/mail'

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
    expect(MailSendgrid).toBeDefined()
  })

  it('should exist when instantiated', () => {
    expect(mail).toBeDefined()
    expect(mail.logger).toBeDefined()
    expect(mail.sendConfirmation).toBeDefined()
    expect(mail.sendInvite).toBeDefined()
    expect(mail.sendOtp).toBeDefined()
    expect(mail.sendAccountAlert).toBeDefined()
  })

  test('should sendConfirmation when invoked', async () => {
    const result = await mail.sendConfirmation(TEST_EMAIL, 'http://url-to-comfirm.com')
    expect(result).toBeDefined()
    expect(typeof result).toEqual('string')
  })

  test('should throw when sendConfirmation encounters a sendgrid error', async () => {
    ;(sgMail.send as jest.Mock).mockRejectedValueOnce(new Error('Sendgrid API down'))
    await expect(mail.sendConfirmation(TEST_EMAIL, 'http://url.com')).rejects.toThrow(
      'Sendgrid API down',
    )
  })

  test('should sendInvite when invoked', async () => {
    const result = await mail.sendInvite(TEST_EMAIL, 'http://url-to-invite.com')
    expect(result).toBeDefined()
    expect(typeof result).toEqual('string')
  })

  test('should sendInvite with a custom from address', async () => {
    const result = await mail.sendInvite(TEST_EMAIL, 'http://url-to-invite.com', 'custom@from.com')
    expect(result).toBeDefined()
    expect(typeof result).toEqual('string')
  })

  test('should throw when sendInvite encounters a sendgrid error', async () => {
    ;(sgMail.send as jest.Mock).mockRejectedValueOnce(new Error('Invite failed'))
    await expect(mail.sendInvite(TEST_EMAIL, 'http://url.com')).rejects.toThrow('Invite failed')
  })

  test('should sendReset when invoked', async () => {
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
    expect(result).toBeDefined()
    expect(typeof result).toEqual('string')
  })

  test('should throw when sendAccountAlert encounters a sendgrid error', async () => {
    ;(sgMail.send as jest.Mock).mockRejectedValueOnce(new Error('Alert failed'))
    await expect(
      mail.sendAccountAlert({
        body: '',
        cta: '',
        ctaUrl: '',
        from: TEST_EMAIL,
        subject: '',
        templateId: SG_TEMPLATES.ACCOUNT_ALERT,
        to: TEST_EMAIL,
        unsubscribeGroup: UNSUBSCRIBE_GROUPS.TRANSACTIONAL,
      }),
    ).rejects.toThrow('Alert failed')
  })

  test('should sendOtp when invoked', async () => {
    const result = await mail.sendOtp(TEST_EMAIL, 'otp-code')
    expect(result).toBeDefined()
    expect(typeof result).toEqual('string')
  })

  test('should throw when sendOtp encounters a sendgrid error', async () => {
    ;(sgMail.send as jest.Mock).mockRejectedValueOnce(new Error('OTP failed'))
    await expect(mail.sendOtp(TEST_EMAIL, '123456')).rejects.toThrow('OTP failed')
  })

  describe('empty sgMessageId fallback branches (via private sendMail override)', () => {
    // sendMail's fallback `sgId || 'no-id-for-sendgrid'` normally prevents these branches from
    // being hit. We override the private method to test the guard directly.

    it('sendConfirmation should throw when sendMail returns empty string', async () => {
      ;(mail as any).sendMail = jest.fn().mockResolvedValue('')
      await expect(mail.sendConfirmation(TEST_EMAIL, 'http://url.com')).rejects.toThrow(
        /Could not send email/,
      )
    })

    it('sendInvite should throw when sendMail returns empty string', async () => {
      ;(mail as any).sendMail = jest.fn().mockResolvedValue('')
      await expect(mail.sendInvite(TEST_EMAIL, 'http://url.com')).rejects.toThrow(
        /Could not send email/,
      )
    })

    it('sendAccountAlert should throw when sendMail returns empty string', async () => {
      ;(mail as any).sendMail = jest.fn().mockResolvedValue('')
      await expect(
        mail.sendAccountAlert({
          body: '',
          cta: '',
          ctaUrl: '',
          from: TEST_EMAIL,
          subject: '',
          templateId: SG_TEMPLATES.ACCOUNT_ALERT,
          to: TEST_EMAIL,
          unsubscribeGroup: UNSUBSCRIBE_GROUPS.TRANSACTIONAL,
        }),
      ).rejects.toThrow(/Could not send email/)
    })

    it('sendOtp should throw when sendMail returns empty string', async () => {
      ;(mail as any).sendMail = jest.fn().mockResolvedValue('')
      await expect(mail.sendOtp(TEST_EMAIL, '123456')).rejects.toThrow(/Could not send email/)
    })
  })
})
