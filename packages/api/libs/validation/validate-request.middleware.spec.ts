import type { Request as IRequest, Response as IResponse } from 'express'
import { z } from 'zod'
import { next } from 'jest-express/lib/next'
import { Request } from 'jest-express/lib/request'
import { Response } from 'jest-express/lib/response'

import { ERROR_CODES } from '@dx3/models-shared'

import { sendBadRequestWithCode } from '../http-response/http-responses'
import { validateRequest } from './validate-request.middleware'

jest.mock('../http-response/http-responses')

describe('validateRequest', () => {
  let req: IRequest
  let res: IResponse

  beforeEach(() => {
    req = new Request() as unknown as IRequest
    res = new Response() as unknown as IResponse
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should exist when imported', () => {
    expect(validateRequest).toBeDefined()
  })

  it('should return a middleware function', () => {
    const middleware = validateRequest({})
    expect(typeof middleware).toBe('function')
    expect(middleware.length).toBe(3) // req, res, next
  })

  it('should call next when no schemas are provided', () => {
    const middleware = validateRequest({})
    middleware(req, res, next)
    expect(next).toHaveBeenCalled()
    expect(sendBadRequestWithCode).not.toHaveBeenCalled()
  })

  describe('body validation', () => {
    const bodySchema = z.object({ email: z.string().email(), name: z.string().min(1) })

    it('should call next when body is valid', () => {
      req.body = { email: 'test@example.com', name: 'Test User' }
      const middleware = validateRequest({ body: bodySchema })
      middleware(req, res, next)
      expect(next).toHaveBeenCalled()
      expect(sendBadRequestWithCode).not.toHaveBeenCalled()
      expect(req.body).toEqual({ email: 'test@example.com', name: 'Test User' })
    })

    it('should overwrite req.body with validated data', () => {
      req.body = { email: 'valid@example.com', name: 'Valid Name' }
      const middleware = validateRequest({ body: bodySchema })
      middleware(req, res, next)
      expect(next).toHaveBeenCalled()
      expect(req.body).toEqual({ email: 'valid@example.com', name: 'Valid Name' })
    })

    it('should call sendBadRequestWithCode when body is invalid', () => {
      req.body = { email: 'invalid-email', name: 'Test' }
      const middleware = validateRequest({ body: bodySchema })
      middleware(req, res, next)
      expect(sendBadRequestWithCode).toHaveBeenCalledWith(
        req,
        res,
        ERROR_CODES.GENERIC_VALIDATION_FAILED,
        expect.stringContaining('Invalid request'),
      )
      expect(next).not.toHaveBeenCalled()
    })

    it('should call sendBadRequestWithCode when body is missing required field', () => {
      req.body = { email: 'test@example.com' }
      const middleware = validateRequest({ body: bodySchema })
      middleware(req, res, next)
      expect(sendBadRequestWithCode).toHaveBeenCalledWith(
        req,
        res,
        ERROR_CODES.GENERIC_VALIDATION_FAILED,
        expect.stringMatching(/Invalid request/),
      )
      expect(next).not.toHaveBeenCalled()
    })
  })

  describe('query validation', () => {
    const querySchema = z.object({ page: z.coerce.number().min(1), limit: z.coerce.number().max(100) })

    it('should call next when query is valid', () => {
      req.query = { page: '1', limit: '10' }
      const middleware = validateRequest({ query: querySchema })
      middleware(req, res, next)
      expect(next).toHaveBeenCalled()
      expect(sendBadRequestWithCode).not.toHaveBeenCalled()
      expect(req.query).toEqual({ page: 1, limit: 10 })
    })

    it('should call sendBadRequestWithCode when query is invalid', () => {
      req.query = { page: '-1', limit: '10' }
      const middleware = validateRequest({ query: querySchema })
      middleware(req, res, next)
      expect(sendBadRequestWithCode).toHaveBeenCalledWith(
        req,
        res,
        ERROR_CODES.GENERIC_VALIDATION_FAILED,
        expect.stringMatching(/Invalid request/),
      )
      expect(next).not.toHaveBeenCalled()
    })
  })

  describe('params validation', () => {
    const paramsSchema = z.object({ id: z.string().uuid() })

    it('should call next when params are valid', () => {
      req.params = { id: '550e8400-e29b-41d4-a716-446655440000' }
      const middleware = validateRequest({ params: paramsSchema })
      middleware(req, res, next)
      expect(next).toHaveBeenCalled()
      expect(sendBadRequestWithCode).not.toHaveBeenCalled()
      expect(req.params).toEqual({ id: '550e8400-e29b-41d4-a716-446655440000' })
    })

    it('should call sendBadRequestWithCode when params are invalid', () => {
      req.params = { id: 'not-a-uuid' }
      const middleware = validateRequest({ params: paramsSchema })
      middleware(req, res, next)
      expect(sendBadRequestWithCode).toHaveBeenCalledWith(
        req,
        res,
        ERROR_CODES.GENERIC_VALIDATION_FAILED,
        expect.stringMatching(/Invalid request/),
      )
      expect(next).not.toHaveBeenCalled()
    })
  })

  describe('combined validation', () => {
    const bodySchema = z.object({ value: z.string().min(1) })
    const querySchema = z.object({ type: z.enum(['a', 'b']) })
    const paramsSchema = z.object({ id: z.string().min(1) })

    it('should call next when body, query, and params are all valid', () => {
      req.body = { value: 'test' }
      req.query = { type: 'a' }
      req.params = { id: '123' }
      const middleware = validateRequest({ body: bodySchema, params: paramsSchema, query: querySchema })
      middleware(req, res, next)
      expect(next).toHaveBeenCalled()
      expect(sendBadRequestWithCode).not.toHaveBeenCalled()
    })

    it('should fail on first invalid schema (body before query before params)', () => {
      req.body = {}
      req.query = { type: 'a' }
      req.params = { id: '123' }
      const middleware = validateRequest({ body: bodySchema, params: paramsSchema, query: querySchema })
      middleware(req, res, next)
      expect(sendBadRequestWithCode).toHaveBeenCalledTimes(1)
      expect(next).not.toHaveBeenCalled()
    })
  })

  describe('formatZodError behavior', () => {
    it('should include path in error message when path exists', () => {
      const schema = z.object({ nested: z.object({ field: z.string().min(1) }) })
      req.body = { nested: { field: '' } }
      const middleware = validateRequest({ body: schema })
      middleware(req, res, next)
      expect(sendBadRequestWithCode).toHaveBeenCalledWith(
        req,
        res,
        ERROR_CODES.GENERIC_VALIDATION_FAILED,
        expect.stringMatching(/nested\.field|Invalid request/),
      )
    })
  })

  describe('exception handling', () => {
    it('should call sendBadRequestWithCode when schema throws', () => {
      const throwingSchema = z.object({
        value: z.string().refine(() => {
          throw new Error('Custom validation error')
        }),
      })
      req.body = { value: 'test' }
      const middleware = validateRequest({ body: throwingSchema })
      middleware(req, res, next)
      expect(sendBadRequestWithCode).toHaveBeenCalledWith(
        req,
        res,
        ERROR_CODES.GENERIC_VALIDATION_FAILED,
        expect.stringMatching(/Custom validation error|Validation failed/),
      )
      expect(next).not.toHaveBeenCalled()
    })
  })
})
