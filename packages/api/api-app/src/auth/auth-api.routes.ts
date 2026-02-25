import { Router } from 'express'

import {
  accountCreationBodySchema,
  checkPasswordStrengthBodySchema,
  loginBodySchema,
  rejectDeviceParamsSchema,
  sendOtpByIdBodySchema,
  sendOtpToEmailBodySchema,
  sendOtpToPhoneBodySchema,
  userLookupQuerySchema,
  validateEmailParamsSchema,
} from '@dx3/api-libs/auth/auth-api.validation'
import { validateRequest } from '@dx3/api-libs/validation/validate-request.middleware'

import { DxRateLimiters } from '../rate-limiters/rate-limiters.dx'
import { AuthController } from './auth-api.controller'

export class AuthRoutes {
  static configure() {
    const router = Router()

    router.get(
      '/lookup',
      DxRateLimiters.authLookup(),
      validateRequest({ query: userLookupQuerySchema }),
      AuthController.authLookup,
    )

    router.get('/refresh-token', DxRateLimiters.veryStrict(), AuthController.refreshTokens)

    router.get(
      '/validate/email/:token',
      DxRateLimiters.strict(),
      validateRequest({ params: validateEmailParamsSchema }),
      AuthController.validateEmail,
    )

    router.post(
      '/account',
      DxRateLimiters.accountCreation(),
      validateRequest({ body: accountCreationBodySchema }),
      AuthController.createAccount,
    )

    router.post(
      '/password-strength',
      DxRateLimiters.accountCreation(),
      validateRequest({ body: checkPasswordStrengthBodySchema }),
      AuthController.checkPasswordStrength,
    )

    router.post(
      '/login',
      DxRateLimiters.login(),
      validateRequest({ body: loginBodySchema }),
      AuthController.login,
    )

    router.post('/logout', AuthController.logout)

    router.post(
      '/otp-code/send/email',
      DxRateLimiters.veryStrict(),
      validateRequest({ body: sendOtpToEmailBodySchema }),
      AuthController.sendOtpToEmail,
    )

    router.post(
      '/otp-code/send/phone',
      DxRateLimiters.veryStrict(),
      validateRequest({ body: sendOtpToPhoneBodySchema }),
      AuthController.sendOtpToPhone,
    )

    router.post(
      '/otp-code/send/id',
      DxRateLimiters.veryStrict(),
      validateRequest({ body: sendOtpByIdBodySchema }),
      AuthController.sendOtpById,
    )

    router.delete(
      '/reject/device/:id',
      DxRateLimiters.strict(),
      validateRequest({ params: rejectDeviceParamsSchema }),
      AuthController.rejectDevice,
    )

    return router
  }
}

export type AuthRoutesType = typeof AuthRoutes.prototype
