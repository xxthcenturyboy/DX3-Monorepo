import type { NextFunction, Request, Response } from 'express'

import { ERROR_CODES, type FeatureFlagNameType } from '@dx3/models-shared'

import { sendForbiddenWithCode } from '../http-response/http-responses'
import { ApiLoggingClass } from '../logger'
import { FeatureFlagService } from './feature-flag-api.service'

export function requireFeatureFlag(flagName: FeatureFlagNameType) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user || null
      const service = new FeatureFlagService()
      const isEnabled = await service.evaluateFlag(flagName, user)

      if (!isEnabled) {
        sendForbiddenWithCode(
          req,
          res,
          ERROR_CODES.FEATURE_FLAG_DISABLED,
          `Feature "${flagName}" is not available.`,
        )
        return
      }

      next()
    } catch (error) {
      ApiLoggingClass.instance.logError(`Feature flag middleware error: ${flagName}`, error as Error)
      sendForbiddenWithCode(
        req,
        res,
        ERROR_CODES.FEATURE_FLAG_EVALUATION_ERROR,
        'Feature unavailable.',
      )
    }
  }
}
