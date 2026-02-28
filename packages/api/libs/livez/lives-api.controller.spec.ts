import type { Request as IRequest, Response as IResponse } from 'express'
import { Request } from 'jest-express/lib/request'
import { Response } from 'jest-express/lib/response'

import { sendOK } from '../http-response/http-responses'
import { LivesController } from './lives-api.controller'

jest.mock('../http-response/http-responses')

describe('LivesController', () => {
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
    expect(LivesController).toBeDefined()
  })

  it('should have getLives method', () => {
    expect(LivesController.getLives).toBeDefined()
    expect(typeof LivesController.getLives).toBe('function')
  })

  it('should call sendOK with req, res, and "OK" when getLives is invoked', () => {
    LivesController.getLives(req, res)
    expect(sendOK).toHaveBeenCalledWith(req, res, 'OK')
  })
})
