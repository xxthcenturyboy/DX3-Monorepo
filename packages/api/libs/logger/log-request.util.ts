import { ApiLoggingClass } from './logger-api.class'
import { safeStringify } from './sanitize-log.util'
import type { Request } from 'express'

function _getUserId(req: Request) {
  if (req.user) {
    return `userId: ${req.user.id}`
  }

  return 'logged-out'
}


function _getFingerprint(req: Request) {
  if (req.fingerprint) {
    return `fingerprint: ${req.fingerprint}`
  }

  return null
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
  const fingerprint = _getFingerprint(req)
  const userId = _getUserId(req)
  const requestData = _getRequestData(req)

  const segments = [
    `method: ${req.method}`,
    `ip: ${req.headers['X-Forwarded-For'] || req.ip}`,
    userId,
    requestData,
  ]

  if (fingerprint) {
    segments.push(fingerprint)
  }

  if (message) {
    segments.push(`msg: ${message}`)
  }

  if (type.toLowerCase().startsWith('fail')) {
    ApiLoggingClass?.instance?.logError(`${type}: ${segments.join(' | ')}`)
  } else {
    ApiLoggingClass?.instance?.logInfo(`${type}: ${segments.join(' | ')}`)
  }
}
