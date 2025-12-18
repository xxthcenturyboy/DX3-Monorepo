import parsePhoneNumber from 'libphonenumber-js'

import { dxRsaValidateBiometricKey } from '@dx3/encryption/src'
import {
  type CreatePhonePayloadType,
  PHONE_DEFAULT_REGION_CODE,
  type UpdatePhonePayloadType,
} from '@dx3/models-shared'

import { OtpService } from '../auth/otp/otp.service'
import { isLocal } from '../config/config-api.service'
import { ApiLoggingClass, type ApiLoggingClassType } from '../logger'
import { UserModel } from '../user/user-api.postgres-model'
import { PhoneUtil } from '../utils'
import { PhoneModel } from './phone-api.postgres-model'

export class PhoneService {
  private LOCAL: boolean
  private logger: ApiLoggingClassType

  constructor() {
    this.LOCAL = isLocal()
    this.logger = ApiLoggingClass.instance
  }

  public async isPhoneAvailableAndValid(phone: string, regionCode: string) {
    if (!phone || !regionCode) {
      throw new Error('Missing phone or region code.')
    }

    const phoneUtil = new PhoneUtil(phone, regionCode || PHONE_DEFAULT_REGION_CODE)

    if (!phoneUtil.isValid) {
      this.logger.logError(`invalid phone: ${phone}, ${regionCode || PHONE_DEFAULT_REGION_CODE}`)
      throw new Error('This phone cannot be used (invalid).')
    }

    const phoneAvailable = await PhoneModel.isPhoneAvailable(
      phoneUtil.nationalNumber,
      phoneUtil.countryCode,
    )
    if (!phoneAvailable) {
      const formatted = parsePhoneNumber(phoneUtil.normalizedPhone)
      throw new Error(`${formatted?.formatNational()} is already in use.`)
    }
  }

  public async createPhone(payload: CreatePhonePayloadType) {
    const {
      code,
      // countryCode,
      regionCode,
      def,
      label,
      phone,
      signature,
      userId,
    } = payload

    if (!userId || !phone) {
      throw new Error('Not enough information to create a phone.')
    }

    await this.isPhoneAvailableAndValid(phone, regionCode || PHONE_DEFAULT_REGION_CODE)
    const phoneUtil = new PhoneUtil(phone, regionCode || PHONE_DEFAULT_REGION_CODE)
    let validated = false

    if (code) {
      const isCodeValid = await OtpService.validateOptCodeByPhone(
        userId,
        phoneUtil.countryCode,
        phoneUtil.nationalNumber,
        code,
      )
      if (!isCodeValid) {
        throw new Error('Invalid OTP code.')
      }
      validated = true
    }

    if (signature) {
      const biometricAuthPublicKey = (await UserModel.getBiomAuthKey(userId)) || ''
      const isSignatureValid = dxRsaValidateBiometricKey(signature, phone, biometricAuthPublicKey)
      if (!isSignatureValid) {
        throw new Error(
          `Create Phone: Device signature is invalid: ${biometricAuthPublicKey}, userid: ${userId}`,
        )
      }
      validated = true
    }

    if (!validated) {
      throw new Error(`Create Phone: Could not validate: ${phoneUtil.nationalNumber}`)
    }

    if (def === true) {
      if (!phoneUtil.isValidMobile) {
        throw new Error(
          'Cannot use this phone number as your default. It must be a valid mobile number.',
        )
      }
      await PhoneModel.clearAllDefaultByUserId(userId)
    }

    try {
      const userPhone = new PhoneModel()
      userPhone.userId = userId
      userPhone.countryCode = phoneUtil.countryCode
      userPhone.regionCode = regionCode || PHONE_DEFAULT_REGION_CODE
      userPhone.phone = phoneUtil.nationalNumber
      userPhone.label = label
      userPhone.default = def
      userPhone.verifiedAt = new Date()
      await userPhone.save()

      return { id: userPhone.id, phoneFormatted: phoneUtil.normalizedPhone }
    } catch (err) {
      this.logger.logError((err as Error).message || 'Phone could not be created.')
    }

    return { id: '' }
  }

  public async deletePhone(id: string, userId?: string) {
    if (!id) {
      throw new Error('No id for delete phone.')
    }

    const phone = await PhoneModel.findByPk(id)

    if (!phone) {
      throw new Error(`Phone could not be found with the id: ${id}`)
    }

    if (userId) {
      if (userId !== phone.userId) {
        throw new Error('You cannot delete this phone.')
      }
    }

    try {
      phone.setDataValue('deletedAt', new Date())
      await phone.save()

      return { id: phone.id }
    } catch (err) {
      this.logger.logError((err as Error).message || 'Phone could not be deleted.')
      return { id: '' }
    }
  }

  public async deleteTestPhone(id: string) {
    if (this.LOCAL) {
      await PhoneModel.destroy({
        force: true,
        where: {
          id,
        },
      })
    }
  }

  public async updatePhone(id: string, payload: UpdatePhonePayloadType) {
    const { def, label } = payload

    if (!id) {
      throw new Error('No id for update phone.')
    }

    const phone = await PhoneModel.findByPk(id)

    if (!phone) {
      throw new Error(`Phone could not be found with the id: ${id}`)
    }

    try {
      if (def === true) {
        await PhoneModel.clearAllDefaultByUserId(phone.userId)
      }

      if (def !== undefined) {
        phone.setDataValue('default', def)
      }
      if (label !== undefined && typeof label === 'string') {
        phone.setDataValue('label', label)
      }

      await phone.save()

      return { id }
    } catch (err) {
      this.logger.logError((err as Error).message || 'Phone could not be updated.')
      throw new Error((err as Error).message || 'Phone could not be updated.')
    }
  }
}

export type PhoneServiceType = typeof PhoneService.prototype
