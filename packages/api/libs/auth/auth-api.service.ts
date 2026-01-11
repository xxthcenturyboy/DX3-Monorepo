import zxcvbn from 'zxcvbn-typescript'

import {
  ERROR_CODES,
  PHONE_DEFAULT_REGION_CODE,
  USER_LOOKUPS,
  type UserLookupQueryType,
  type UserLookupResponseType,
} from '@dx3/models-shared'

import { isDebug, isProd } from '../config/config-api.service'
import { EmailModel, type EmailModelType } from '../email/email-api.postgres-model'
import { EmailService } from '../email/email-api.service'
import { ApiLoggingClass, type ApiLoggingClassType } from '../logger'
import { MailSendgrid } from '../mail/mail-api-sendgrid'
import { PhoneModel, type PhoneModelType } from '../phone/phone-api.postgres-model'
import { PhoneService } from '../phone/phone-api.service'
import { UserModel } from '../user/user-api.postgres-model'
import { EmailUtil, PhoneUtil } from '../utils'
import { createApiErrorMessage } from '../utils/lib/error/api-error.utils'
import { OtpCodeCache } from './otp/otp-code.redis-cache'
import { TokenService } from './tokens/token.service'

export class AuthService {
  isDebug: boolean
  logger: ApiLoggingClassType

  constructor() {
    this.isDebug = isDebug()
    this.logger = ApiLoggingClass.instance
  }

  public async checkPasswordStrength(password: string) {
    if (!password) {
      throw new Error(
        createApiErrorMessage(ERROR_CODES.GENERIC_VALIDATION_FAILED, 'No value supplied'),
      )
    }

    try {
      const result = zxcvbn(password)
      return {
        feedback: result.feedback,
        score: result.score,
      }
    } catch (err) {
      const msg = `Error in checkPasswordStrength: ${(err as Error).message}`
      this.logger.logError(msg)
      throw new Error(createApiErrorMessage(ERROR_CODES.GENERIC_SERVER_ERROR, msg))
    }
  }

  public async doesEmailPhoneExist(query: UserLookupQueryType) {
    const { region, type, value } = query

    if (!type || !value) {
      throw new Error(
        createApiErrorMessage(ERROR_CODES.GENERIC_VALIDATION_FAILED, 'Incorrect parameters'),
      )
    }

    const result: UserLookupResponseType = { available: false }

    try {
      if (type === USER_LOOKUPS.EMAIL) {
        const emailService = new EmailService()
        await emailService.isEmailAvailableAndValid(value)
        result.available = true
      }

      if (type === USER_LOOKUPS.PHONE) {
        const phoneService = new PhoneService()
        await phoneService.isPhoneAvailableAndValid(value, region || '')
        result.available = true
      }

      return result
    } catch (err) {
      const msg = `Error in auth lookup handler: ${(err as Error).message}`
      this.logger.logError(msg)
      throw new Error(createApiErrorMessage(ERROR_CODES.GENERIC_SERVER_ERROR, msg))
    }
  }

  public async logout(refreshToken: string): Promise<boolean> {
    try {
      const user = await UserModel.getByRefreshToken(refreshToken)
      if (!user) {
        return false
      }

      const refreshTokens = user.refreshTokens?.filter((token) => token !== refreshToken)
      const userId = TokenService.getUserIdFromRefreshToken(refreshToken)
      if (refreshTokens) {
        const updated = await UserModel.updateRefreshToken(userId, refreshTokens)
        return updated
      }
    } catch (err) {
      const msg = (err as Error).message
      this.logger.logError(msg)
      throw new Error(createApiErrorMessage(ERROR_CODES.GENERIC_SERVER_ERROR, msg))
    }

    return false
  }

  public async sentOtpById(
    id: string,
    type: 'PHONE' | 'EMAIL',
  ): Promise<{ code: string } | undefined> {
    if (type === 'PHONE') {
      let phoneRecord: PhoneModelType | null = null
      try {
        phoneRecord = await PhoneModel.findByPk(id)
        if (!phoneRecord) {
          throw new Error('No phone with that id')
        }
      } catch (err) {
        const msg = (err as Error).message
        this.logger.logError(msg)
        throw new Error(createApiErrorMessage(ERROR_CODES.GENERIC_SERVER_ERROR, msg))
      }

      return await this.sendOtpToPhone(phoneRecord.phoneFormatted, phoneRecord.countryCode)
    }

    if (type === 'EMAIL') {
      let emailRecord: EmailModelType | null = null
      try {
        emailRecord = await EmailModel.findByPk(id)
        if (!emailRecord) {
          throw new Error('No email with that id')
        }
      } catch (err) {
        const msg = (err as Error).message || 'Error sending Otp to email'
        this.logger.logError(msg)
        throw new Error(createApiErrorMessage(ERROR_CODES.GENERIC_SERVER_ERROR, msg))
      }

      return await this.sendOtpToEmail(emailRecord.email)
    }
  }

  public async sendOtpToEmail(email: string, strict?: boolean): Promise<{ code: string }> {
    if (!email) {
      throw new Error(createApiErrorMessage(ERROR_CODES.GENERIC_VALIDATION_FAILED, 'No email sent'))
    }

    let otpCode: string = ''
    try {
      const emailUtil = new EmailUtil(email)
      if (emailUtil.validate()) {
        if (strict) {
          const existingNonDeletedEmail = await EmailModel.findByEmail(emailUtil.formattedEmail())
          if (!existingNonDeletedEmail) {
            return { code: '' }
          }
        }

        const otpCache = new OtpCodeCache()
        otpCode = await otpCache.setEmailOtp(emailUtil.formattedEmail())
        const mail = new MailSendgrid()
        try {
          const sgMessageId = await mail.sendOtp(emailUtil.formattedEmail(), otpCode)
          await EmailModel.updateMessageInfoValidate(emailUtil.formattedEmail(), sgMessageId)
        } catch (err) {
          const msg = (err as Error).message
          this.logger.logError(msg)
          // throw new Error(msg)
        }
      }

      return isProd() ? { code: '' } : { code: otpCode }
    } catch (err) {
      const msg = (err as Error).message || `Error sending Otp to email${email}`
      this.logger.logError(msg)
      throw new Error(createApiErrorMessage(ERROR_CODES.GENERIC_SERVER_ERROR, msg))
    }
  }

  public async sendOtpToPhone(
    phone: string,
    regionCode?: string,
    strict?: boolean,
  ): Promise<{ code: string }> {
    if (!phone) {
      throw new Error(
        createApiErrorMessage(ERROR_CODES.GENERIC_VALIDATION_FAILED, 'No value supplied'),
      )
    }

    let otpCode: string = ''

    try {
      const phoneUtil = new PhoneUtil(phone, regionCode || PHONE_DEFAULT_REGION_CODE, this.isDebug)
      if (phoneUtil.isValid) {
        if (strict) {
          const existingNonDeletedPhone = await PhoneModel.findByPhoneAndCode(
            phoneUtil.nationalNumber,
            phoneUtil.countryCode,
          )
          if (!existingNonDeletedPhone) {
            return { code: '' }
          }
        }

        const otpCache = new OtpCodeCache()
        otpCode = await otpCache.setPhoneOtp(phoneUtil.countryCode, phoneUtil.nationalNumber)
        // TODO: integrate with Twilio or other to send SMS
      }

      return isProd() ? { code: '' } : { code: otpCode }
    } catch (err) {
      const msg = (err as Error).message || `Error sending Otp to phone${phone}`
      this.logger.logError(msg)
      throw new Error(createApiErrorMessage(ERROR_CODES.GENERIC_SERVER_ERROR, msg))
    }
  }

  public async validateEmail(token: string) {
    if (!token) {
      throw new Error(
        createApiErrorMessage(ERROR_CODES.GENERIC_VALIDATION_FAILED, 'No value supplied'),
      )
    }

    try {
      const email = await EmailModel.validateEmailWithToken(token)

      return email.toJSON()
    } catch (err) {
      const msg = (err as Error).message
      this.logger.logError(msg)
      throw new Error(createApiErrorMessage(ERROR_CODES.GENERIC_SERVER_ERROR, msg))
    }
  }
}

export type AuthServiceType = typeof AuthService.prototype
