import type { NextFunction, Request, Response } from 'express'
import type { ZodSchema, z } from 'zod'

import { ERROR_CODES } from '@dx3/models-shared'

import { sendBadRequestWithCode } from '../http-response/http-responses'

export type ValidateRequestOptionsType = {
  body?: ZodSchema
  params?: ZodSchema
  query?: ZodSchema
}

function formatZodError(error: z.ZodError): string {
  const issues = error.issues
  if (issues.length === 0) return 'Invalid request'
  const first = issues[0]
  const path = first.path.length > 0 ? `${first.path.join('.')}: ` : ''
  return `Invalid request: ${path}${first.message}`
}

/**
 * Express middleware that validates req.body, req.query, and req.params
 * against optional Zod schemas. Validates before reaching the controller.
 * On success, overwrites the corresponding req properties with validated values.
 * On failure, responds with 400 and GENERIC_VALIDATION_FAILED.
 */
export function validateRequest<
  TBody extends ZodSchema,
  TQuery extends ZodSchema,
  TParams extends ZodSchema,
>(options: { body?: TBody; params?: TParams; query?: TQuery }) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (options.body) {
        const result = options.body.safeParse(req.body)
        if (!result.success) {
          sendBadRequestWithCode(
            req,
            res,
            ERROR_CODES.GENERIC_VALIDATION_FAILED,
            formatZodError(result.error),
          )

          return
        }
        ;(req as Request & { body: z.infer<TBody> }).body = result.data
      }

      if (options.query) {
        const result = options.query.safeParse(req.query)
        if (!result.success) {
          sendBadRequestWithCode(
            req,
            res,
            ERROR_CODES.GENERIC_VALIDATION_FAILED,
            formatZodError(result.error),
          )

          return
        }
        ;(req as Request & { query: z.infer<TQuery> }).query = result.data as typeof req.query
      }

      if (options.params) {
        const result = options.params.safeParse(req.params)
        if (!result.success) {
          sendBadRequestWithCode(
            req,
            res,
            ERROR_CODES.GENERIC_VALIDATION_FAILED,
            formatZodError(result.error),
          )

          return
        }
        ;(req as Request & { params: z.infer<TParams> }).params = result.data as typeof req.params
      }

      next()
    } catch (err) {
      sendBadRequestWithCode(
        req,
        res,
        ERROR_CODES.GENERIC_VALIDATION_FAILED,
        (err as Error)?.message ?? 'Validation failed',
      )
    }
  }
}
