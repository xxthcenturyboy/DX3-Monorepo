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
} from '@dx3/models-shared'

import { OtpService } from '../auth/otp/otp.service'
import { isDebug, isProd } from '../config/config-api.service'
import { EMAIL_MODEL_OPTIONS } from '../email/email-api.consts'
import { EmailModel, type EmailModelType } from '../email/email-api.postgres-model'
import { EmailService } from '../email/email-api.service'
import { ApiLoggingClass, type ApiLoggingClassType } from '../logger'
import { MailSendgrid } from '../mail/mail-api-sendgrid'
import { PHONE_MODEL_OPTIONS } from '../phone/phone-api.consts'
import { PhoneModel, type PhoneModelType } from '../phone/phone-api.postgres-model'
import { ShortLinkModel } from '../shortlink/shortlink-api.postgres-model'
import { EmailUtil, PhoneUtil, ProfanityFilter } from '../utils'
import { createApiErrorMessage } from '../utils/lib/error/api-error.utils'
import { USER_FIND_ATTRIBUTES, USER_SORT_FIELDS } from './user-api.consts'
import { UserModel, type UserModelType } from './user-api.postgres-model'
import { getUserProfileState } from './user-profile-api'

export class UserService {
  private DEBUG = isDebug()
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

  private hidePiiFromUser(user: UserModelType): UserModelType {
    user.emails = user.emails.map((email) => {
      const { emailObfuscated, ...rest } = email
      email = { ...rest, email: emailObfuscated } as EmailModelType
      return email
    })
    user.phones = user.phones.map((phone) => {
      // biome-ignore lint/correctness/noUnusedVariables: we're pulling this out to remove from object
      const { phoneFormatted, phoneObfuscated, ...rest } = phone
      phone = { ...rest, phone: phoneObfuscated } as PhoneModelType
      return phone
    })

    return user
  }

  private formatPii(user: UserModelType): UserModelType {
    user.emails = user.emails.map((emailData) => {
      // biome-ignore lint/correctness/noUnusedVariables: we're pulling this out to remove from object
      const { email, emailObfuscated, ...rest } = emailData
      emailData = { ...rest, email } as EmailModelType
      return emailData
    })
    user.phones = user.phones.map((phoneData) => {
      // biome-ignore lint/correctness/noUnusedVariables: we're pulling this out to remove from object
      const { phoneFormatted, phoneObfuscated, ...rest } = phoneData
      phoneData = { ...rest, phone: phoneFormatted } as PhoneModelType
      return phoneData
    })

    return user
  }

  private shouldHidePii(loggedInUser: UserModelType | null): boolean {
    if (!loggedInUser) return true

    return !loggedInUser.isSuperAdmin
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
          ERROR_CODES.GENERIC_VALIDATION_FAILED,
          'Not enough information to create a user.',
        ),
      )
    }

    const profanityFilter = new ProfanityFilter()
    if (profanityFilter.isProfane(username)) {
      throw new Error(
        createApiErrorMessage(
          ERROR_CODES.USER_PROFANE_USERNAMES_NOT_ALLOWED,
          'Profane usernames are not allowed.',
        ),
      )
    }

    const emailUtil = new EmailUtil(email)
    const emailService = new EmailService()
    // will throw if email is invalid
    await emailService.isEmailAvailableAndValid(email)

    let phoneValue: string
    let countryCodeValue: string = countryCode
    if (phone) {
      const phoneUtil = new PhoneUtil(phone, regionCode || PHONE_DEFAULT_REGION_CODE)
      if (!phoneUtil.isValid) {
        throw new Error(createApiErrorMessage(ERROR_CODES.PHONE_INVALID, 'Invalid Phone'))
      }

      const phoneAvailable = await PhoneModel.isPhoneAvailable(
        phoneUtil.nationalNumber,
        phoneUtil.countryCode,
      )
      if (!phoneAvailable) {
        throw new Error(
          createApiErrorMessage(ERROR_CODES.PHONE_ALREADY_EXISTS, 'Phone already exists'),
        )
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
        throw new Error('User could not be created.')
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
        const msg = `Email invite failed to send: ${(err as Error).message}`
        this.logger.logError(msg)
        throw new Error(msg)
      }
    } catch (err) {
      const msg = (err as Error).message
      this.logger.logError(msg)
      throw new Error(createApiErrorMessage(ERROR_CODES.GENERIC_SERVER_ERROR, msg))
    }
  }

  public async deleteUser(id: string) {
    if (!id) {
      throw new Error(
        createApiErrorMessage(ERROR_CODES.GENERIC_VALIDATION_FAILED, 'No id provided for delete.'),
      )
    }

    let user: UserModelType | null = null

    try {
      user = await UserModel.findOne({
        attributes: USER_FIND_ATTRIBUTES,
        include: [EMAIL_MODEL_OPTIONS, PHONE_MODEL_OPTIONS],
        where: {
          deletedAt: null,
          id,
        },
      })
    } catch (err) {
      const msg = (err as Error).message
      this.logger.logError(msg)
      throw new Error(createApiErrorMessage(ERROR_CODES.GENERIC_SERVER_ERROR, msg))
    }

    if (!user) {
      throw new Error(createApiErrorMessage(ERROR_CODES.USER_NOT_FOUND, 'User could not be found.'))
    }

    try {
      user.setDataValue('deletedAt', new Date())
      await user.save()

      return {
        userId: user.id,
      }
    } catch (err) {
      const msg = (err as Error).message
      this.logger.logError(msg)
      throw new Error(createApiErrorMessage(ERROR_CODES.GENERIC_SERVER_ERROR, msg))
    }
  }

  public async getProfile(userId: string) {
    const profile: GetUserProfileReturnType = {
      profile: null,
    }

    if (!userId) {
      throw new Error(
        createApiErrorMessage(ERROR_CODES.GENERIC_VALIDATION_FAILED, 'No ID supplied'),
      )
    }

    let user: UserModelType | null = null

    try {
      user = await UserModel.findByPk(userId)
    } catch (err) {
      const msg = (err as Error).message
      this.logger.logError(msg)
      throw new Error(createApiErrorMessage(ERROR_CODES.GENERIC_SERVER_ERROR, msg))
    }

    if (!user) {
      throw new Error(createApiErrorMessage(ERROR_CODES.USER_NOT_FOUND, 'User could not be found.'))
    }

    try {
      await user.getEmails()
      await user.getPhones()
      profile.profile = await getUserProfileState(user, true)

      return profile
    } catch (err) {
      const msg = (err as Error).message
      this.logger.logError(msg)
      throw new Error(createApiErrorMessage(ERROR_CODES.GENERIC_SERVER_ERROR, msg))
    }
  }

  public async getUser(id: string, loggedInUserId: string): Promise<GetUserResponseType> {
    if (!id) {
      throw new Error(
        createApiErrorMessage(ERROR_CODES.GENERIC_VALIDATION_FAILED, 'No id provided for search.'),
      )
    }

    let loggedInUser: UserModelType | null = null
    let user: UserModelType | null = null

    try {
      if (loggedInUserId) {
        loggedInUser = await UserModel.findByPk(loggedInUserId)
      }
    } catch (err) {
      this.logger.logError((err as Error).message)
    }

    try {
      user = await UserModel.findOne({
        attributes: USER_FIND_ATTRIBUTES,
        include: [EMAIL_MODEL_OPTIONS, PHONE_MODEL_OPTIONS],
        where: {
          deletedAt: null,
          id,
        },
      })
    } catch (err) {
      const msg = (err as Error).message
      this.logger.logError(msg)
      throw new Error(createApiErrorMessage(ERROR_CODES.GENERIC_SERVER_ERROR, msg))
    }

    if (!user) {
      throw new Error(createApiErrorMessage(ERROR_CODES.USER_NOT_FOUND, 'User could not be found.'))
    }

    try {
      const userJson = user.toJSON()
      if (this.shouldHidePii(loggedInUser)) {
        return this.hidePiiFromUser(userJson)
      }
      return this.formatPii(userJson)
    } catch (err) {
      const msg = (err as Error).message
      this.logger.logError(msg)
      throw new Error(createApiErrorMessage(ERROR_CODES.GENERIC_SERVER_ERROR, msg))
    }
  }

  public async getUserList(query: GetUsersListQueryType): Promise<GetUserListResponseType> {
    const { filterValue, limit, offset, orderBy, sortDir } = query

    const orderArgs = this.getSortListOptions(orderBy, sortDir)

    const search = this.getListSearchQuery(filterValue)

    let users: { rows: UserModelType[]; count: number } = { count: 0, rows: [] }

    try {
      users = await UserModel.findAndCountAll({
        ...search,
        attributes: USER_FIND_ATTRIBUTES,
        distinct: true,
        include: [EMAIL_MODEL_OPTIONS, PHONE_MODEL_OPTIONS],
        limit: limit ? Number(limit) : DEFAULT_LIMIT,
        // logging: this.DEBUG && console.debug,
        offset: offset ? Number(offset) : DEFAULT_OFFSET,
        order: orderArgs,
      })
    } catch (err) {
      const msg = (err as Error).message
      this.logger.logError(msg)
      throw new Error(createApiErrorMessage(ERROR_CODES.GENERIC_SERVER_ERROR, msg))
    }

    try {
      let count = 0
      const rows: UserModelType[] = []
      for (const user of users.rows) {
        const userJson = user.toJSON()
        rows.push(this.hidePiiFromUser(userJson))
        count += 1
      }
      users.rows = rows
      users.count = count
      return users
    } catch (err) {
      const msg = (err as Error).message
      this.logger.logError(msg)
      throw new Error(createApiErrorMessage(ERROR_CODES.GENERIC_SERVER_ERROR, msg))
    }
  }

  public async isUsernameAvailable(usernameToCheck: string) {
    if (!usernameToCheck) {
      throw new Error(
        createApiErrorMessage(ERROR_CODES.GENERIC_VALIDATION_FAILED, 'Nothing provided to search.'),
      )
    }

    const result = { available: false }

    if (!isUsernameValid(usernameToCheck)) {
      return result
    }

    const profanityUtil = new ProfanityFilter()
    if (profanityUtil.isProfane(usernameToCheck)) {
      throw new Error(
        createApiErrorMessage(
          ERROR_CODES.USER_PROFANE_USERNAMES_NOT_ALLOWED,
          'Profane usernames are not allowed.',
        ),
      )
    }

    try {
      result.available = await UserModel.isUsernameAvailable(usernameToCheck)
    } catch (err) {
      const msg = (err as Error).message
      this.logger.logError(msg)
      throw new Error(createApiErrorMessage(ERROR_CODES.GENERIC_SERVER_ERROR, msg))
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
      throw new Error(
        createApiErrorMessage(ERROR_CODES.GENERIC_VALIDATION_FAILED, 'No value provided.'),
      )
    }

    try {
      const code = await OtpService.generateOptCode(userId)
      return isProd() ? { code: '' } : { code }
    } catch (err) {
      const msg = (err as Error).message
      this.logger.logError(msg)
      throw new Error(createApiErrorMessage(ERROR_CODES.GENERIC_SERVER_ERROR, msg))
    }
  }

  public async updatePassword(payload: UpdatePasswordPayloadType) {
    const { id, password, passwordConfirm, otp, signature } = payload

    if (!id || !password || !passwordConfirm || !(otp || signature)) {
      throw new Error(
        createApiErrorMessage(ERROR_CODES.GENERIC_VALIDATION_FAILED, 'No value provided.'),
      )
    }

    if (password !== passwordConfirm) {
      throw new Error(
        createApiErrorMessage(ERROR_CODES.GENERIC_VALIDATION_FAILED, 'Passwords must match.'),
      )
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
      const msg = (err as Error).message
      this.logger.logError(msg)
      throw new Error(createApiErrorMessage(ERROR_CODES.GENERIC_SERVER_ERROR, msg))
    }
  }

  public async updateRolesAndRestrictions(
    id: string,
    payload: UpdateUserPayloadType,
  ): Promise<UpdateUserResponseType> {
    const { restrictions, roles } = payload

    if (!id) {
      throw new Error(
        createApiErrorMessage(ERROR_CODES.GENERIC_VALIDATION_FAILED, 'No value provided.'),
      )
    }

    let user: UserModelType | null = null

    try {
      user = await UserModel.findByPk(id)
    } catch (err) {
      const msg = (err as Error).message
      this.logger.logError(msg)
      throw new Error(createApiErrorMessage(ERROR_CODES.GENERIC_SERVER_ERROR, msg))
    }

    if (!user) {
      throw new Error(createApiErrorMessage(ERROR_CODES.USER_NOT_FOUND, 'User could not be found.'))
    }

    try {
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
      const msg = (err as Error).message
      this.logger.logError(msg)
      throw new Error(createApiErrorMessage(ERROR_CODES.GENERIC_SERVER_ERROR, msg))
    }
  }

  public async updateUser(
    id: string,
    payload: UpdateUserPayloadType,
  ): Promise<UpdateUserResponseType> {
    const { firstName, lastName } = payload

    if (!id) {
      throw new Error(
        createApiErrorMessage(ERROR_CODES.GENERIC_VALIDATION_FAILED, 'No id provided for update.'),
      )
    }

    let user: UserModelType | null = null

    try {
      user = await UserModel.findByPk(id)
    } catch (err) {
      const msg = (err as Error).message
      this.logger.logError(msg)
      throw new Error(createApiErrorMessage(ERROR_CODES.GENERIC_SERVER_ERROR, msg))
    }

    if (!user) {
      throw new Error(createApiErrorMessage(ERROR_CODES.USER_NOT_FOUND, 'User could not be found.'))
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

    try {
      await user.save()

      return {
        userId: user.id,
      }
    } catch (err) {
      const msg = (err as Error).message
      this.logger.logError(msg)
      throw new Error(createApiErrorMessage(ERROR_CODES.GENERIC_SERVER_ERROR, msg))
    }
  }

  public async updateUserName(
    id: string,
    payload: UpdateUsernamePayloadType,
  ): Promise<UpdateUserResponseType> {
    const { otpCode, signature, username } = payload

    if (!id || !(otpCode || signature)) {
      const msg = `${!id ? 'No id provided' : 'No otp or signature provided'} for username update.`
      throw new Error(createApiErrorMessage(ERROR_CODES.GENERIC_VALIDATION_FAILED, msg))
    }

    if (otpCode) {
      const isCodeValid = await OtpService.validateOptCode(id, otpCode)
      if (!isCodeValid) {
        throw new Error(createApiErrorMessage(ERROR_CODES.AUTH_OTP_INVALID, 'Invalid OTP code.'))
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
          createApiErrorMessage(
            ERROR_CODES.AUTH_INVALID_BIOMETRIC,
            `Update username: Device signature is invalid: ${biometricAuthPublicKey}, userid: ${id}`,
          ),
        )
      }
    }

    const isAvailable = await this.isUsernameAvailable(username)
    if (!isAvailable.available) {
      throw new Error(
        createApiErrorMessage(ERROR_CODES.USER_USERNAME_UNAVAILABLE, 'Username is not available.'),
      )
    }

    let user: UserModelType | null = null

    try {
      user = await UserModel.findByPk(id)
    } catch (err) {
      const msg = (err as Error).message
      this.logger.logError(msg)
      throw new Error(createApiErrorMessage(ERROR_CODES.GENERIC_SERVER_ERROR, msg))
    }

    if (!user) {
      throw new Error(createApiErrorMessage(ERROR_CODES.USER_NOT_FOUND, 'User could not be found.'))
    }

    try {
      user.setDataValue('username', username)

      await user.save()

      return {
        userId: user.id,
      }
    } catch (err) {
      const msg = (err as Error).message
      this.logger.logError(msg)
      throw new Error(createApiErrorMessage(ERROR_CODES.GENERIC_SERVER_ERROR, msg))
    }
  }
}

export type UserServiceType = typeof UserService.prototype
