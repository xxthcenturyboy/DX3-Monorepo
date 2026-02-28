import type { Request as IRequest, Response as IResponse } from 'express'
import { Request } from 'jest-express/lib/request'
import { Response } from 'jest-express/lib/response'

import { sendOK } from '../http-response/http-responses'
import { LivezRoutes } from './lives-api.routes'

jest.mock('../http-response/http-responses')

describe('LivezRoutes', () => {
  it('should exist when imported', () => {
    expect(LivezRoutes).toBeDefined()
  })

  it('should have configure static method', () => {
    expect(LivezRoutes.configure).toBeDefined()
    expect(typeof LivezRoutes.configure).toBe('function')
  })

  it('should return a router from configure', () => {
    const router = LivezRoutes.configure()
    expect(router).toBeDefined()
    expect(typeof router).toBe('function')
  })

  it('should register GET / route that calls sendOK with "OK"', () => {
    const router = LivezRoutes.configure()
    const req = new Request() as unknown as IRequest
    const res = new Response() as unknown as IResponse
    req.method = 'GET'
    req.url = '/'

    router(req, res, () => {})

    expect(sendOK).toHaveBeenCalledWith(req, res, 'OK')
  })
})
