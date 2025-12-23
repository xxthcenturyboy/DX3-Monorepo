import { dxRsaValidateBiometricKey } from '@dx3/encryption/src'
import type { CreateEmailPayloadType, UpdateEmailPayloadType } from '@dx3/models-shared'

import { OtpService } from '../auth/otp/otp.service'
import { isDev } from '../config/config-api.service'
import { ApiLoggingClass, type ApiLoggingClassType } from '../logger'
import { UserModel } from '../user/user-api.postgres-model'
import { EmailUtil } from '../utils'
import { EmailModel } from './email-api.postgres-model'

export class EmailService {
  private LOCAL = isDev()
  private logger: ApiLoggingClassType

  constructor() {
    this.logger = ApiLoggingClass.instance
  }

  public async isEmailAvailableAndValid(email: string) {
    if (!email) {
      throw new Error('No email sent.')
    }

    const emailUtil = new EmailUtil(email)

    if (!emailUtil.validate()) {
      if (emailUtil.isDisposableDomain()) {
        throw new Error(
          'The email you provided is not valid. Please note that we do not allow disposable emails or emails that do not exist, so make sure to use a real email address.',
        )
      }

      throw new Error('The email you provided is not valid.')
    }

    if (!(await emailUtil.validateTld())) {
      throw new Error(`The email you provided is not valid: TLD.`)
    }

    const isEmailAvailable = await EmailModel.isEmailAvailable(emailUtil.formattedEmail())
    if (!isEmailAvailable) {
      throw new Error(`${email} already exists.`)
    }
  }

  public async createEmail(payload: CreateEmailPayloadType) {
    const { code, def, email, label, signature, userId } = payload

    if (!userId || !email) {
      throw new Error('Not enough information to create an email.')
    }

    await this.isEmailAvailableAndValid(email)
    let validated = false

    if (code) {
      const isCodeValid = await OtpService.validateOptCodeByEmail(userId, email, code)
      if (!isCodeValid) {
        throw new Error('Invalid OTP code.')
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
          `Create Email: Device signature is invalid: ${biometricAuthPublicKey}, userid: ${userId}`,
        )
      }
      validated = true
    }

    if (!validated) {
      throw new Error(`Create Email: Could not validate: ${email}`)
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

      return { id: userEmail.id }
    } catch (err) {
      this.logger.logError((err as Error).message || 'Email could not be created.')
    }

    return { id: '' }
  }

  public async deleteEmail(id: string, userId?: string) {
    if (!id) {
      throw new Error('No id for delete email.')
    }

    const email = await EmailModel.findByPk(id)

    if (!email) {
      throw new Error(`Email could not be found with the id: ${id}`)
    }

    if (userId) {
      if (userId !== email.userId) {
        throw new Error('You cannot delete this email.')
      }
    }

    try {
      email.setDataValue('deletedAt', new Date())
      await email.save()

      return { id: email.id }
    } catch (err) {
      this.logger.logError((err as Error).message || 'Email could not be deleted.')
      return { id: '' }
    }
  }

  public async updateEmail(id: string, payload: UpdateEmailPayloadType) {
    const { def, label } = payload

    if (!id) {
      throw new Error('No id for update email.')
    }

    const email = await EmailModel.findByPk(id)

    if (!email) {
      throw new Error(`Email could not be found with the id: ${id}`)
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
      this.logger.logError((err as Error).message || 'Email could not be updated.')
      throw new Error((err as Error).message || 'Email could not be updated.')
    }
  }

  // TODO: Only used in test - remove when can
  public async validateTestEmail(email: string) {
    if (this.LOCAL) {
      await EmailModel.validateEmail(email)
    }
  }

  // TODO: Only used in test - remove when can
  public async deleteTestEmail(id: string) {
    if (this.LOCAL) {
      await EmailModel.destroy({
        force: true,
        where: {
          id,
        },
      })
    }
  }
}

export type EmailServiceType = typeof EmailService.prototype
