import { fn } from 'sequelize'
import {
  AllowNull,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript'

import { UserModel } from '../user/user-api.postgres-model'
import { SUPPORT_MESSAGE_POSTGRES_DB_NAME } from './support-api.consts'
import { SupportRequestModel } from './support-api.postgres-model'

/**
 * SupportMessage Model
 *
 * Scaffolded for future threading/response functionality.
 * Supports both internal admin notes and user-visible responses.
 */
@Table({
  indexes: [
    {
      fields: ['support_request_id'],
      name: 'support_message_request_id_index',
      unique: false,
    },
  ],
  modelName: SUPPORT_MESSAGE_POSTGRES_DB_NAME,
  timestamps: true,
  underscored: true,
})
export class SupportMessageModel extends Model<SupportMessageModel> {
  @PrimaryKey
  @Default(fn('uuid_generate_v4'))
  @AllowNull(false)
  @Column(DataType.UUID)
  id: string

  @ForeignKey(() => SupportRequestModel)
  @AllowNull(false)
  @Column({ field: 'support_request_id', type: DataType.UUID })
  supportRequestId: string

  @BelongsTo(() => SupportRequestModel, 'support_request_id')
  supportRequest: SupportRequestModel

  @ForeignKey(() => UserModel)
  @AllowNull(false)
  @Column({ field: 'user_id', type: DataType.UUID })
  userId: string

  @BelongsTo(() => UserModel, 'user_id')
  user: UserModel

  @AllowNull(false)
  @Column({ field: 'message', type: DataType.TEXT })
  message: string

  @Default(false)
  @AllowNull(false)
  @Column({ field: 'is_admin_response', type: DataType.BOOLEAN })
  isAdminResponse: boolean

  @Default(false)
  @AllowNull(false)
  @Column({ field: 'is_internal_note', type: DataType.BOOLEAN })
  isInternalNote: boolean

  @CreatedAt
  @Default(fn('now'))
  @AllowNull(false)
  @Column({ field: 'created_at', type: DataType.DATE })
  createdAt: Date

  //////////////// Static Methods //////////////////

  /**
   * Create a new support message
   * @future - To be implemented when threading is added
   */
  static async createNew(params: {
    isAdminResponse: boolean
    isInternalNote: boolean
    message: string
    supportRequestId: string
    userId: string
  }): Promise<SupportMessageModel> {
    return SupportMessageModel.create({
      isAdminResponse: params.isAdminResponse,
      isInternalNote: params.isInternalNote,
      message: params.message,
      supportRequestId: params.supportRequestId,
      userId: params.userId,
    })
  }

  /**
   * Get messages for a support request
   * @future - To be implemented when threading is added
   */
  static async getByRequestId(
    supportRequestId: string,
    includeInternalNotes: boolean,
  ): Promise<SupportMessageModel[]> {
    const where: Record<string, unknown> = { supportRequestId }

    if (!includeInternalNotes) {
      where.isInternalNote = false
    }

    return SupportMessageModel.findAll({
      include: [
        {
          as: 'user',
          attributes: ['firstName', 'id', 'lastName', 'username'],
          model: UserModel,
          required: true,
        },
      ],
      order: [['createdAt', 'ASC']],
      where,
    })
  }
}

export type SupportMessageModelType = typeof SupportMessageModel.prototype
