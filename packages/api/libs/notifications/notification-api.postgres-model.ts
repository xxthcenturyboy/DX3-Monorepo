import { fn } from 'sequelize'
import {
  AllowNull,
  Column,
  CreatedAt,
  DataType,
  Default,
  // Unique,
  // BelongsTo,
  DeletedAt,
  Model,
  // ForeignKey,
  PrimaryKey,
  Table,
  // Index,
} from 'sequelize-typescript'
import { NIL as NIL_UUID } from 'uuid'

import { NOTIFICATION_LEVELS, type NotificationCreationParamTypes } from '@dx3/models-shared'

// import {
//   UserModel,
//   UserModelType
// } from '../user/user-api.postgres-model';
import { NOTIFICATION_POSTGRES_DB_NAME } from './notification-api.consts'

@Table({
  indexes: [
    {
      fields: ['user_id'],
      name: 'notification_user_id_index',
      unique: false,
    },
  ],
  modelName: NOTIFICATION_POSTGRES_DB_NAME,
  timestamps: true,
  underscored: true,
})
export class NotificationModel extends Model<NotificationModel> {
  @PrimaryKey
  @Default(fn('uuid_generate_v4'))
  @AllowNull(false)
  @Column(DataType.UUID)
  id: string

  // @ForeignKey(() => UserModel)
  @AllowNull(false)
  @Column({ field: 'user_id', type: DataType.UUID })
  userId: string

  // @BelongsTo(() => UserModel, 'userId')
  // declare user?: NonAttribute<UserModelType>;

  @CreatedAt
  @Default(fn('now'))
  @AllowNull(false)
  @Column({ field: 'created_at', type: DataType.DATE })
  createdAt: Date

  @DeletedAt
  @Column({ field: 'deleted_at', type: DataType.DATE })
  deletedAt: Date | null

  @Column(DataType.STRING)
  route: string

  @Column(DataType.STRING)
  title: string

  @AllowNull(false)
  @Column(DataType.STRING)
  message: string

  @Default(NOTIFICATION_LEVELS.INFO)
  @AllowNull(false)
  @Column({
    field: 'level',
    type: DataType.ENUM(
      NOTIFICATION_LEVELS.DANGER,
      NOTIFICATION_LEVELS.INFO,
      NOTIFICATION_LEVELS.PRIMARY,
      NOTIFICATION_LEVELS.SUCCESS,
      NOTIFICATION_LEVELS.WARNING,
    ),
  })
  level: string

  @Default(false)
  @Column(DataType.BOOLEAN)
  viewed: boolean

  @Column({ field: 'viewed_date', type: DataType.DATE })
  viewedDate: Date

  @Default(false)
  @Column(DataType.BOOLEAN)
  read: boolean

  @Column({ field: 'last_read_date', type: DataType.DATE })
  lastReadDate: Date

  @Column({ field: 'dismissed_at', type: DataType.DATE })
  dismissedAt: Date

  //////////////// Methods //////////////////

  static async createNew(params: NotificationCreationParamTypes): Promise<NotificationModel> {
    return NotificationModel.create({
      level: params.level,
      message: params.message,
      route: params.route,
      title: params.title,
      userId: params.userId,
    })
  }

  static async getByUserId(userId: string): Promise<NotificationModel[]> {
    return NotificationModel.findAll({
      limit: 1000,
      order: [['createdAt', 'DESC']],
      where: {
        dismissedAt: null,
        userId,
      },
    })
  }

  static async getSystemNotifications(): Promise<NotificationModel[]> {
    return NotificationModel.findAll({
      limit: 1000,
      order: [['createdAt', 'DESC']],
      where: {
        dismissedAt: null,
        userId: NIL_UUID,
      },
    })
  }

  static async markAllAsRead(userId: string): Promise<[number]> {
    return NotificationModel.update(
      {
        lastReadDate: new Date(),
        read: true,
      },
      {
        where: {
          read: false,
          userId,
        },
      },
    )
  }

  static async markAllDismissed(userId: string): Promise<[number]> {
    return NotificationModel.update(
      {
        dismissedAt: new Date(),
        lastReadDate: new Date(),
        read: true,
        viewed: true,
        viewedDate: new Date(),
      },
      {
        where: {
          dismissedAt: null,
          userId,
        },
      },
    )
  }

  static async markAsRead(id: string): Promise<[number]> {
    return NotificationModel.update(
      {
        lastReadDate: new Date(),
        read: true,
      },
      {
        where: {
          id,
        },
      },
    )
  }

  static async markAsViewed(userId: string): Promise<[number]> {
    return NotificationModel.update(
      {
        viewed: true,
        viewedDate: new Date(),
      },
      {
        where: {
          userId,
          viewed: false,
        },
      },
    )
  }

  static async markAsDismissed(id: string): Promise<[number]> {
    return NotificationModel.update(
      {
        dismissedAt: new Date(),
        lastReadDate: new Date(),
        read: true,
        viewed: true,
        viewedDate: new Date(),
      },
      {
        where: {
          id,
        },
      },
    )
  }
}

export type NotificationModelType = typeof NotificationModel.prototype
