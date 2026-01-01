import { Op } from 'sequelize'
import type { FindOptions, WhereOptions } from 'sequelize/types'
import zxcvbn from 'zxcvbn-typescript'

import { dxRsaValidateBiometricKey } from '@dx3/encryption'
import {
  type CreateUserPayloadType,
  type CreateUserResponseType,
  DEFAULT_LIMIT,
  DEFAULT_OFFSET,
  DEFAULT_SORT,
  ERROR_CODES,
  type GetUserListResponseType,
  type GetUserProfileReturnType,
  type GetUserResponseType,
  type GetUsersListQueryType,
  isUsernameValid,
  type OtpResponseType,
  PHONE_DEFAULT_REGION_CODE,
  type UpdatePasswordPayloadType,
  type UpdateUsernamePayloadType,
  type UpdateUserPayloadType,
  type UpdateUserResponseType,
  type UserType,
} from '@dx3/models-shared'

import { OtpService } from '../auth/otp/otp.service'
import { isProd } from '../config/config-api.service'
import { EMAIL_MODEL_OPTIONS } from '../email/email-api.consts'
import { EmailModel } from '../email/email-api.postgres-model'
import { ApiLoggingClass, type ApiLoggingClassType } from '../logger'
import { MailSendgrid } from '../mail/mail-api-sendgrid'
import { PHONE_MODEL_OPTIONS } from '../phone/phone-api.consts'
import { PhoneModel } from '../phone/phone-api.postgres-model'
import { ShortLinkModel } from '../shortlink/shortlink-api.postgres-model'
import { EmailUtil, PhoneUtil, ProfanityFilter } from '../utils'
import { createApiErrorMessage } from '../utils/lib/error/api-error.utils'
import { USER_FIND_ATTRIBUTES, USER_SORT_FIELDS } from './user-api.consts'
import { UserModel } from './user-api.postgres-model'
import { getUserProfileState } from './user-profile-api'

export class UserService {
  private logger: ApiLoggingClassType

  constructor() {
    this.logger = ApiLoggingClass.instance
  }

  private getSortListOptions(orderBy?: string, sortDir?: string): FindOptions['order'] {
    if (orderBy && USER_SORT_FIELDS.includes(orderBy)) {
      if (orderBy === 'fullName') {
        return [
          ['firstName', sortDir || DEFAULT_SORT],
          ['lastName', sortDir || DEFAULT_SORT],
        ]
      }

      if (orderBy === 'isAdmin' || orderBy === 'isSuperAdmin') {
        return [['roles', sortDir || DEFAULT_SORT]]
      }

      return [[orderBy, sortDir || DEFAULT_SORT]]
    }

    return [[USER_SORT_FIELDS[0], DEFAULT_SORT]]
  }

  private getLikeFilter(filterValue: string): { [Op.iLike]: string } {
    return {
      [Op.iLike]: `%${filterValue}%`,
    }
  }

  private getListSearchQuery(filterValue?: string): WhereOptions {
    if (filterValue) {
      const likeFilter = this.getLikeFilter(filterValue)

      return {
        where: {
          [Op.or]: {
            '$emails.email$': likeFilter,
            '$phones.phone$': likeFilter,
            firstName: likeFilter,
            lastName: likeFilter,
            username: likeFilter,
          },
          deletedAt: null,
        },
      }
    }

    return {
      where: {
        deletedAt: null,
      },
    }
  }

  public async createUser(payload: CreateUserPayloadType): Promise<CreateUserResponseType> {
    const {
      countryCode,
      regionCode,
      email,
      username,
      firstName,
      lastName,
      phone,
      roles,
      shouldValidate,
    } = payload

    if (!username || !email) {
      throw new Error(
        createApiErrorMessage(
          ERROR_CODES.USER_CREATE_FAILED,
          'Not enough information to create a user.',
        ),
      )
    }

    const profanityFilter = new ProfanityFilter()
    if (profanityFilter.isProfane(username)) {
      throw new Error('Profane usernames are not allowed.')
    }

    const emailUtil = new EmailUtil(email)
    if (!emailUtil.validate()) {
      throw new Error('Invalid Email')
    }

    let phoneValue: string
    let countryCodeValue: string = countryCode
    if (phone) {
      const phoneUtil = new PhoneUtil(phone, regionCode || PHONE_DEFAULT_REGION_CODE)
      if (!phoneUtil.isValid) {
        throw new Error('Invalid Phone')
      }
      countryCodeValue = phoneUtil.countryCode
      phoneValue = phoneUtil.nationalNumber
    }

    try {
      const user = await UserModel.createFromUsername(
        username,
        emailUtil.formattedEmail(),
        roles,
        firstName,
        lastName,
        phoneValue,
        countryCodeValue,
        regionCode || PHONE_DEFAULT_REGION_CODE,
        shouldValidate,
      )

      if (!user) {
        throw new Error(
          createApiErrorMessage(ERROR_CODES.USER_CREATE_FAILED, 'User could not be created.'),
        )
      }

      const mail = new MailSendgrid()
      const inviteUrl = `/auth/z?route=invite&token=${user.token}`
      const shortLink = await ShortLinkModel.generateShortlink(inviteUrl)

      try {
        const inviteMessageId = await mail.sendInvite(emailUtil.formattedEmail(), shortLink)
        await EmailModel.updateMessageInfoValidate(emailUtil.formattedEmail(), inviteMessageId)
        return {
          id: user.id,
          invited: !!inviteMessageId,
        }
      } catch (err) {
        this.logger.logError(err.message)
      }

      return {
        id: user.id,
        invited: false,
      }
    } catch (err) {
      const message = err.message || 'Could not create user.'
      this.logger.logError(message)
      throw new Error(message)
    }
  }

  public async deleteUser(id: string) {
    if (!id) {
      throw new Error(
        createApiErrorMessage(ERROR_CODES.USER_NOT_FOUND, 'No id provided for delete.'),
      )
    }

    try {
      const user = await UserModel.findByPk(id)

      if (!user) {
        throw new Error(
          createApiErrorMessage(ERROR_CODES.USER_NOT_FOUND, 'User could not be found.'),
        )
      }

      user.setDataValue('deletedAt', new Date())
      await user.save()

      return {
        userId: user.id,
      }
    } catch (err) {
      const message = err.message || 'Could not delete user.'
      this.logger.logError(message)
      throw new Error(message)
    }
  }

  public async getProfile(userId: string) {
    const profile: GetUserProfileReturnType = {
      profile: null,
    }

    if (!userId) {
      return profile
    }

    try {
      const user = await UserModel.findByPk(userId)

      if (!user) {
        return profile
      }

      await user.getEmails()
      await user.getPhones()
      profile.profile = await getUserProfileState(user, true)

      return profile
    } catch (err) {
      const message = err.message || 'Could not get user profile'
      this.logger.logError(message)
      throw new Error(message)
    }
  }

  public async getUser(id: string): Promise<GetUserResponseType> {
    if (!id) {
      throw new Error(
        createApiErrorMessage(ERROR_CODES.USER_NOT_FOUND, 'No id provided for search.'),
      )
    }

    try {
      const user = await UserModel.findOne({
        attributes: USER_FIND_ATTRIBUTES,
        include: [EMAIL_MODEL_OPTIONS, PHONE_MODEL_OPTIONS],
        where: {
          deletedAt: null,
          id,
        },
        // logging: this.DEBUG && console.debug,
      })

      if (!user) {
        throw new Error(
          createApiErrorMessage(ERROR_CODES.USER_NOT_FOUND, 'User could not be found.'),
        )
      }

      return user.toJSON()
    } catch (err) {
      const message = err.message || 'Could not get user.'
      this.logger.logError(message)
      throw new Error(message)
    }
  }

  public async getUserList(query: GetUsersListQueryType): Promise<GetUserListResponseType> {
    const { filterValue, limit, offset, orderBy, sortDir } = query

    const orderArgs = this.getSortListOptions(orderBy, sortDir)

    const search = this.getListSearchQuery(filterValue)

    try {
      const users = await UserModel.findAndCountAll({
        include: [EMAIL_MODEL_OPTIONS, PHONE_MODEL_OPTIONS],
        ...search,
        attributes: USER_FIND_ATTRIBUTES,
        limit: limit ? Number(limit) : DEFAULT_LIMIT,
        offset: offset ? Number(offset) : DEFAULT_OFFSET,
        order: orderArgs,
        subQuery: false,
        // logging: this.DEBUG && console.debug,
      })

      if (!users) {
        throw new Error('Search for users failed')
      }

      let count = 0
      const rows: UserType[] = []
      for (const user of users.rows) {
        rows.push(user.toJSON())
        count += 1
      }
      // @ts-expect-error - type mismatch - fix
      users.rows = rows
      users.count = count
      return users
    } catch (err) {
      const message = err.message || 'Could not get user list.'
      this.logger.logError(message)
      throw new Error(message)
    }
  }

  public async isUsernameAvailable(usernameToCheck: string) {
    if (!usernameToCheck) {
      throw new Error('Nothing to check.')
    }

    const result = { available: false }

    if (!isUsernameValid(usernameToCheck)) {
      return result
    }

    const profanityUtil = new ProfanityFilter()
    if (profanityUtil.isProfane(usernameToCheck)) {
      throw new Error('Profanity is not allowed')
    }
    try {
      result.available = await UserModel.isUsernameAvailable(usernameToCheck)
    } catch (err) {
      const message = err.message || 'Error checking for username availability'
      this.logger.logError(message)
      throw new Error(message)
    }

    return result
  }

  // public async resendInvite(payload: ResendInvitePayloadType): Promise<SendInviteResponseType> {
  //   const {
  //     id,
  //     email
  //   } = payload;
  //   if (
  //     !id
  //     || !email
  //   ) {
  //     throw new Error('Request is invalid.');
  //   }

  //   const emailUtil = new EmailUtil(email);

  //   try {
  //     if (!emailUtil.validate()) {
  //       if (emailUtil.isDisposableDomain()) {
  //         throw new Error('The email you provided is not valid. Please note that we do not allow disposable emails or emails that do not exist, so make sure to use a real email address.');
  //       }

  //       throw new Error('The email you provided is not valid.');
  //     }

  //     const token = await UserModel.updateToken(id);

  //     if (!token) {
  //       throw new Error('No token created.');
  //     }

  //     const mail = new MailSendgrid();
  //     const inviteUrl = `/auth/z?route=invite&token=${token}`;
  //     const shortLink = await ShortLinkModel.generateShortlink(inviteUrl);

  //     const inviteMessageId = await mail.sendInvite(emailUtil.formattedEmail(), shortLink);

  //     await EmailModel.updateMessageInfoValidate(emailUtil.formattedEmail(), inviteMessageId);

  //     return {
  //       invited: !!inviteMessageId
  //     };
  //   } catch (err) {
  //     const message = err.message || 'Could not send invite.';
  //     this.logger.logError(message);
  //     throw new Error(message);
  //   }
  // }

  public async sendOtpCode(userId: string): Promise<OtpResponseType> {
    if (!userId) {
      throw new Error('Request is invalid.')
    }

    try {
      const code = await OtpService.generateOptCode(userId)
      return isProd() ? { code: '' } : { code }
    } catch (err) {
      const message = err.message || 'Could not send code.'
      this.logger.logError(message)
      throw new Error(message)
    }
  }

  public async updatePassword(payload: UpdatePasswordPayloadType) {
    const { id, password, passwordConfirm, otp, signature } = payload

    if (!id || !password || !passwordConfirm || !(otp || signature)) {
      throw new Error('Request is invalid.')
    }

    if (password !== passwordConfirm) {
      throw new Error('Passwords must match.')
    }

    let validated = false

    if (otp.id) {
      let isCodeValid = false

      if (otp.method === 'PHONE') {
        const phoneRecord = await PhoneModel.findByPk(otp.id)
        if (!phoneRecord) {
          throw new Error('Could not get phone to validate code.')
        }
        const phoneUtil = new PhoneUtil(phoneRecord.phoneFormatted, phoneRecord.countryCode)
        isCodeValid = await OtpService.validateOptCodeByPhone(
          id,
          phoneUtil.countryCode,
          phoneUtil.nationalNumber,
          otp.code,
        )
      }

      if (otp.method === 'EMAIL') {
        const emailRecord = await EmailModel.findByPk(otp.id)
        if (!emailRecord) {
          throw new Error('Could not get email to validate code.')
        }
        isCodeValid = await OtpService.validateOptCodeByEmail(id, emailRecord.email, otp.code)
      }

      if (!isCodeValid) {
        throw new Error('Invalid OTP code.')
      }
      validated = true
    }

    if (signature) {
      const biometricAuthPublicKey = await UserModel.getBiomAuthKey(id)
      const isSignatureValid = dxRsaValidateBiometricKey(
        signature,
        password,
        biometricAuthPublicKey,
      )
      if (!isSignatureValid) {
        throw new Error(
          `Update Password: Device signature is invalid: ${biometricAuthPublicKey}, userid: ${id}`,
        )
      }
      validated = true
    }

    if (!validated) {
      throw new Error('Could not validate request.')
    }

    // Check password strength
    const pwStrength = zxcvbn(password)
    if (pwStrength.score < 3) {
      const pwStrengthMsg = `${pwStrength.feedback?.warning || ''}`
      throw new Error(`Please choose a stronger password. ${pwStrengthMsg}`)
    }

    try {
      const didUpdate = await UserModel.updatePassword(id, password)
      const result = { success: didUpdate }

      return result
    } catch (err) {
      console.error(err)
      const message = err.message || 'Could not update password.'
      this.logger.logError(message)
      throw new Error(message)
    }
  }

  public async updateRolesAndRestrictions(
    id: string,
    payload: UpdateUserPayloadType,
  ): Promise<UpdateUserResponseType> {
    const { restrictions, roles } = payload

    if (!id) {
      throw new Error(
        createApiErrorMessage(ERROR_CODES.USER_UPDATE_FAILED, 'No id provided for update.'),
      )
    }

    try {
      const user = await UserModel.findByPk(id)

      if (!user) {
        throw new Error(
          createApiErrorMessage(ERROR_CODES.USER_NOT_FOUND, 'User could not be found.'),
        )
      }

      if (restrictions !== undefined && Array.isArray(restrictions)) {
        user.setDataValue('restrictions', restrictions)
      }
      if (roles !== undefined && Array.isArray(roles)) {
        user.setDataValue('roles', roles)
      }

      await user.save()

      return {
        userId: user.id,
      }
    } catch (err) {
      const message = err.message || 'Could not update user.'
      this.logger.logError(message)
      throw new Error(message)
    }
  }

  public async updateUser(
    id: string,
    payload: UpdateUserPayloadType,
  ): Promise<UpdateUserResponseType> {
    const { firstName, lastName } = payload

    if (!id) {
      throw new Error(
        createApiErrorMessage(ERROR_CODES.USER_UPDATE_FAILED, 'No id provided for update.'),
      )
    }

    try {
      const user = await UserModel.findByPk(id)

      if (!user) {
        throw new Error(
          createApiErrorMessage(ERROR_CODES.USER_NOT_FOUND, 'User could not be found.'),
        )
      }

      const profanityFilter = new ProfanityFilter()

      if (firstName !== undefined && typeof firstName === 'string') {
        if (profanityFilter.isProfane(firstName)) {
          user.setDataValue('firstName', profanityFilter.cleanProfanity(firstName))
        } else {
          user.setDataValue('firstName', firstName)
        }
      }
      if (lastName !== undefined && typeof lastName === 'string') {
        if (profanityFilter.isProfane(lastName)) {
          user.setDataValue('lastName', profanityFilter.cleanProfanity(lastName))
        } else {
          user.setDataValue('lastName', lastName)
        }
      }

      await user.save()

      return {
        userId: user.id,
      }
    } catch (err) {
      const message = err.message || 'Could not update user.'
      this.logger.logError(message)
      throw new Error(message)
    }
  }

  public async updateUserName(
    id: string,
    payload: UpdateUsernamePayloadType,
  ): Promise<UpdateUserResponseType> {
    const { otpCode, signature, username } = payload

    if (!id || !(otpCode || signature)) {
      const msg = `${!id ? 'No id provided' : 'No otp or signature provided'} for username update.`
      throw new Error(createApiErrorMessage(ERROR_CODES.USER_UPDATE_FAILED, msg))
    }

    if (otpCode) {
      const isCodeValid = await OtpService.validateOptCode(id, otpCode)
      if (!isCodeValid) {
        throw new Error('Invalid OTP code.')
      }
    }

    if (signature) {
      const biometricAuthPublicKey = await UserModel.getBiomAuthKey(id)
      const isSignatureValid = dxRsaValidateBiometricKey(
        signature,
        username,
        biometricAuthPublicKey,
      )
      if (!isSignatureValid) {
        throw new Error(
          `Update Username: Device signature is invalid: ${biometricAuthPublicKey}, userid: ${id}`,
        )
      }
    }

    const isAvailable = await this.isUsernameAvailable(username)
    if (!isAvailable.available) {
      throw new Error('Username is not available.')
    }

    const profanityUtil = new ProfanityFilter()
    if (profanityUtil.isProfane(username)) {
      throw new Error('Profanity is not allowed')
    }

    try {
      const user = await UserModel.findByPk(id)

      if (!user) {
        throw new Error(`User could not be found with the id: ${id}`)
      }

      user.setDataValue('username', username)

      await user.save()

      return {
        userId: user.id,
      }
    } catch (err) {
      const message = err.message || 'Could not update username.'
      this.logger.logError(message)
      throw new Error(message)
    }
  }
}

export type UserServiceType = typeof UserService.prototype
