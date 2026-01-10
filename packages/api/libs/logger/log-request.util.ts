import type { Request } from 'express'

import { ApiLoggingClass } from './logger-api.class'
import { safeStringify } from './sanitize-log.util'

function _getUserId(req: Request) {
  if (req.user) {
    return `userId: ${req.user.id}`
  }

  return 'logged-out'
}

function _getRequestData(req: Request) {
  let data = ''
  if (req.method === 'GET') {
    if (Object.keys(req.params).length) {
      data += `params: ${safeStringify(req.params)}`
    }

    if (Object.keys(req.query).length) {
      data += `query: ${safeStringify(req.query)}`
    }

    return data
  }

  if (req.method === 'PUT') {
    if (Object.keys(req.params).length) {
      data += `params: ${safeStringify(req.params)}`
    }

    if (Object.keys(req.body).length) {
      data += `payload: ${safeStringify(req.body)}`
    }

    return data
  }

  if (req.method === 'POST') {
    if (Object.keys(req.body).length) {
      data += `payload: ${safeStringify(req.body)}`
    }

    return data
  }

  if (req.method === 'DELETE') {
    if (Object.keys(req.params).length) {
      data += `params: ${safeStringify(req.params)}`
    }

    if (Object.keys(req.query).length) {
      data += `query: ${safeStringify(req.query)}`
    }

    return data
  }

  return data
}

export function logRequest(data: { message?: string; req: Request; type: string }) {
  const { message, req, type } = data
  const userId = _getUserId(req)
  const requestData = _getRequestData(req)

  const segments = [
    `method: ${req.method}`,
    `ip: ${req.headers['X-Forwarded-For'] || req.ip}`,
    userId,
    requestData,
  ]

  if (message) {
    segments.push(`msg: ${message}`)
  }

  if (type.toLowerCase().startsWith('fail')) {
    ApiLoggingClass?.instance?.logError(`${type}: ${segments.join(' | ')}`)
  } else {
    ApiLoggingClass?.instance?.logInfo(`${type}: ${segments.join(' | ')}`)
  }
}
