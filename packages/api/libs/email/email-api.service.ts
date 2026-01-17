import { dxRsaValidateBiometricKey } from '@dx3/encryption/src'
import {
  type CreateEmailPayloadType,
  ERROR_CODES,
  type UpdateEmailPayloadType,
} from '@dx3/models-shared'

import { OtpService } from '../auth/otp/otp.service'
import { ApiLoggingClass, type ApiLoggingClassType } from '../logger'
import { UserModel } from '../user/user-api.postgres-model'
import { EmailUtil } from '../utils'
import { createApiErrorMessage } from '../utils/lib/error/api-error.utils'
import { EmailModel } from './email-api.postgres-model'

export class EmailService {
  private logger: ApiLoggingClassType

  constructor() {
    this.logger = ApiLoggingClass.instance
  }

  public async createEmail(payload: CreateEmailPayloadType) {
    const { code, def, email, label, signature, userId } = payload

    if (!userId || !email) {
      throw new Error(
        createApiErrorMessage(ERROR_CODES.GENERIC_VALIDATION_FAILED, 'No value supplied'),
      )
    }

    await this.isEmailAvailableAndValid(email)
    let validated = false

    if (code) {
      const isCodeValid = await OtpService.validateOptCodeByEmail(userId, email, code)
      if (!isCodeValid) {
        throw new Error(createApiErrorMessage(ERROR_CODES.AUTH_OTP_INVALID, 'Invalid OTP code.'))
      }
      validated = true
    }

    if (signature) {
      const biometricAuthPublicKey = await UserModel.getBiomAuthKey(userId)
      const isSignatureValid = dxRsaValidateBiometricKey(
        signature,
        email,
        biometricAuthPublicKey || '',
      )
      if (!isSignatureValid) {
        throw new Error(
          createApiErrorMessage(
            ERROR_CODES.AUTH_INVALID_BIOMETRIC,
            `Create Email: Device signature is invalid: ${biometricAuthPublicKey}, userid: ${userId}`,
          ),
        )
      }
      validated = true
    }

    if (!validated) {
      throw new Error(
        createApiErrorMessage(
          ERROR_CODES.GENERIC_VALIDATION_FAILED,
          `Create Email: Could not validate: ${email}`,
        ),
      )
    }

    if (def === true) {
      await EmailModel.clearAllDefaultByUserId(userId)
    }

    const emailUtil = new EmailUtil(email)
    try {
      const userEmail = new EmailModel()
      userEmail.userId = userId
      userEmail.email = emailUtil.formattedEmail()
      userEmail.label = label
      userEmail.default = def
      userEmail.verifiedAt = new Date()
      await userEmail.save()

      return { email: userEmail.emailObfuscated, id: userEmail.id }
    } catch (err) {
      const msg = (err as Error).message || 'Email could not be created.'
      this.logger.logError(msg)
      throw new Error(createApiErrorMessage(ERROR_CODES.GENERIC_SERVER_ERROR, msg))
    }
  }

  public async deleteEmail(id: string, userId?: string) {
    if (!id) {
      throw new Error(
        createApiErrorMessage(ERROR_CODES.GENERIC_VALIDATION_FAILED, 'No id provided for delete.'),
      )
    }

    const email = await EmailModel.findByPk(id)

    if (!email) {
      throw new Error(
        createApiErrorMessage(ERROR_CODES.EMAIL_NOT_FOUND, 'Email could not be found.'),
      )
    }

    if (userId) {
      if (userId !== email.userId) {
        throw new Error(
          createApiErrorMessage(ERROR_CODES.EMAIL_DELETE_FAILED, 'You cannot delete this email.'),
        )
      }
    }

    try {
      email.setDataValue('deletedAt', new Date())
      await email.save()

      return { id: email.id }
    } catch (err) {
      const msg = (err as Error).message || 'Email could not be deleted.'
      this.logger.logError(msg)
      throw new Error(createApiErrorMessage(ERROR_CODES.GENERIC_SERVER_ERROR, msg))
    }
  }

  public async isEmailAvailableAndValid(email: string, authFlow?: boolean) {
    if (!email) {
      throw new Error(
        createApiErrorMessage(ERROR_CODES.GENERIC_VALIDATION_FAILED, 'No value supplied'),
      )
    }

    const emailUtil = new EmailUtil(email)

    if (!emailUtil.validate()) {
      if (emailUtil.isDisposableDomain()) {
        throw new Error(
          createApiErrorMessage(
            ERROR_CODES.EMAIL_INVALID,
            'The email you provided is not valid. Disposable emails are not allowed.',
          ),
        )
      }

      throw new Error(
        createApiErrorMessage(ERROR_CODES.EMAIL_INVALID, 'The email you provided is not valid.'),
      )
    }

    if (!(await emailUtil.validateTld())) {
      throw new Error(
        createApiErrorMessage(ERROR_CODES.EMAIL_INVALID, 'The email you provided is not valid.'),
      )
    }

    const isEmailAvailable = await EmailModel.isEmailAvailable(emailUtil.formattedEmail())
    if (!isEmailAvailable) {
      if (authFlow) {
        return ERROR_CODES.EMAIL_ALREADY_EXISTS
      }
      throw new Error(
        createApiErrorMessage(ERROR_CODES.EMAIL_ALREADY_EXISTS, `${email} already exists.`),
      )
    }
  }

  public async updateEmail(id: string, payload: UpdateEmailPayloadType) {
    const { def, label } = payload

    if (!id) {
      throw new Error(
        createApiErrorMessage(ERROR_CODES.GENERIC_VALIDATION_FAILED, 'No id provided for update.'),
      )
    }

    const email = await EmailModel.findByPk(id)

    if (!email) {
      throw new Error(
        createApiErrorMessage(ERROR_CODES.EMAIL_NOT_FOUND, 'Email could not be found.'),
      )
    }

    try {
      if (def === true) {
        await EmailModel.clearAllDefaultByUserId(email.userId)
      }

      if (def !== undefined) {
        email.setDataValue('default', def)
      }
      if (label !== undefined && typeof label === 'string') {
        email.setDataValue('label', label)
      }

      await email.save()

      return { id }
    } catch (err) {
      const msg = (err as Error).message || 'Email could not be updated.'
      this.logger.logError(msg)
      throw new Error(createApiErrorMessage(ERROR_CODES.GENERIC_SERVER_ERROR, msg))
    }
  }
}

export type EmailServiceType = typeof EmailService.prototype
