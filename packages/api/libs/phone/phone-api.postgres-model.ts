import { fn, type NonAttribute } from 'sequelize'
import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript'

import { PHONE_DEFAULT_REGION_CODE } from '@dx3/models-shared'
import { getTimeFromUuid } from '@dx3/utils-shared'

import { UserModel, type UserModelType } from '../user/user-api.postgres-model'
import { PhoneUtil } from '../utils'
import { PHONE_POSTGRES_DB_NAME } from './phone-api.consts'

@Table({
  indexes: [
    {
      fields: ['user_id'],
      name: 'phone_user_id_index',
      unique: false,
    },
    {
      fields: ['country_code', 'phone'],
      name: 'country_code_phone_index',
      unique: false,
    },
  ],
  modelName: PHONE_POSTGRES_DB_NAME,
  timestamps: true,
  underscored: true,
})
export class PhoneModel extends Model<PhoneModel> {
  @PrimaryKey
  @Default(fn('uuid_generate_v4'))
  @AllowNull(false)
  @Column(DataType.UUID)
  id: string

  @ForeignKey(() => UserModel)
  @AllowNull(false)
  @Column({ field: 'user_id', type: DataType.UUID })
  userId: string

  @BelongsTo(() => UserModel, 'userId')
  declare user?: NonAttribute<UserModelType>

  @AllowNull(false)
  @Column({ field: 'country_code', type: DataType.STRING(5) })
  countryCode: string

  @AllowNull(false)
  @Column({
    defaultValue: PHONE_DEFAULT_REGION_CODE,
    field: 'region_code',
    type: DataType.STRING(2),
  })
  regionCode: string

  // @Is(/^\+?[0-9]{7,15}$/)
  @AllowNull(false)
  @Column(DataType.STRING(20))
  phone: string

  @Column(DataType.STRING)
  label: string

  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  default: boolean

  @Column({ field: 'twilio_message_id', type: DataType.STRING })
  twilioMessageId: string

  @Column({ field: 'deleted_at', type: DataType.DATE })
  deletedAt: Date | null

  @Column({ field: 'verified_at', type: DataType.DATE })
  verifiedAt: Date

  @Default(fn('now'))
  @AllowNull(false)
  @Column({ field: 'created_at', type: DataType.DATE })
  createdAt: Date

  @Default(fn('now'))
  @AllowNull(false)
  @Column({ field: 'updated_at', type: DataType.DATE })
  updatedAt: Date

  @Column(new DataType.VIRTUAL(DataType.STRING, ['countryCode', 'phone', 'regionCode']))
  get phoneFormatted(): string {
    const phoneUtil = new PhoneUtil(this.getDataValue('phone'), this.getDataValue('regionCode'))
    return phoneUtil.normalizedPhone
  }

  @Column(new DataType.VIRTUAL(DataType.BOOLEAN, ['verifiedAt', 'deletedAt']))
  get isVerified(): boolean {
    return !!this.getDataValue('verifiedAt') && !this.getDataValue('deletedAt')
  }

  @Column(new DataType.VIRTUAL(DataType.BOOLEAN, ['deletedAt']))
  get isDeleted(): boolean {
    return !!this.getDataValue('deletedAt')
  }

  @Column(new DataType.VIRTUAL(DataType.DATE, ['twilioMessageId']))
  get twilioCodeSentAt(): Date {
    const twilioMessageId = this.getDataValue('twilioMessageId')
    return twilioMessageId && getTimeFromUuid(twilioMessageId)
  }

  @Column(new DataType.VIRTUAL(DataType.BOOLEAN, ['verifiedAt', 'twilioCodeSentAt']))
  get isSent(): boolean {
    return (
      false ||
      !!this.getDataValue('verifiedAt') ||
      this.getDataValue('twilioCodeSentAt') > new Date(Date.now() - 30000)
    )
  }

  static async createOrFindOneByUserId(
    userId: string,
    phone: string,
    countryCode: string,
    regionCode: string,
    shouldValidate?: boolean,
  ): Promise<[PhoneModelType, boolean]> {
    const verifiedAt = shouldValidate ? new Date() : undefined
    const UserPhone = await PhoneModel.findOrCreate({
      defaults: {
        countryCode,
        default: true,
        label: 'Default',
        phone,
        regionCode: regionCode || PHONE_DEFAULT_REGION_CODE,
        userId,
        verifiedAt,
      },
      where: {
        countryCode,
        phone,
        userId,
      },
    })

    return UserPhone
  }

  static async isPhoneAvailable(phone: string, countryCode: string): Promise<boolean> {
    const existing = await PhoneModel.findOne({
      where: {
        countryCode,
        // verifiedAt: {
        //   [Op.ne]: null,
        // },
        deletedAt: null,
        phone,
      },
    })

    if (existing === null) {
      return true
    }

    return !existing
  }

  static async findAllByUserId(userId): Promise<PhoneModelType[]> {
    return await PhoneModel.findAll({
      where: {
        deletedAt: null,
        userId,
      },
    })
  }

  static async findByPhoneAndCode(phone: string, countryCode: string): Promise<PhoneModelType> {
    return await PhoneModel.findOne({
      where: {
        countryCode,
        // verifiedAt: {
        //   [Op.ne]: null,
        // },
        deletedAt: null,
        phone,
      },
    })
  }

  static async clearAllDefaultByUserId(userId: string): Promise<void> {
    const phones = await PhoneModel.findAllByUserId(userId)
    for (const phone of phones) {
      phone.default = false
      await phone.save()
    }
  }
}

export type PhoneModelType = typeof PhoneModel.prototype
