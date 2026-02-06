import type { NextFunction, Request, Response } from 'express'
import { getReasonPhrase, StatusCodes } from 'http-status-codes'

import type { ErrorCodeType } from '@dx3/models-shared'

import { ApiLoggingClass } from '../logger'
import { createApiErrorMessage } from '../utils/lib/error/api-error.utils'
// import { CookeiService } from '@dx/utils-cookies';

// export function destroySession(req: Request, res: Response) {
//   CookeiService.clearCookies(res);
//   req.session?.destroy(() => null);
// }

export function send400(res: Response, data: unknown): void {
  res
    .status((data as { status?: number }).status || StatusCodes.BAD_REQUEST)
    .send(data)
    .end()
}

export function sendOK(_req: Request, res: Response, data: unknown): void {
  res.status(StatusCodes.OK).send(data).end()
}

export function sendNoContent(_req: Request, res: Response, data: unknown): void {
  res.status(StatusCodes.NO_CONTENT).send(data).end()
}

export function sendFile(_req: Request, res: Response, pathToFile: string, fileName: string): void {
  res.download(pathToFile, fileName, (err) => {
    if (err) {
      ApiLoggingClass.instance.logError('Send file error', err)
    }
    ApiLoggingClass.instance.logInfo(`File sent to client: ${fileName}`)
  })
}

export function sendMethodNotAllowed(req: Request, res: Response, message: string): void {
  ApiLoggingClass.instance.logWarn(`No Method: ${req.method} ${req.url}`)
  send400(res, {
    description: getReasonPhrase(StatusCodes.METHOD_NOT_ALLOWED),
    message,
    status: StatusCodes.METHOD_NOT_ALLOWED,
    url: req.url,
  })
}

export function sendTooManyRequests(req: Request, res: Response, message: string): void {
  ApiLoggingClass.instance.logWarn(`Too many requests: ${req.method} ${req.url}`)
  send400(res, {
    description: getReasonPhrase(StatusCodes.TOO_MANY_REQUESTS),
    message,
    status: StatusCodes.TOO_MANY_REQUESTS,
    url: req.url,
  })
}

export function endpointNotFound(req: Request, res: Response, _next: NextFunction): void {
  ApiLoggingClass.instance.logError(`Endpoint not found: ${req.method} ${req.url}`)
  send400(res, {
    description: getReasonPhrase(StatusCodes.METHOD_NOT_ALLOWED),
    message: 'API endpoint not found.',
    status: StatusCodes.METHOD_NOT_ALLOWED,
    url: req.url,
  })
}

export function sendBadRequest(req: Request, res: Response, err: Error | string): void {
  const message = typeof err === 'string' ? err : err?.message
  send400(res, {
    description: getReasonPhrase(StatusCodes.BAD_REQUEST),
    message,
    status: StatusCodes.BAD_REQUEST,
    url: req.url,
  })
}

/**
 * Send a bad request response with a standardized error code.
 * The frontend will parse this to display a localized message.
 *
 * @param req - Express request
 * @param res - Express response
 * @param code - Error code from ERROR_CODES
 * @param message - Human-readable error message
 */
export function sendBadRequestWithCode(
  req: Request,
  res: Response,
  code: ErrorCodeType,
  message: string,
): void {
  send400(res, {
    description: getReasonPhrase(StatusCodes.BAD_REQUEST),
    message: createApiErrorMessage(code, message),
    status: StatusCodes.BAD_REQUEST,
    url: req.url,
  })
}

export function sendUnauthorized(req: Request, res: Response, message: string) {
  ApiLoggingClass.instance.logWarn(
    `Unauthorized: ${req.url}, userId: ${req.user?.id || 'unavailable'}`,
  )
  // destroySession(req, res);
  // CookeiService.clearCookies(res);
  send400(res, {
    description: getReasonPhrase(StatusCodes.UNAUTHORIZED),
    message,
    status: StatusCodes.UNAUTHORIZED,
    url: req.url,
  })
}

/**
 * Send an unauthorized response with a standardized error code.
 *
 * @param req - Express request
 * @param res - Express response
 * @param code - Error code from ERROR_CODES
 * @param message - Human-readable error message
 */
export function sendUnauthorizedWithCode(
  req: Request,
  res: Response,
  code: ErrorCodeType,
  message: string,
) {
  ApiLoggingClass.instance.logWarn(
    `Unauthorized: ${req.url}, userId: ${req.user?.id || 'unavailable'}`,
  )
  send400(res, {
    description: getReasonPhrase(StatusCodes.UNAUTHORIZED),
    message: createApiErrorMessage(code, message),
    status: StatusCodes.UNAUTHORIZED,
    url: req.url,
  })
}

export function sendForbidden(req: Request, res: Response, message: string): void {
  ApiLoggingClass.instance.logWarn(
    `Forbidden: ${req.url}, userId: ${req.user?.id || 'unavailable'}`,
  )
  // destroySession(req, res);
  // CookeiService.clearCookies(res);
  send400(res, {
    description: getReasonPhrase(StatusCodes.FORBIDDEN),
    message,
    status: StatusCodes.FORBIDDEN,
    url: req.url,
  })
}

/**
 * Send a forbidden response with a standardized error code.
 *
 * @param req - Express request
 * @param res - Express response
 * @param code - Error code from ERROR_CODES
 * @param message - Human-readable error message
 */
export function sendForbiddenWithCode(
  req: Request,
  res: Response,
  code: ErrorCodeType,
  message: string,
): void {
  ApiLoggingClass.instance.logWarn(
    `Forbidden: ${req.url}, userId: ${req.user?.id || 'unavailable'}`,
  )
  send400(res, {
    description: getReasonPhrase(StatusCodes.FORBIDDEN),
    message: createApiErrorMessage(code, message),
    status: StatusCodes.FORBIDDEN,
    url: req.url,
  })
}

export function sendNotFound(req: Request, res: Response, message: string): void {
  ApiLoggingClass.instance.logWarn(`Not Found: ${req.url}`)
  send400(res, {
    description: getReasonPhrase(StatusCodes.NOT_FOUND),
    message,
    status: StatusCodes.NOT_FOUND,
    url: req.url,
  })
}

/**
 * Send a not found response with a standardized error code.
 *
 * @param req - Express request
 * @param res - Express response
 * @param code - Error code from ERROR_CODES
 * @param message - Human-readable error message
 */
export function sendNotFoundWithCode(
  req: Request,
  res: Response,
  code: ErrorCodeType,
  message: string,
): void {
  ApiLoggingClass.instance.logWarn(`Not Found: ${req.url}`)
  send400(res, {
    description: getReasonPhrase(StatusCodes.NOT_FOUND),
    message: createApiErrorMessage(code, message),
    status: StatusCodes.NOT_FOUND,
    url: req.url,
  })
}

export function sendServiceUnavailable(req: Request, res: Response, message: string): void {
  ApiLoggingClass.instance.logWarn(`Service Unavailable: ${req.url}`)
  send400(res, {
    description: getReasonPhrase(StatusCodes.SERVICE_UNAVAILABLE),
    message,
    status: StatusCodes.SERVICE_UNAVAILABLE,
    url: req.url,
  })
}
