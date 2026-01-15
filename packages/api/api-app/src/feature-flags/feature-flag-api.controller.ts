import type { Request, Response } from 'express'

import { FeatureFlagService } from '@dx3/api-libs/feature-flags/feature-flag-api.service'
import { FeatureFlagSocketApiService } from '@dx3/api-libs/feature-flags/feature-flag-api.socket'
import type {
  CreateFeatureFlagPayloadType,
  UpdateFeatureFlagPayloadType,
} from '@dx3/api-libs/feature-flags/feature-flag-api.types'
import { sendBadRequest, sendOK } from '@dx3/api-libs/http-response/http-responses'
import { logRequest } from '@dx3/api-libs/logger/log-request.util'
import type {
  FeatureFlagNameType,
  FeatureFlagStatusType,
  FeatureFlagTargetType,
  GetFeatureFlagsListQueryType,
} from '@dx3/models-shared'

export const FeatureFlagController = {
  createFlag: async (req: Request, res: Response) => {
    logRequest({ req, type: 'createFeatureFlag' })
    try {
      const service = new FeatureFlagService()
      const { description, name, percentage, status, target } =
        req.body as CreateFeatureFlagPayloadType

      const result = await service.createFlag(
        name as FeatureFlagNameType,
        description,
        status as FeatureFlagStatusType,
        target as FeatureFlagTargetType,
        percentage,
      )

      // Broadcast flag update to all subscribed clients
      if (FeatureFlagSocketApiService.instance) {
        FeatureFlagSocketApiService.instance.broadcastFlagsUpdated()
      }

      return sendOK(req, res, result)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed createFeatureFlag' })
      sendBadRequest(req, res, err.message)
    }
  },

  getAdminFlags: async (req: Request, res: Response) => {
    logRequest({ req, type: 'getAdminFeatureFlags' })
    try {
      const service = new FeatureFlagService()
      const result = await service.getAllFlags(req.query as GetFeatureFlagsListQueryType)
      return sendOK(req, res, result)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed getAdminFeatureFlags' })
      sendBadRequest(req, res, err.message)
    }
  },

  getAllFlags: async (req: Request, res: Response) => {
    logRequest({ req, type: 'getFeatureFlags' })
    try {
      const user = req.user || null
      const service = new FeatureFlagService()
      const result = await service.evaluateAllFlags(user)
      return sendOK(req, res, result)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed getFeatureFlags' })
      sendBadRequest(req, res, err.message)
    }
  },

  updateFlag: async (req: Request, res: Response) => {
    logRequest({ req, type: 'updateFeatureFlag' })
    try {
      const service = new FeatureFlagService()
      const { description, id, percentage, status, target } =
        req.body as UpdateFeatureFlagPayloadType

      const result = await service.updateFlag(id, {
        description,
        percentage,
        status,
        target,
      })

      // Broadcast flag update to all subscribed clients
      if (FeatureFlagSocketApiService.instance) {
        FeatureFlagSocketApiService.instance.broadcastFlagsUpdated()
      }

      return sendOK(req, res, result)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed updateFeatureFlag' })
      sendBadRequest(req, res, err.message)
    }
  },
}

export type FeatureFlagControllerType = typeof FeatureFlagController
