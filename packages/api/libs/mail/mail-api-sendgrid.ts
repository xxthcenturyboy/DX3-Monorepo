import type { MailDataRequired } from '@sendgrid/mail'
import sgMail from '@sendgrid/mail'

import { APP_DOMAIN, COMPANY_NAME } from '@dx3/models-shared'

import { SENDGRID_API_KEY } from '../config/config-api.consts'
import { ApiLoggingClass, type ApiLoggingClassType } from '../logger'
import type { SendgridSendOptionsType } from './mail-api-sendgrid.types'
import { SG_TEMPLATES } from './mail-api-templates-sendgrid'

export class MailSendgrid {
  private fromAddress: string
  logger: ApiLoggingClassType

  constructor() {
    this.fromAddress = `${COMPANY_NAME} <noreply@${APP_DOMAIN}>`
    this.logger = ApiLoggingClass.instance
    sgMail.setApiKey(SENDGRID_API_KEY)

    // legacy unit test setup
    // if (isTest()) {
    //   sgClient.setApiKey(SENDGRID_API_KEY)
    //   sgClient.setDefaultRequest('baseUrl', SENDGRID_URL)
    //   sgMail.setClient(sgClient)
    // } else {
    //   sgMail.setApiKey(SENDGRID_API_KEY)
    // }
    sgMail.setSubstitutionWrappers('%', '%')
  }

  private async sendMail(mailData: MailDataRequired): Promise<string> {
    const res = await sgMail.send(mailData)
    const sgId = res[0].headers.etag
    return sgId || 'no-id-for-sendgrid'
  }

  public async sendConfirmation(to: string, confirmUrl: string): Promise<string> {
    const mailData: MailDataRequired = {
      dynamicTemplateData: {
        confirmUrl,
      },
      from: this.fromAddress,
      templateId: SG_TEMPLATES.CONFIRM,
      to,
    }

    try {
      this.logger.logInfo(`Sending confirmation mail to ${to}`)

      const sgMessageId = await this.sendMail(mailData)

      if (!sgMessageId) {
        throw new Error(`Could not send email to ${to}.`)
      }

      return sgMessageId
    } catch (err) {
      this.logger.logError(`Error sending email to ${to}`)
      this.logger.logError(err)
      throw new Error(err.message)
    }
  }

  public async sendInvite(to: string, inviteUrl: string, from?: string): Promise<string> {
    const mailData: MailDataRequired = {
      dynamicTemplateData: {
        inviteUrl,
      },
      from: from || this.fromAddress,
      templateId: SG_TEMPLATES.INVITE,
      to,
    }

    try {
      this.logger.logInfo(`Sending invite mail to ${to}`)

      const sgMessageId = await this.sendMail(mailData)

      if (!sgMessageId) {
        throw new Error(`Could not send email to ${to}.`)
      }

      return sgMessageId
    } catch (err) {
      this.logger.logError(`Error sending email to ${to}`)
      this.logger.logError(err)
      throw new Error(err.message)
    }
  }

  public async sendAccountAlert(options: SendgridSendOptionsType): Promise<string> {
    try {
      this.logger.logInfo(`Sending account alert mail to ${options.to}`)

      const sgMessageId = await this.sendMail({
        ...options,
        from: this.fromAddress,
        templateId: SG_TEMPLATES.ACCOUNT_ALERT,
      })

      if (!sgMessageId) {
        throw new Error(`Could not send email to ${options.to}.`)
      }

      return sgMessageId
    } catch (err) {
      this.logger.logError(`Error sending email to ${options.to}`)
      this.logger.logError(err)
      throw new Error(err.message)
    }
  }

  public async sendOtp(to: string, otpCode: string): Promise<string> {
    const mailData: MailDataRequired = {
      dynamicTemplateData: {
        otpCode,
      },
      from: this.fromAddress,
      templateId: SG_TEMPLATES.OTP,
      to,
    }

    try {
      this.logger.logInfo(`Sending OTP code mail to ${to}`)

      const sgMessageId = await this.sendMail(mailData)

      if (!sgMessageId) {
        throw new Error(`Could not send email to ${to}.`)
      }

      return sgMessageId
    } catch (err) {
      this.logger.logError(`Error sending email to ${to}`)
      this.logger.logError(err)
      throw new Error(err.message)
    }
  }
}

export type MailSendgridType = typeof MailSendgrid.prototype
