import { fn, type NonAttribute, Op } from 'sequelize'
import {
  AllowNull,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  Default,
  DeletedAt,
  ForeignKey,
  IsEmail,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript'

import { UserModel, type UserModelType } from '../user/user-api.postgres-model'
import { EMAIL_POSTGRES_DB_NAME } from './email-api.consts'

@Table({
  indexes: [
    {
      fields: ['user_id'],
      name: 'email_user_id_index',
      unique: false,
    },
    {
      fields: ['email'],
      name: 'email_index',
      unique: false,
    },
  ],
  modelName: EMAIL_POSTGRES_DB_NAME,
  timestamps: true,
  underscored: true,
})
export class EmailModel extends Model<EmailModel> {
  @PrimaryKey
  @Default(fn('uuid_generate_v4'))
  @AllowNull(false)
  @Column(DataType.UUID)
  id: string

  @ForeignKey(() => UserModel)
  @AllowNull(false)
  @Column({ field: 'user_id', type: DataType.UUID })
  userId: string

  // This prevents the custom generator from running to create new library modules
  // ?? resolve by renaming moudle/
  @BelongsTo(() => UserModel, 'userId')
  declare user?: NonAttribute<UserModelType>

  @IsEmail
  @AllowNull(false)
  @Column(DataType.STRING)
  email: string

  @Unique
  @Column(DataType.STRING)
  token: string | null

  @Column(DataType.STRING)
  label: string

  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  default: boolean

  @Column({ field: 'last_sg_message_id', type: DataType.STRING })
  lastSgMessageId: string

  @Column({ field: 'last_verification_sent_at', type: DataType.DATE })
  lastVerificationSentAt: Date

  @DeletedAt
  @Column({ field: 'deleted_at', type: DataType.DATE })
  deletedAt: Date | null

  @Column({ field: 'verified_at', type: DataType.DATE })
  verifiedAt: Date | null

  @CreatedAt
  @Default(fn('now'))
  @AllowNull(false)
  @Column({ field: 'created_at', type: DataType.DATE })
  createdAt: Date

  @Default(fn('now'))
  @AllowNull(false)
  @Column({ field: 'updated_at', type: DataType.DATE })
  updatedAt: Date

  @Column(new DataType.VIRTUAL(DataType.BOOLEAN, ['verifiedAt', 'deletedAt']))
  get isVerified(): boolean {
    return !!this.getDataValue('verifiedAt') && !this.getDataValue('deletedAt')
  }

  @Column(new DataType.VIRTUAL(DataType.BOOLEAN, ['deletedAt']))
  get isDeleted(): boolean {
    return !!this.getDataValue('deletedAt')
  }

  static async createOrFindOneByUserId(
    userId: string,
    email: string,
    token: string | null,
    validate?: boolean,
  ): Promise<[EmailModel, boolean]> {
    const UserEmail = await EmailModel.findOrCreate({
      defaults: {
        default: true,
        email,
        label: 'Personal', // hard-coded for U.S.
        token,
        userId,
        verifiedAt: validate ? new Date() : null,
      },
      where: {
        email,
        userId,
      },
    })

    return UserEmail
  }

  static async isEmailAvailable(email: string): Promise<boolean> {
    const existing = await EmailModel.findOne({
      where: {
        deletedAt: null,
        email,
        verifiedAt: {
          [Op.ne]: null,
        },
      },
    })

    if (existing === null) {
      return true
    }

    return !existing
  }

  static async findByEmail(email: string): Promise<EmailModelType | null> {
    return await EmailModel.findOne({
      where: {
        deletedAt: null,
        email,
      },
    })
  }

  static async findAllByUserId(userId: string): Promise<EmailModel[]> {
    return await EmailModel.findAll({
      where: {
        deletedAt: null,
        userId,
      },
    })
  }

  static async clearAllDefaultByUserId(userId: string): Promise<void> {
    const emails = await EmailModel.findAllByUserId(userId)
    for (const email of emails) {
      email.default = false
      await email.save()
    }
  }
  // Used in Test
  static async validateEmail(email: string): Promise<void> {
    EmailModel.update(
      {
        verifiedAt: new Date(),
      },
      {
        where: {
          deletedAt: null,
          email,
        },
      },
    )
  }
  // TODO: Remove
  static async verifyEmail(id: string): Promise<void> {
    EmailModel.update(
      {
        verifiedAt: new Date(),
      },
      {
        where: {
          deletedAt: null,
          id,
        },
      },
    )
  }

  static async updateMessageInfoValidate(email: string, messageId: string): Promise<void> {
    EmailModel.update(
      {
        lastSgMessageId: messageId,
        lastVerificationSentAt: new Date(),
        verifiedAt: null,
      },
      {
        where: {
          deletedAt: null,
          email,
        },
      },
    )
  }

  static async updateMessageInfo(email: string, messageId: string): Promise<void> {
    EmailModel.update(
      {
        lastSgMessageId: messageId,
      },
      {
        where: {
          deletedAt: null,
          email,
        },
      },
    )
  }

  static async validateEmailWithToken(token: string): Promise<EmailModel> {
    const email = await EmailModel.findOne({
      where: {
        deletedAt: null,
        token,
      },
    })

    if (!email) {
      throw new Error('Token is invalid')
    }

    email.verifiedAt = new Date()
    email.token = null
    await email.save()

    return email
  }
}

export type EmailModelType = typeof EmailModel.prototype
