import { fn, Op } from 'sequelize'
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
  UpdatedAt,
} from 'sequelize-typescript'

import {
  DEFAULT_LIMIT,
  DEFAULT_OFFSET,
  DEFAULT_TIMEZONE,
  type GetSupportRequestsListQueryType,
  // SUPPORT_CATEGORY,
  SUPPORT_CATEGORY_ARRAY,
  SUPPORT_OPEN_STATUSES,
  SUPPORT_STATUS,
  SUPPORT_STATUS_ARRAY,
  type SupportRequestWithUserType,
} from '@dx3/models-shared'

import { UserModel } from '../user/user-api.postgres-model'
import { SUPPORT_REQUEST_POSTGRES_DB_NAME } from './support-api.consts'

@Table({
  indexes: [
    {
      fields: ['user_id'],
      name: 'support_request_user_id_index',
      unique: false,
    },
    {
      fields: ['status'],
      name: 'support_request_status_index',
      unique: false,
    },
    {
      fields: ['category'],
      name: 'support_request_category_index',
      unique: false,
    },
    {
      fields: ['viewed_by_admin'],
      name: 'support_request_viewed_index',
      unique: false,
    },
  ],
  modelName: SUPPORT_REQUEST_POSTGRES_DB_NAME,
  timestamps: true,
  underscored: true,
})
export class SupportRequestModel extends Model<SupportRequestModel> {
  @PrimaryKey
  @Default(fn('uuid_generate_v4'))
  @AllowNull(false)
  @Column(DataType.UUID)
  id: string

  @ForeignKey(() => UserModel)
  @AllowNull(false)
  @Column({ field: 'user_id', type: DataType.UUID })
  userId: string

  @BelongsTo(() => UserModel, 'user_id')
  user: UserModel

  @AllowNull(false)
  @Column({
    field: 'category',
    type: DataType.ENUM(...SUPPORT_CATEGORY_ARRAY),
  })
  category: string

  @AllowNull(false)
  @Column({ field: 'subject', type: DataType.STRING })
  subject: string

  @AllowNull(false)
  @Column({ field: 'message', type: DataType.TEXT })
  message: string

  @Default(SUPPORT_STATUS.OPEN)
  @AllowNull(false)
  @Column({
    field: 'status',
    type: DataType.ENUM(...SUPPORT_STATUS_ARRAY),
  })
  status: string

  @ForeignKey(() => UserModel)
  @Column({ field: 'assigned_to', type: DataType.UUID })
  assignedTo: string | null

  @BelongsTo(() => UserModel, 'assigned_to')
  assignedAdmin: UserModel

  @Default(false)
  @AllowNull(false)
  @Column({ field: 'viewed_by_admin', type: DataType.BOOLEAN })
  viewedByAdmin: boolean

  @Column({ field: 'viewed_at', type: DataType.DATE })
  viewedAt: Date | null

  @Column({ field: 'resolved_at', type: DataType.DATE })
  resolvedAt: Date | null

  @Default(DEFAULT_TIMEZONE)
  @AllowNull(false)
  @Column({ field: 'user_timezone', type: DataType.STRING(64) })
  userTimezone: string

  @CreatedAt
  @Default(fn('now'))
  @AllowNull(false)
  @Column({ field: 'created_at', type: DataType.DATE })
  createdAt: Date

  @UpdatedAt
  @Column({ field: 'updated_at', type: DataType.DATE })
  updatedAt: Date

  //////////////// Static Methods //////////////////

  /**
   * Create a new support request
   */
  static async createNew(params: {
    category: string
    message: string
    subject: string
    userId: string
    userTimezone?: string
  }): Promise<SupportRequestModel> {
    return SupportRequestModel.create({
      category: params.category,
      message: params.message,
      status: SUPPORT_STATUS.OPEN,
      subject: params.subject,
      userId: params.userId,
      userTimezone: params.userTimezone || DEFAULT_TIMEZONE,
      viewedByAdmin: false,
    })
  }

  /**
   * Get count of open requests for a user in the last 24 hours
   */
  static async getOpenRequestCountForUser(userId: string): Promise<number> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    return SupportRequestModel.count({
      where: {
        createdAt: { [Op.gte]: oneDayAgo },
        status: { [Op.in]: SUPPORT_OPEN_STATUSES },
        userId,
      },
    })
  }

  /**
   * Get support requests with pagination, sorting, and filtering
   */
  static async getList(
    params: GetSupportRequestsListQueryType,
  ): Promise<{ count: number; rows: SupportRequestWithUserType[] }> {
    const limit = params.limit ?? DEFAULT_LIMIT
    const offset = params.offset ?? DEFAULT_OFFSET
    const orderBy = params.orderBy ?? 'createdAt'
    const sortDir = params.sortDir ?? 'DESC'

    // Build where clause
    const where: Record<string, unknown> = {}

    if (params.status) {
      where.status = params.status
    }

    if (params.category) {
      where.category = params.category
    }

    if (params.userId) {
      where.userId = params.userId
    }

    if (params.openOnly) {
      where.status = { [Op.in]: SUPPORT_OPEN_STATUSES }
    }

    if (params.filterValue) {
      where[Op.or as unknown as string] = [
        { subject: { [Op.iLike]: `%${params.filterValue}%` } },
        { '$user.username$': { [Op.iLike]: `%${params.filterValue}%` } },
        { '$user.first_name$': { [Op.iLike]: `%${params.filterValue}%` } },
        { '$user.last_name$': { [Op.iLike]: `%${params.filterValue}%` } },
      ]
    }

    // Custom ordering: unviewed first, then by date
    const order: Array<
      [string, string] | [{ model: typeof UserModel; as: string }, string, string]
    > = []

    if (orderBy === 'createdAt') {
      // Unviewed first, then by date
      order.push(['viewed_by_admin', 'ASC'])
      order.push(['createdAt', sortDir])
    } else if (orderBy === 'user') {
      order.push([{ as: 'user', model: UserModel }, 'username', sortDir])
    } else {
      order.push([orderBy, sortDir])
    }

    const result = await SupportRequestModel.findAndCountAll({
      include: [
        {
          as: 'user',
          attributes: ['firstName', 'id', 'lastName', 'username'],
          model: UserModel,
          required: true,
        },
      ],
      limit,
      offset: offset * limit,
      order,
      where,
    })

    const rows: SupportRequestWithUserType[] = result.rows.map((row) => ({
      assignedTo: row.assignedTo,
      category: row.category as SupportRequestWithUserType['category'],
      createdAt: row.createdAt,
      id: row.id,
      message: row.message,
      resolvedAt: row.resolvedAt,
      status: row.status as SupportRequestWithUserType['status'],
      subject: row.subject,
      updatedAt: row.updatedAt,
      userDisplayName: row.user?.username || row.user?.fullName || 'Unknown',
      userEmail: null,
      userFullName: row.user?.fullName || null,
      userId: row.userId,
      username: row.user?.username || null,
      userTimezone: row.userTimezone || DEFAULT_TIMEZONE,
      viewedAt: row.viewedAt,
      viewedByAdmin: row.viewedByAdmin,
    }))

    return {
      count: result.count,
      rows,
    }
  }

  /**
   * Get a single support request by ID with user info
   */
  static async getById(id: string): Promise<SupportRequestModel | null> {
    return SupportRequestModel.findOne({
      include: [
        {
          as: 'user',
          attributes: ['firstName', 'id', 'lastName', 'username'],
          model: UserModel,
          required: true,
        },
      ],
      where: { id },
    })
  }

  /**
   * Get support requests for a specific user
   */
  static async getByUserId(userId: string, openOnly?: boolean): Promise<SupportRequestModel[]> {
    const where: Record<string, unknown> = { userId }

    if (openOnly) {
      where.status = { [Op.in]: SUPPORT_OPEN_STATUSES }
    }

    return SupportRequestModel.findAll({
      order: [['createdAt', 'DESC']],
      where,
    })
  }

  /**
   * Get count of unviewed requests (for admin badge)
   */
  static async getUnviewedCount(): Promise<number> {
    return SupportRequestModel.count({
      where: { viewedByAdmin: false },
    })
  }

  /**
   * Mark a request as viewed
   */
  static async markAsViewed(id: string): Promise<[number]> {
    return SupportRequestModel.update(
      {
        viewedAt: new Date(),
        viewedByAdmin: true,
      },
      { where: { id } },
    )
  }

  /**
   * Mark all requests as viewed
   */
  static async markAllAsViewed(): Promise<[number]> {
    return SupportRequestModel.update(
      {
        viewedAt: new Date(),
        viewedByAdmin: true,
      },
      { where: { viewedByAdmin: false } },
    )
  }

  /**
   * Update request status
   */
  static async updateStatus(id: string, status: string, assignedTo?: string): Promise<[number]> {
    const updateData: Record<string, unknown> = { status }

    if (assignedTo !== undefined) {
      updateData.assignedTo = assignedTo
    }

    if (status === SUPPORT_STATUS.RESOLVED) {
      updateData.resolvedAt = new Date()
    }

    return SupportRequestModel.update(updateData, { where: { id } })
  }
}

export type SupportRequestModelType = typeof SupportRequestModel.prototype
