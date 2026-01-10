import { dxRsaValidateBiometricKey } from '@dx3/encryption'
import {
  type BiometricAuthType,
  type BiometricLoginParamType,
  ERROR_CODES,
  type LoginPayloadType,
  PHONE_DEFAULT_REGION_CODE,
  type UserProfileStateType,
} from '@dx3/models-shared'

import { isDebug } from '../config/config-api.service'
import { DevicesService } from '../devices/devices-api.service'
import { EmailModel } from '../email/email-api.postgres-model'
import { ApiLoggingClass, type ApiLoggingClassType, safeStringify } from '../logger'
import { PhoneModel } from '../phone/phone-api.postgres-model'
import { UserModel, type UserModelType } from '../user/user-api.postgres-model'
import { getUserProfileState } from '../user/user-profile-api'
import { EmailUtil, type EmailUtilType, PhoneUtil, type PhoneUtilType } from '../utils'
import { createApiErrorMessage } from '../utils/lib/error/api-error.utils'
import { OtpCodeCache } from './otp/otp-code.redis-cache'

export class AuthLoginService {
  isDebug: boolean
  logger: ApiLoggingClassType

  constructor() {
    this.isDebug = isDebug()
    this.logger = ApiLoggingClass.instance
  }

  private async biometricLogin(data: BiometricAuthType) {
    const { signature, payload, userId, device } = data
    let user: UserModelType | null = null

    if (!userId || !signature || !payload) {
      throw new Error(
        createApiErrorMessage(
          ERROR_CODES.AUTH_INCOMPLETE_BIOMETRIC,
          'Insufficient data for Biometric login.',
        ),
      )
    }

    const biometricAuthPublicKey = await UserModel.getBiomAuthKey(userId)
    if (!biometricAuthPublicKey) {
      throw new Error(
        createApiErrorMessage(
          ERROR_CODES.AUTH_INVALID_BIOMETRIC,
          `BiometricLogin: User ${userId} has no stored public key.`,
        ),
      )
    }

    const isSignatureValid = dxRsaValidateBiometricKey(signature, payload, biometricAuthPublicKey)
    if (!isSignatureValid) {
      throw new Error(
        createApiErrorMessage(
          ERROR_CODES.AUTH_INVALID_BIOMETRIC,
          `BiometricLogin: Device signature is invalid: ${biometricAuthPublicKey}, userid: ${userId}`,
        ),
      )
    }

    try {
      user = await UserModel.findByPk(userId)
      if (!user) {
        throw new Error(`BiometricLogin: No user with that id: ${userId}`)
      }

      if (device) {
        const deviceService = new DevicesService()
        await deviceService.handleDevice(device, user)
      }
    } catch (err) {
      const msg = (err as Error).message
      this.logger.logError(msg)
      throw new Error(createApiErrorMessage(ERROR_CODES.AUTH_FAILED, msg))
    }

    return user
  }

  private async phoneNumberLogin(data: {
    code: string
    countryCode: string
    nationalNumber: string
    region: string
  }): Promise<UserModelType | null> {
    const { code, countryCode, nationalNumber, region } = data
    let user: UserModelType | null = null

    const otpCache = new OtpCodeCache()
    const isCodeValid = await otpCache.validatePhoneOtp(code, countryCode, nationalNumber)
    if (!isCodeValid) {
      throw new Error(createApiErrorMessage(ERROR_CODES.AUTH_OTP_INVALID, 'Invalid code.'))
    }

    try {
      const phoneModel = await PhoneModel.findByPhoneAndCode(nationalNumber, countryCode)
      if (phoneModel?.isVerified && phoneModel.userId) {
        user = await UserModel.findByPk(phoneModel.userId)
      }

      if (!user && !phoneModel) {
        // Code is valid and phone is not in system, try to create user
        user = await UserModel.registerAndCreateFromPhone(
          nationalNumber,
          countryCode,
          region || PHONE_DEFAULT_REGION_CODE,
        )
      }
    } catch (err) {
      const msg = (err as Error).message
      this.logger.logError(msg)
      throw new Error(createApiErrorMessage(ERROR_CODES.AUTH_FAILED, msg))
    }

    return user
  }

  private async emailLogin(data: {
    email: string
    password?: string
    code?: string
  }): Promise<UserModelType | null> {
    const { code, email, password } = data
    let user: UserModelType | null = null

    if (password) {
      try {
        user = await UserModel.loginWithPassword(email, password)
        if (!user) {
          throw new Error('Invalid username or password')
        }
      } catch (err) {
        const msg = (err as Error).message
        this.logger.logError(msg)
        throw new Error(createApiErrorMessage(ERROR_CODES.AUTH_INVALID_CREDENTIALS, msg))
      }
    }

    if (!password && code) {
      const otpCache = new OtpCodeCache()
      const isCodeValid = await otpCache.validateEmailOtp(code, email)
      if (!isCodeValid) {
        throw new Error(createApiErrorMessage(ERROR_CODES.AUTH_OTP_INVALID, 'Invalid code.'))
      }

      try {
        const emailModel = await EmailModel.findByEmail(email)
        if (emailModel?.userId) {
          user = await UserModel.findByPk(emailModel.userId)
        }

        if (!emailModel && !user) {
          // Code is valid and email is not in system, try to create user
          user = await UserModel.registerAndCreateFromEmail(email, true)
        }
      } catch (err) {
        const msg = (err as Error).message
        this.logger.logError(msg)
        throw new Error(createApiErrorMessage(ERROR_CODES.AUTH_FAILED, msg))
      }
    }

    return user
  }

  private async usernamePasswordLogin(data: {
    username: string
    password: string
  }): Promise<UserModelType | null> {
    const { username, password } = data
    let user: UserModelType | null = null

    try {
      user = await UserModel.loginWithUsernamePassword(username, password)
    } catch (err) {
      const msg = (err as Error).message
      this.logger.logError(`${msg}: ${username}`)
      throw new Error(
        createApiErrorMessage(ERROR_CODES.AUTH_INVALID_CREDENTIALS, 'Invalid username or password'),
      )
    }

    if (!user) {
      throw new Error(
        createApiErrorMessage(ERROR_CODES.AUTH_INVALID_CREDENTIALS, 'Invalid username or password'),
      )
    }
    return user
  }

  private determineLoginType(data: {
    biometric?: BiometricLoginParamType
    emailUtil: EmailUtilType
    password?: string
    phoneUtil: PhoneUtilType
  }): 'biometric' | 'email' | 'phone' | 'usernamepass' {
    const { biometric, emailUtil, password, phoneUtil } = data

    if (biometric?.userId && biometric?.signature) {
      return 'biometric'
    }

    if (phoneUtil.isValid) {
      return 'phone'
    }

    if (emailUtil.validate()) {
      return 'email'
    }

    if (password) {
      return 'usernamepass'
    }
  }

  public async login(payload: LoginPayloadType): Promise<UserProfileStateType | undefined> {
    const { biometric, code, region, password, value } = payload

    if (!value) {
      throw new Error(
        createApiErrorMessage(ERROR_CODES.GENERIC_VALIDATION_FAILED, 'No value supplied'),
      )
    }

    let user: UserModelType | null = null

    const phoneUtil = new PhoneUtil(value, region || PHONE_DEFAULT_REGION_CODE, this.isDebug)
    const emailUtil = new EmailUtil(value)
    const loginType = this.determineLoginType({
      biometric,
      emailUtil,
      password,
      phoneUtil,
    })

    switch (loginType) {
      case 'biometric': {
        user = await this.biometricLogin({
          ...biometric,
          payload: value,
        })
        break
      }
      case 'email': {
        // (Password & OTP types)
        user = await this.emailLogin({ code, email: emailUtil.formattedEmail(), password })
        break
      }
      case 'phone': {
        user = await this.phoneNumberLogin({
          code,
          countryCode: phoneUtil.countryCode,
          nationalNumber: phoneUtil.nationalNumber,
          region,
        })
        break
      }
      case 'usernamepass': {
        user = await this.usernamePasswordLogin({ password, username: value })
        break
      }
      default: {
        user = null
      }
    }

    if (!user) {
      throw new Error(createApiErrorMessage(ERROR_CODES.AUTH_FAILED, 'Could not log you in.'))
    }

    if (user.deletedAt || user.accountLocked) {
      this.logger.logError(
        `Attempted login by a locked account: ${safeStringify({ accountLocked: user.accountLocked, deletedAt: user.deletedAt, id: user.id })}`,
      )
      throw new Error(createApiErrorMessage(ERROR_CODES.AUTH_FAILED, 'Could not log you in.'))
    }

    try {
      await user.getEmails()
      await user.getPhones()
      const userProfile = await getUserProfileState(user, true)
      if (!userProfile) {
        throw Error(`Failed to build user profile.`)
      }

      return userProfile
    } catch (err) {
      const msg = (err as Error).message
      this.logger.logError(msg)
      throw new Error(createApiErrorMessage(ERROR_CODES.GENERIC_SERVER_ERROR, msg))
    }
  }
}

export type AuthLoginServiceType = typeof AuthLoginService.prototype
