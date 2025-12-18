import type { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { sendBadRequest, sendForbidden } from '../http-response/http-responses'
import { ApiLoggingClass } from '../logger'

export function handleError(
  req: Request,
  res: Response,
  err: { code: number; message: string } | Error | string,
  message?: string,
  code?: number,
) {
  if (code) {
    res.status(code)
  } else {
    res.status(400)
  }
  const logger = ApiLoggingClass.instance

  const messageText = 'Bad Request'

  if (typeof err === 'object' && err !== null && 'code' in err && 'message' in err) {
    if (err.code === StatusCodes.FORBIDDEN) {
      return sendForbidden(req, res, err.message as string)
    }

    return sendBadRequest(req, res, err.message as string)
  }

  if (err instanceof Error) {
    logger.logError(JSON.stringify(err), err)
    if (message) {
      return sendBadRequest(req, res, message)
    }
    return sendBadRequest(req, res, err.message)
  }

  if (typeof err === 'string') {
    if (message) {
      return sendBadRequest(req, res, message)
    }
    return sendBadRequest(req, res, err)
  }

  sendBadRequest(req, res, messageText)
}
