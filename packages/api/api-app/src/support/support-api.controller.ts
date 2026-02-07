import type { Request, Response } from 'express'

import { TokenService } from '@dx3/api-libs/auth/tokens/token.service'
import { HeaderService } from '@dx3/api-libs/headers/header.service'
import { sendBadRequest, sendOK } from '@dx3/api-libs/http-response/http-responses'
import { logRequest } from '@dx3/api-libs/logger/log-request.util'
import { MetricsService } from '@dx3/api-libs/metrics/metrics-api.service'
import { SupportService } from '@dx3/api-libs/support/support-api.service'
import { SupportSocketApiService } from '@dx3/api-libs/support/support-api.socket'
import { UserModel } from '@dx3/api-libs/user/user-api.postgres-model'
import { createApiErrorMessage } from '@dx3/api-libs/utils'
import {
  type CreateSupportRequestPayloadType,
  DEFAULT_TIMEZONE,
  ERROR_CODES,
  type GetSupportRequestsListQueryType,
  type UpdateSupportRequestStatusPayloadType,
} from '@dx3/models-shared'

export const SupportController = {
  /**
   * Bulk update status for multiple requests (admin only)
   */
  bulkUpdateStatus: async (req: Request, res: Response) => {
    logRequest({ req, type: 'bulkUpdateStatus' })
    try {
      const { ids, status } = req.body as { ids: string[]; status: string }
      const service = new SupportService()
      const result = await service.bulkUpdateStatus(ids, status)
      return sendOK(req, res, result)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed bulkUpdateStatus' })
      sendBadRequest(req, res, (err as Error).message)
    }
  },

  /**
   * Create a new support request (authenticated users with secured accounts only)
   */
  createRequest: async (req: Request, res: Response) => {
    logRequest({ req, type: 'createSupportRequest' })
    try {
      const authToken = HeaderService.getTokenFromRequest(req)
      const userId = TokenService.getUserIdFromToken(authToken)

      // Verify user has a secured account
      const user = await UserModel.findByPk(userId)
      if (!user) {
        throw new Error(createApiErrorMessage(ERROR_CODES.USER_NOT_FOUND, 'User not found'))
      }

      const hasSecured = await user.hasSecuredAccount()
      if (!hasSecured) {
        throw new Error(
          createApiErrorMessage(
            ERROR_CODES.USER_ACCOUNT_NOT_SECURED,
            'You must secure your account before submitting support requests',
          ),
        )
      }

      const payload = req.body as CreateSupportRequestPayloadType
      // Get timezone from user's stored preference, GeoIP lookup, or default
      const userTimezone = user.timezone || req.geo?.location?.time_zone || DEFAULT_TIMEZONE
      const service = new SupportService()
      const result = await service.createRequest(userId, payload, userTimezone)

      // Send socket notification to admins
      if (SupportSocketApiService.instance) {
        SupportSocketApiService.instance.sendNewRequestNotification(result)
      }

      // Record support request feature usage
      void MetricsService.instance?.recordFeatureUsage({
        context: { category: payload.category },
        featureName: 'support_request_created',
        req,
      })

      return sendOK(req, res, result)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed createSupportRequest' })
      sendBadRequest(req, res, (err as Error).message)
    }
  },

  /**
   * Get a single support request by ID (admin only)
   */
  getById: async (req: Request, res: Response) => {
    logRequest({ req, type: 'getSupportRequestById' })
    try {
      const { id } = req.params as { id: string }
      const service = new SupportService()
      const result = await service.getById(id)
      return sendOK(req, res, result)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed getSupportRequestById' })
      sendBadRequest(req, res, (err as Error).message)
    }
  },

  /**
   * Get support requests for a specific user (admin only)
   */
  getByUserId: async (req: Request, res: Response) => {
    logRequest({ req, type: 'getSupportRequestsByUserId' })
    try {
      const { userId } = req.params as { userId: string }
      const { openOnly } = req.query as { openOnly?: string }
      const service = new SupportService()
      const result = await service.getByUserId(userId, openOnly === 'true')
      return sendOK(req, res, result)
    } catch (err) {
      logRequest({
        message: (err as Error)?.message,
        req,
        type: 'Failed getSupportRequestsByUserId',
      })
      sendBadRequest(req, res, (err as Error).message)
    }
  },

  /**
   * Get paginated list of support requests (admin only)
   */
  getList: async (req: Request, res: Response) => {
    logRequest({ req, type: 'getSupportRequestsList' })
    try {
      const params = req.query as unknown as GetSupportRequestsListQueryType
      const service = new SupportService()
      const result = await service.getList(params)
      return sendOK(req, res, result)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed getSupportRequestsList' })
      sendBadRequest(req, res, (err as Error).message)
    }
  },

  /**
   * Get count of unviewed requests (admin only, for badge)
   */
  getUnviewedCount: async (req: Request, res: Response) => {
    logRequest({ req, type: 'getUnviewedCount' })
    try {
      const service = new SupportService()
      const result = await service.getUnviewedCount()
      return sendOK(req, res, result)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed getUnviewedCount' })
      sendBadRequest(req, res, (err as Error).message)
    }
  },

  /**
   * Mark all requests as viewed (admin only)
   */
  markAllAsViewed: async (req: Request, res: Response) => {
    logRequest({ req, type: 'markAllAsViewed' })
    try {
      const service = new SupportService()
      const result = await service.markAllAsViewed()
      return sendOK(req, res, result)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed markAllAsViewed' })
      sendBadRequest(req, res, (err as Error).message)
    }
  },

  /**
   * Mark a request as viewed (admin only)
   */
  markAsViewed: async (req: Request, res: Response) => {
    logRequest({ req, type: 'markAsViewed' })
    try {
      const { id } = req.params as { id: string }
      const service = new SupportService()
      const result = await service.markAsViewed(id)
      return sendOK(req, res, result)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed markAsViewed' })
      sendBadRequest(req, res, (err as Error).message)
    }
  },

  /**
   * Update support request status (admin only)
   */
  updateStatus: async (req: Request, res: Response) => {
    logRequest({ req, type: 'updateSupportRequestStatus' })
    try {
      const { id } = req.params as { id: string }
      const payload = req.body as UpdateSupportRequestStatusPayloadType
      const service = new SupportService()
      const result = await service.updateStatus(id, payload)

      // Send socket notification to admins
      if (SupportSocketApiService.instance) {
        SupportSocketApiService.instance.sendRequestUpdatedNotification(result)
      }

      return sendOK(req, res, result)
    } catch (err) {
      logRequest({
        message: (err as Error)?.message,
        req,
        type: 'Failed updateSupportRequestStatus',
      })
      sendBadRequest(req, res, (err as Error).message)
    }
  },
}

export type SupportControllerType = typeof SupportController
