import { randomUUID } from 'node:crypto'
import zxcvbn from 'zxcvbn-typescript'

import { dxRsaValidateBiometricKey } from '@dx3/encryption'
import {
  type AccountCreationPayloadType,
  type BiometricAuthType,
  ERROR_CODES,
  type LoginPayloadType,
  PHONE_DEFAULT_REGION_CODE,
  USER_LOOKUPS,
  type UserLookupQueryType,
  type UserLookupResponseType,
  type UserProfileStateType,
} from '@dx3/models-shared'

import { isDebug, isProd } from '../config/config-api.service'
import { createApiErrorMessage } from '../utils/lib/error/api-error.utils'
import { DeviceModel } from '../devices/device-api.postgres-model'
import { DevicesService } from '../devices/devices-api.service'
import { EmailModel } from '../email/email-api.postgres-model'
import { EmailService } from '../email/email-api.service'
import { ApiLoggingClass, type ApiLoggingClassType, safeStringify } from '../logger'
import { MailSendgrid } from '../mail/mail-api-sendgrid'
import { PhoneModel } from '../phone/phone-api.postgres-model'
import { PhoneService } from '../phone/phone-api.service'
import { ShortLinkModel } from '../shortlink/shortlink-api.postgres-model'
import { UserModel, type UserModelType } from '../user/user-api.postgres-model'
import { getUserProfileState } from '../user/user-profile-api'
import { EmailUtil, PhoneUtil } from '../utils'
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
      throw new Error('No value supplied.')
    }

    try {
      const result = zxcvbn(password)
      return {
        feedback: result.feedback,
        score: result.score,
      }
    } catch (err) {
      const message = `Error in checkPasswordStrength: ${(err as Error).message}`
      this.logger.logError(message)
      throw new Error(message)
    }
  }

  public async createAccount(payload: AccountCreationPayloadType) {
    const { code, device, region, value } = payload
    let didAttemptAccountCreation = false

    if (!value || !code) {
      throw new Error('Bad data sent.')
    }

    const emailUtil = new EmailUtil(value)

    let user: UserModelType | undefined

    try {
      const phoneUtil = new PhoneUtil(value, region || PHONE_DEFAULT_REGION_CODE, this.isDebug)
      if (
        !emailUtil.isEmail &&
        phoneUtil.isValid &&
        phoneUtil.countryCode &&
        phoneUtil.nationalNumber
      ) {
        didAttemptAccountCreation = true
        if (!phoneUtil.isValidMobile) {
          throw new Error('This phone number cannot be used to create an account.')
        }

        const phoneService = new PhoneService()
        await phoneService.isPhoneAvailableAndValid(value, region || '')

        const otpCache = new OtpCodeCache()
        const isCodeValid = await otpCache.validatePhoneOtp(
          code,
          phoneUtil.countryCode,
          phoneUtil.nationalNumber,
        )
        if (isCodeValid) {
          user = await UserModel.registerAndCreateFromPhone(
            phoneUtil.nationalNumber,
            phoneUtil.countryCode,
            region || PHONE_DEFAULT_REGION_CODE,
          )
        }
      }

      if (!user && !didAttemptAccountCreation) {
        if (emailUtil.validate()) {
          didAttemptAccountCreation = true
          const emailService = new EmailService()
          await emailService.isEmailAvailableAndValid(value)

          const otpCache = new OtpCodeCache()
          const isCodeValid = await otpCache.validateEmailOtp(code, emailUtil.formattedEmail())
          if (isCodeValid) {
            user = await UserModel.registerAndCreateFromEmail(emailUtil.formattedEmail(), true)

            if (user) {
              const mail = new MailSendgrid()
              const inviteUrl = `/auth/z?route=validate&token=${user.token}`
              const shortLink = await ShortLinkModel.generateShortlink(inviteUrl)
              try {
                const inviteMessageId = await mail.sendConfirmation(
                  emailUtil.formattedEmail(),
                  shortLink,
                )
                await EmailModel.updateMessageInfoValidate(
                  emailUtil.formattedEmail(),
                  inviteMessageId,
                )
              } catch (err) {
                this.logger.logError((err as Error).message)
              }
            }
          }
        }
      }

      if (!user && !didAttemptAccountCreation) {
        const message = `Account could not be created with payload: ${safeStringify(payload, 2)}`
        throw new Error(message)
      }

      if (!user) {
        throw new Error('Could not create account.')
      }

      if (device?.uniqueDeviceId) {
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
      }

      await user.getEmails()
      await user.getPhones()
      const userProfile = await getUserProfileState(user, true)
      if (!userProfile) {
        throw Error(`Failed to build user profile.`)
      }

      return userProfile
    } catch (err) {
      const message = (err as Error).message || 'Could not create account.'
      this.logger.logError(message)
      throw new Error(message)
    }
  }

  public async doesEmailPhoneExist(query: UserLookupQueryType) {
    const { region, type, value } = query

    if (!type || !value) {
      throw new Error('Incorrect query parameters.')
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
      const message = `Error in auth lookup handler: ${(err as Error).message}`
      this.logger.logError(message)
      return result
    }
  }

  public async biometricLogin(data: BiometricAuthType) {
    const { signature, payload, userId, device } = data
    if (!userId || !signature || !payload) {
      throw new Error('Insufficient data for Biometric login.')
    }

    try {
      const biometricAuthPublicKey = await UserModel.getBiomAuthKey(userId)
      if (!biometricAuthPublicKey) {
        throw new Error(`BiometricLogin: User ${userId} has no stored public key.`)
      }

      const isSignatureValid = dxRsaValidateBiometricKey(signature, payload, biometricAuthPublicKey)
      if (!isSignatureValid) {
        throw new Error(
          `BiometricLogin: Device signature is invalid: ${biometricAuthPublicKey}, userid: ${userId}`,
        )
      }

      const user = await UserModel.findByPk(userId)
      if (!user) {
        throw new Error(`BiometricLogin: No user with that id: ${userId}`)
      }

      if (device) {
        const deviceService = new DevicesService()
        await deviceService.handleDevice(device, user)
      }

      return user
    } catch (err) {
      this.logger.logError((err as Error).message)
      throw new Error((err as Error).message || 'Biometric Login Faield.')
    }
  }

  public async login(payload: LoginPayloadType): Promise<UserProfileStateType | undefined> {
    const { biometric, code, region, password, value } = payload
    let didAttemptLogin = false

    if (!value) {
      throw new Error('No data sent.')
    }

    let user: UserModelType | null = null

    try {
      // Authentication in order of preference
      // Biometric Login
      if (biometric?.userId && biometric.signature) {
        didAttemptLogin = true
        user = await this.biometricLogin({
          ...biometric,
          payload: value,
        })
      }

      // Phone Number Login
      if (!user && !didAttemptLogin) {
        const phoneUtil = new PhoneUtil(value, region || PHONE_DEFAULT_REGION_CODE, this.isDebug)
        if (code && phoneUtil.isValid && phoneUtil.countryCode && phoneUtil.nationalNumber) {
          didAttemptLogin = true
          const otpCache = new OtpCodeCache()
          const isCodeValid = await otpCache.validatePhoneOtp(
            code,
            phoneUtil.countryCode,
            phoneUtil.nationalNumber,
          )
          if (isCodeValid) {
            const phone = await PhoneModel.findByPhoneAndCode(
              phoneUtil.nationalNumber,
              phoneUtil.countryCode,
            )
            if (phone?.isVerified && phone.userId) {
              user = await UserModel.findByPk(phone.userId)
            }
          }
        }
      }

      // Email Login
      if (!user && !didAttemptLogin) {
        const emailUtil = new EmailUtil(value)
        if (emailUtil.validate()) {
          if (password) {
            didAttemptLogin = true
            user = await UserModel.loginWithPassword(emailUtil.formattedEmail(), password)
          }

          if (!user && !password && code) {
            didAttemptLogin = true
            const otpCache = new OtpCodeCache()
            const isCodeValid = await otpCache.validateEmailOtp(code, emailUtil.formattedEmail())
            if (isCodeValid) {
              const email = await EmailModel.findByEmail(emailUtil.formattedEmail())
              if (email?.userId) {
                user = await UserModel.findByPk(email.userId)
              }
            }
          }
        }
      }

      // Username Login
      if (!user && !didAttemptLogin) {
        if (password) {
          didAttemptLogin = true
          user = await UserModel.loginWithUsernamePassword(value, password)
        }
      }

      if (!user) {
        throw new Error(
          createApiErrorMessage(ERROR_CODES.AUTH_FAILED, 'Could not log you in.'),
        )
      }

      if (user.deletedAt || user.accountLocked) {
        this.logger.logError(
          `Attempted login by a locked account: ${safeStringify({ accountLocked: user.accountLocked, deletedAt: user.deletedAt, id: user.id })}`,
        )
        throw new Error(
          createApiErrorMessage(ERROR_CODES.AUTH_FAILED, 'Could not log you in.'),
        )
      }

      await user.getEmails()
      await user.getPhones()
      const userProfile = await getUserProfileState(user, true)
      if (!userProfile) {
        throw Error(`Failed to build user profile.`)
      }

      return userProfile
    } catch (err) {
      const message = `Could not log in with payload: ${safeStringify(payload, 2)}`
      this.logger.logError(message)
      if ((err as Error).message === 'User not found!') {
        throw new Error(
          createApiErrorMessage(ERROR_CODES.AUTH_INVALID_CREDENTIALS, 'Could not log you in.'),
        )
      }
      throw new Error((err as Error).message)
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
      this.logger.logError((err as Error).message)
    }

    return false
  }

  public async sendOtpToEmail(email: string, strict?: boolean): Promise<{ code: string }> {
    if (!email) {
      throw new Error('No email sent.')
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
          this.logger.logError((err as Error).message)
        }
      }

      return isProd() ? { code: '' } : { code: otpCode }
    } catch (err) {
      const message = (err as Error).message || `Error sending Otp to email${email}`
      this.logger.logError(message)
      throw new Error(message)
    }
  }

  public async sendOtpToPhone(
    phone: string,
    regionCode?: string,
    strict?: boolean,
  ): Promise<{ code: string }> {
    if (!phone) {
      throw new Error('No phone sent.')
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
      const message = (err as Error).message || `Error sending Otp to phone${phone}`
      this.logger.logError(message)
      throw new Error(message)
    }
  }

  public async sentOtpById(
    id: string,
    type: 'PHONE' | 'EMAIL',
  ): Promise<{ code: string } | undefined> {
    if (type === 'PHONE') {
      try {
        const phoneRecord = await PhoneModel.findByPk(id)
        if (!phoneRecord) {
          throw new Error('No phone with that id')
        }

        return await this.sendOtpToPhone(phoneRecord.phoneFormatted, phoneRecord.countryCode)
      } catch (err) {
        const message = (err as Error).message || 'Error sending Otp to phone'
        this.logger.logError(message)
        throw new Error(message)
      }
    }

    if (type === 'EMAIL') {
      try {
        const emailRecord = await EmailModel.findByPk(id)
        if (!emailRecord) {
          throw new Error('No email with that id')
        }

        return await this.sendOtpToEmail(emailRecord.email)
      } catch (err) {
        const message = (err as Error).message || 'Error sending Otp to email'
        this.logger.logError(message)
        throw new Error(message)
      }
    }
  }

  public async validateEmail(token: string) {
    if (!token) {
      throw new Error('No token to validate.')
    }

    try {
      const email = await EmailModel.validateEmailWithToken(token)

      return email.toJSON()
    } catch (err) {
      const message = (err as Error).message || 'Could not verify email'
      this.logger.logError(message)
      throw new Error(message)
    }
  }
}

export type AuthServiceType = typeof AuthService.prototype
