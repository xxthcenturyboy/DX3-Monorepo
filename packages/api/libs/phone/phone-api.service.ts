import parsePhoneNumber from 'libphonenumber-js'

import { dxRsaValidateBiometricKey } from '@dx3/encryption/src'
import {
  type CreatePhonePayloadType,
  ERROR_CODES,
  PHONE_DEFAULT_REGION_CODE,
  type UpdatePhonePayloadType,
} from '@dx3/models-shared'

import { OtpService } from '../auth/otp/otp.service'
import { ApiLoggingClass, type ApiLoggingClassType } from '../logger'
import { UserModel } from '../user/user-api.postgres-model'
import { PhoneUtil } from '../utils'
import { createApiErrorMessage } from '../utils/lib/error/api-error.utils'
import { PhoneModel } from './phone-api.postgres-model'

export class PhoneService {
  private logger: ApiLoggingClassType

  constructor() {
    this.logger = ApiLoggingClass.instance
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
      throw new Error(
        createApiErrorMessage(ERROR_CODES.GENERIC_VALIDATION_FAILED, 'No value supplied'),
      )
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
        throw new Error(createApiErrorMessage(ERROR_CODES.AUTH_OTP_INVALID, 'Invalid OTP code.'))
      }
      validated = true
    }

    if (signature) {
      const biometricAuthPublicKey = (await UserModel.getBiomAuthKey(userId)) || ''
      const isSignatureValid = dxRsaValidateBiometricKey(signature, phone, biometricAuthPublicKey)
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
          `Create Email: Could not validate: ${phoneUtil.nationalNumber}`,
        ),
      )
    }

    if (def === true) {
      if (!phoneUtil.isValidMobile) {
        throw new Error(
          createApiErrorMessage(
            ERROR_CODES.PHONE_INVALID,
            'Cannot use this phone number as your default. It must be a valid mobile number.',
          ),
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

      return { id: userPhone.id, phone: userPhone.phoneObfuscated }
    } catch (err) {
      const msg = (err as Error).message || 'PHone could not be created.'
      this.logger.logError(msg)
      throw new Error(createApiErrorMessage(ERROR_CODES.GENERIC_SERVER_ERROR, msg))
    }
  }

  public async deletePhone(id: string, userId?: string) {
    if (!id) {
      throw new Error(
        createApiErrorMessage(ERROR_CODES.GENERIC_VALIDATION_FAILED, 'No id provided for delete.'),
      )
    }

    const phone = await PhoneModel.findByPk(id)

    if (!phone) {
      throw new Error(
        createApiErrorMessage(ERROR_CODES.PHONE_NOT_FOUND, 'Phone could not be found.'),
      )
    }

    if (userId) {
      if (userId !== phone.userId) {
        throw new Error(
          createApiErrorMessage(ERROR_CODES.PHONE_DELETE_FAILED, 'You cannot delete this phone.'),
        )
      }
    }

    try {
      phone.setDataValue('deletedAt', new Date())
      await phone.save()

      return { id: phone.id }
    } catch (err) {
      const msg = (err as Error).message || 'Phone could not be deleted.'
      this.logger.logError(msg)
      throw new Error(createApiErrorMessage(ERROR_CODES.GENERIC_SERVER_ERROR, msg))
    }
  }

  public async isPhoneAvailableAndValid(phone: string, regionCode: string, authFlow?: boolean) {
    if (!phone || !regionCode) {
      throw new Error(
        createApiErrorMessage(
          ERROR_CODES.GENERIC_VALIDATION_FAILED,
          'Missing phone or region code.',
        ),
      )
    }

    const phoneUtil = new PhoneUtil(phone, regionCode || PHONE_DEFAULT_REGION_CODE)

    if (!phoneUtil.isValid) {
      this.logger.logError(`invalid phone: ${phone}, ${regionCode || PHONE_DEFAULT_REGION_CODE}`)
      throw new Error(
        createApiErrorMessage(ERROR_CODES.PHONE_INVALID, 'This phone cannot be used.'),
      )
    }

    const phoneAvailable = await PhoneModel.isPhoneAvailable(
      phoneUtil.nationalNumber,
      phoneUtil.countryCode,
    )
    if (!phoneAvailable) {
      if (authFlow) {
        return ERROR_CODES.PHONE_ALREADY_EXISTS
      }
      const formatted = parsePhoneNumber(phoneUtil.normalizedPhone)
      throw new Error(
        createApiErrorMessage(
          ERROR_CODES.PHONE_ALREADY_EXISTS,
          `${formatted?.formatNational()} is already in use.`,
        ),
      )
    }

    return null
  }

  public async updatePhone(id: string, payload: UpdatePhonePayloadType) {
    const { def, label } = payload

    if (!id) {
      throw new Error(
        createApiErrorMessage(ERROR_CODES.GENERIC_VALIDATION_FAILED, 'No id provided for update.'),
      )
    }

    const phone = await PhoneModel.findByPk(id)

    if (!phone) {
      throw new Error(
        createApiErrorMessage(ERROR_CODES.PHONE_NOT_FOUND, 'Phone could not be found.'),
      )
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
      const msg = (err as Error).message || 'Phone could not be updated.'
      this.logger.logError(msg)
      throw new Error(createApiErrorMessage(ERROR_CODES.GENERIC_SERVER_ERROR, msg))
    }
  }
}

export type PhoneServiceType = typeof PhoneService.prototype
