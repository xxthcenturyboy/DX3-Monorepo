import {
  type CreateSupportRequestPayloadType,
  ERROR_CODES,
  type GetSupportRequestsListQueryType,
  type GetSupportRequestsListResponseType,
  SUPPORT_STATUS,
  SUPPORT_VALIDATION,
  type SupportRequestType,
  type SupportRequestWithUserType,
  type SupportUnviewedCountResponseType,
  type UpdateSupportRequestStatusPayloadType,
} from '@dx3/models-shared'

import { ApiLoggingClass, type ApiLoggingClassType } from '../logger'
import { createApiErrorMessage } from '../utils'
import { SupportRequestModel } from './support-api.postgres-model'

export class SupportService {
  logger: ApiLoggingClassType

  constructor() {
    this.logger = ApiLoggingClass.instance
  }

  /**
   * Create a new support request
   * Validates that user has not exceeded open request limit
   */
  public async createRequest(
    userId: string,
    payload: CreateSupportRequestPayloadType,
  ): Promise<SupportRequestType> {
    try {
      // Validate payload
      this.validateCreatePayload(payload)

      // Check if user has too many open requests
      const openCount = await SupportRequestModel.getOpenRequestCountForUser(userId)
      if (openCount >= SUPPORT_VALIDATION.MAX_OPEN_REQUESTS_PER_DAY) {
        throw new Error(
          createApiErrorMessage(
            ERROR_CODES.GENERIC_VALIDATION_FAILED,
            `You have reached the maximum of ${SUPPORT_VALIDATION.MAX_OPEN_REQUESTS_PER_DAY} open requests per day`,
          ),
        )
      }

      const request = await SupportRequestModel.createNew({
        category: payload.category,
        message: payload.message,
        subject: payload.subject,
        userId,
      })

      return this.mapModelToType(request)
    } catch (err) {
      const msg = (err as Error).message
      this.logger.logError(`SupportService.createRequest: ${msg}`)
      throw err
    }
  }

  /**
   * Get paginated list of support requests (admin only)
   */
  public async getList(
    params: GetSupportRequestsListQueryType,
  ): Promise<GetSupportRequestsListResponseType> {
    try {
      return await SupportRequestModel.getList(params)
    } catch (err) {
      const msg = (err as Error).message
      this.logger.logError(`SupportService.getList: ${msg}`)
      throw new Error(createApiErrorMessage(ERROR_CODES.GENERIC_SERVER_ERROR, msg))
    }
  }

  /**
   * Get a single support request by ID with user info (admin only)
   */
  public async getById(id: string): Promise<SupportRequestWithUserType> {
    try {
      const request = await SupportRequestModel.getById(id)

      if (!request) {
        throw new Error(
          createApiErrorMessage(ERROR_CODES.GENERIC_NOT_FOUND, 'Support request not found'),
        )
      }

      return this.mapModelToTypeWithUser(request)
    } catch (err) {
      const msg = (err as Error).message
      this.logger.logError(`SupportService.getById: ${msg}`)
      throw err
    }
  }

  /**
   * Get support requests for a specific user (admin only)
   */
  public async getByUserId(userId: string, openOnly?: boolean): Promise<SupportRequestType[]> {
    try {
      const requests = await SupportRequestModel.getByUserId(userId, openOnly)
      return requests.map((r) => this.mapModelToType(r))
    } catch (err) {
      const msg = (err as Error).message
      this.logger.logError(`SupportService.getByUserId: ${msg}`)
      throw new Error(createApiErrorMessage(ERROR_CODES.GENERIC_SERVER_ERROR, msg))
    }
  }

  /**
   * Get count of unviewed requests (for admin badge)
   */
  public async getUnviewedCount(): Promise<SupportUnviewedCountResponseType> {
    try {
      const count = await SupportRequestModel.getUnviewedCount()
      return { count }
    } catch (err) {
      const msg = (err as Error).message
      this.logger.logError(`SupportService.getUnviewedCount: ${msg}`)
      throw new Error(createApiErrorMessage(ERROR_CODES.GENERIC_SERVER_ERROR, msg))
    }
  }

  /**
   * Update support request status (admin only)
   * Validates that assignment is provided when setting to in_progress
   */
  public async updateStatus(
    id: string,
    payload: UpdateSupportRequestStatusPayloadType,
  ): Promise<SupportRequestType> {
    try {
      // Validate: assignment required for in_progress
      if (payload.status === SUPPORT_STATUS.IN_PROGRESS && !payload.assignedTo) {
        throw new Error(
          createApiErrorMessage(
            ERROR_CODES.GENERIC_VALIDATION_FAILED,
            'Assignment is required before changing status to in_progress',
          ),
        )
      }

      const [updated] = await SupportRequestModel.updateStatus(
        id,
        payload.status,
        payload.assignedTo,
      )

      if (updated === 0) {
        throw new Error(
          createApiErrorMessage(ERROR_CODES.GENERIC_NOT_FOUND, 'Support request not found'),
        )
      }

      const request = await SupportRequestModel.getById(id)
      return this.mapModelToType(request!)
    } catch (err) {
      const msg = (err as Error).message
      this.logger.logError(`SupportService.updateStatus: ${msg}`)
      throw err
    }
  }

  /**
   * Mark a support request as viewed (admin only)
   */
  public async markAsViewed(id: string): Promise<{ success: boolean }> {
    try {
      await SupportRequestModel.markAsViewed(id)
      return { success: true }
    } catch (err) {
      const msg = (err as Error).message
      this.logger.logError(`SupportService.markAsViewed: ${msg}`)
      throw new Error(createApiErrorMessage(ERROR_CODES.GENERIC_SERVER_ERROR, msg))
    }
  }

  /**
   * Mark all support requests as viewed (admin only)
   */
  public async markAllAsViewed(): Promise<{ success: boolean }> {
    try {
      await SupportRequestModel.markAllAsViewed()
      return { success: true }
    } catch (err) {
      const msg = (err as Error).message
      this.logger.logError(`SupportService.markAllAsViewed: ${msg}`)
      throw new Error(createApiErrorMessage(ERROR_CODES.GENERIC_SERVER_ERROR, msg))
    }
  }

  /**
   * Bulk update status for multiple requests (admin only)
   */
  public async bulkUpdateStatus(
    ids: string[],
    status: string,
  ): Promise<{ success: boolean; updated: number }> {
    try {
      let updated = 0
      for (const id of ids) {
        const [count] = await SupportRequestModel.updateStatus(id, status)
        updated += count
      }
      return { success: true, updated }
    } catch (err) {
      const msg = (err as Error).message
      this.logger.logError(`SupportService.bulkUpdateStatus: ${msg}`)
      throw new Error(createApiErrorMessage(ERROR_CODES.GENERIC_SERVER_ERROR, msg))
    }
  }

  /**
   * Validate create payload
   */
  private validateCreatePayload(payload: CreateSupportRequestPayloadType): void {
    if (!payload.subject || payload.subject.trim().length === 0) {
      throw new Error(
        createApiErrorMessage(ERROR_CODES.GENERIC_VALIDATION_FAILED, 'Subject is required'),
      )
    }

    if (payload.subject.length > SUPPORT_VALIDATION.SUBJECT_MAX_LENGTH) {
      throw new Error(
        createApiErrorMessage(
          ERROR_CODES.GENERIC_VALIDATION_FAILED,
          `Subject must be ${SUPPORT_VALIDATION.SUBJECT_MAX_LENGTH} characters or less`,
        ),
      )
    }

    if (!payload.message || payload.message.trim().length === 0) {
      throw new Error(
        createApiErrorMessage(ERROR_CODES.GENERIC_VALIDATION_FAILED, 'Message is required'),
      )
    }

    if (payload.message.length > SUPPORT_VALIDATION.MESSAGE_MAX_LENGTH) {
      throw new Error(
        createApiErrorMessage(
          ERROR_CODES.GENERIC_VALIDATION_FAILED,
          `Message must be ${SUPPORT_VALIDATION.MESSAGE_MAX_LENGTH} characters or less`,
        ),
      )
    }

    if (!payload.category) {
      throw new Error(
        createApiErrorMessage(ERROR_CODES.GENERIC_VALIDATION_FAILED, 'Category is required'),
      )
    }
  }

  /**
   * Map Sequelize model to type
   */
  private mapModelToType(model: SupportRequestModel): SupportRequestType {
    return {
      assignedTo: model.assignedTo,
      category: model.category as SupportRequestType['category'],
      createdAt: model.createdAt,
      id: model.id,
      message: model.message,
      resolvedAt: model.resolvedAt,
      status: model.status as SupportRequestType['status'],
      subject: model.subject,
      updatedAt: model.updatedAt,
      userId: model.userId,
      viewedAt: model.viewedAt,
      viewedByAdmin: model.viewedByAdmin,
    }
  }

  /**
   * Map Sequelize model to type with user display info
   */
  private mapModelToTypeWithUser(model: SupportRequestModel): SupportRequestWithUserType {
    const user = model.user as
      | { firstName?: string; lastName?: string; username?: string }
      | undefined
    const fullName =
      user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : user?.firstName || user?.lastName || null

    return {
      assignedTo: model.assignedTo,
      category: model.category as SupportRequestType['category'],
      createdAt: model.createdAt,
      id: model.id,
      message: model.message,
      resolvedAt: model.resolvedAt,
      status: model.status as SupportRequestType['status'],
      subject: model.subject,
      updatedAt: model.updatedAt,
      userDisplayName: user?.username || fullName || 'Unknown',
      userEmail: null,
      userFullName: fullName,
      userId: model.userId,
      username: user?.username || null,
      viewedAt: model.viewedAt,
      viewedByAdmin: model.viewedByAdmin,
    }
  }
}

export type SupportServiceType = typeof SupportService.prototype
