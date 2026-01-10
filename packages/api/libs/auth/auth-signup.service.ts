import { randomUUID } from 'node:crypto'

import {
  type AccountCreationPayloadType,
  ERROR_CODES,
  PHONE_DEFAULT_REGION_CODE,
} from '@dx3/models-shared'

import { isDebug } from '../config/config-api.service'
import { DeviceModel } from '../devices/device-api.postgres-model'
import { EmailModel } from '../email/email-api.postgres-model'
import { EmailService } from '../email/email-api.service'
import { ApiLoggingClass, type ApiLoggingClassType, safeStringify } from '../logger'
import { MailSendgrid } from '../mail/mail-api-sendgrid'
import { PhoneModel } from '../phone/phone-api.postgres-model'
import { ShortLinkModel } from '../shortlink/shortlink-api.postgres-model'
import { UserModel, type UserModelType } from '../user/user-api.postgres-model'
import { getUserProfileState } from '../user/user-profile-api'
import { EmailUtil, type EmailUtilType, PhoneUtil, type PhoneUtilType } from '../utils'
import { createApiErrorMessage } from '../utils/lib/error/api-error.utils'
import { OtpCodeCache } from './otp/otp-code.redis-cache'

export class AuthSignupService {
  isDebug: boolean
  logger: ApiLoggingClassType

  constructor() {
    this.isDebug = isDebug()
    this.logger = ApiLoggingClass.instance
  }

  private determineCreateAccountType(data: {
    emailUtil: EmailUtilType
    hasCode: boolean
    phoneUtil: PhoneUtilType
  }): 'emailcode' | 'emailmagiclink' | 'phone' {
    const { emailUtil, hasCode, phoneUtil } = data

    if (
      !emailUtil.isEmail &&
      phoneUtil.isValid &&
      phoneUtil.countryCode &&
      phoneUtil.nationalNumber &&
      hasCode
    ) {
      return 'phone'
    }

    if (emailUtil.validate() && hasCode) {
      return 'emailcode'
    }

    if (emailUtil.validate() && !hasCode) {
      return 'emailmagiclink'
    }
  }

  private async emailCodeSignup(data: { code: string; email: string }) {
    const { code, email } = data
    let user: UserModelType | null = null

    const otpCache = new OtpCodeCache()
    const isCodeValid = await otpCache.validateEmailOtp(code, email)
    if (!isCodeValid) {
      throw new Error(createApiErrorMessage(ERROR_CODES.AUTH_OTP_INVALID, 'Invalid code.'))
    }

    const emailService = new EmailService()
    const emailValidResult = await emailService.isEmailAvailableAndValid(email, true)

    if (emailValidResult === ERROR_CODES.EMAIL_ALREADY_EXISTS) {
      try {
        // Email is in use but user sent valid code so let's just log them in
        const emailModel = await EmailModel.findByEmail(email)
        if (emailModel?.userId) {
          user = await UserModel.findByPk(emailModel.userId)
          return user
        }

        throw new Error('Email is not available, or not attached to a user.')
      } catch (err) {
        const msg = (err as Error).message
        this.logger.logError(msg)
        throw new Error(createApiErrorMessage(ERROR_CODES.AUTH_FAILED, msg))
      }
    }

    try {
      user = await UserModel.registerAndCreateFromEmail(email, true)
    } catch (err) {
      const msg = (err as Error).message
      this.logger.logError(msg)
      throw new Error(createApiErrorMessage(ERROR_CODES.AUTH_SIGNUP_FAILED, msg))
    }

    return user
  }

  private async emailMagicLinkSignup(data: { email: string }) {
    const { email } = data
    let user: UserModelType | null = null

    const emailService = new EmailService()
    await emailService.isEmailAvailableAndValid(email)

    try {
      user = await UserModel.registerAndCreateFromEmail(email, true)
    } catch (err) {
      const msg = (err as Error).message
      this.logger.logError(msg)
      throw new Error(createApiErrorMessage(ERROR_CODES.AUTH_SIGNUP_FAILED, msg))
    }

    if (user) {
      const mail = new MailSendgrid()
      const inviteUrl = `/auth/z?route=validate&token=${user.token}`
      const shortLink = await ShortLinkModel.generateShortlink(inviteUrl)
      try {
        const inviteMessageId = await mail.sendConfirmation(email, shortLink)
        await EmailModel.updateMessageInfoValidate(email, inviteMessageId)
      } catch (err) {
        const msg = (err as Error).message
        this.logger.logError(msg)
        throw new Error(createApiErrorMessage(ERROR_CODES.AUTH_SIGNUP_FAILED, msg))
      }
    }

    return user
  }

  private async phoneSignup(data: {
    code: string
    countryCode: string
    nationalNumber: string
    region: string
  }) {
    const { code, countryCode, nationalNumber, region } = data

    let user: UserModelType | null = null

    const otpCache = new OtpCodeCache()
    const isCodeValid = await otpCache.validatePhoneOtp(code, countryCode, nationalNumber)
    if (!isCodeValid) {
      throw new Error(createApiErrorMessage(ERROR_CODES.AUTH_OTP_INVALID, 'Invalid code.'))
    }

    try {
      const phoneAvailable = await PhoneModel.isPhoneAvailable(nationalNumber, countryCode)

      if (!phoneAvailable) {
        // Phone is in use but user sent valid code so let's just log them in
        const phone = await PhoneModel.findByPhoneAndCode(nationalNumber, countryCode)
        if (phone?.isVerified && phone.userId) {
          user = await UserModel.findByPk(phone.userId)
          return user
        }
        throw new Error('PHone is not available, verified, or not attached to a user.')
      }
    } catch (err) {
      const msg = (err as Error).message
      this.logger.logError(msg)
      throw new Error(createApiErrorMessage(ERROR_CODES.AUTH_FAILED, msg))
    }

    try {
      user = await UserModel.registerAndCreateFromPhone(
        nationalNumber,
        countryCode,
        region || PHONE_DEFAULT_REGION_CODE,
      )
    } catch (err) {
      const msg = (err as Error).message
      this.logger.logError(msg)
      throw new Error(createApiErrorMessage(ERROR_CODES.AUTH_SIGNUP_FAILED, msg))
    }

    return user
  }

  public async signup(payload: AccountCreationPayloadType) {
    const { code, device, region, value } = payload

    if (!value) {
      throw new Error('Bad data sent.')
    }

    let user: UserModelType | undefined

    const emailUtil = new EmailUtil(value)
    const phoneUtil = new PhoneUtil(value, region || PHONE_DEFAULT_REGION_CODE, this.isDebug)
    const signupType = this.determineCreateAccountType({ emailUtil, hasCode: !!code, phoneUtil })

    if (signupType === 'phone') {
      if (!phoneUtil.isValidMobile) {
        throw new Error(
          createApiErrorMessage(
            ERROR_CODES.AUTH_SIGNUP_BAD_PHONE_TYPE,
            'This phone number cannot be used to create an account.',
          ),
        )
      }

      user = await this.phoneSignup({
        code,
        countryCode: phoneUtil.countryCode,
        nationalNumber: phoneUtil.nationalNumber,
        region,
      })
    }

    if (signupType === 'emailcode') {
      user = await this.emailCodeSignup({ code, email: emailUtil.formattedEmail() })
    }

    if (signupType === 'emailmagiclink') {
      user = await this.emailMagicLinkSignup({ email: emailUtil.formattedEmail() })
    }

    if (!user) {
      const msg = `Account could not be created with payload: ${safeStringify(payload, 2)}`
      this.logger.logError(msg)
      throw new Error(createApiErrorMessage(ERROR_CODES.AUTH_SIGNUP_FAILED, msg))
    }

    if (device?.uniqueDeviceId) {
      try {
        const existingDevice = await DeviceModel.findOne({
          where: {
            deletedAt: null,
            uniqueDeviceId: device.uniqueDeviceId,
          },
        })

        // Device is used but connected to another user => transfer over
        if (existingDevice && existingDevice.userId !== user.id) {
          existingDevice.deletedAt = new Date()
          await existingDevice.save()
        }

        await DeviceModel.create({
          ...device,
          userId: user.id,
          verificationToken: randomUUID(),
          verifiedAt: new Date(),
        })
      } catch (err) {
        const msg = (err as Error).message
        this.logger.logError(msg)
      }
    }

    try {
      await user.getEmails()
      await user.getPhones()
      const userProfile = await getUserProfileState(user, true)
      if (!userProfile) {
        throw Error(
          createApiErrorMessage(ERROR_CODES.GENERIC_SERVER_ERROR, `Failed to build user profile.`),
        )
      }

      return userProfile
    } catch (err) {
      const msg = (err as Error).message
      this.logger.logError(msg)
      throw new Error(createApiErrorMessage(ERROR_CODES.GENERIC_SERVER_ERROR, msg))
    }
  }
}

export type AuthSignupServiceType = typeof AuthSignupService.prototype
