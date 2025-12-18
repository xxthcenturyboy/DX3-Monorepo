import type { Request as IRequest, Response as IResponse } from 'express'
import { StatusCodes } from 'http-status-codes'
import { Request } from 'jest-express/lib/request'
import { Response } from 'jest-express/lib/response'

import { ApiLoggingClass } from '../logger'
import { sendFile, sendOK } from './http-responses'

jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))
jest.mock('./http-responses', () => {
  const actual = jest.requireActual<typeof import('./http-responses')>('./http-responses')
  return {
    ...actual,
    // destroySession: jest.fn(),
    send400: jest.fn(),
  }
})

describe('HttpResponses', () => {
  let req: IRequest
  let res: IResponse

  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
  })

  beforeEach(() => {
    req = new Request() as unknown as IRequest
    res = new Response() as unknown as IResponse
  })

  afterAll(() => {
    jest.clearAllMocks()
  })

  it('should send a success response with data when sendOk is invoked', () => {
    // arrange
    const data = { test: 'data' }
    // act
    sendOK(req, res, data)
    // assert
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK)
    expect(res.send).toHaveBeenCalled()
    expect(res.send).toHaveBeenCalledWith(data)
    expect(res.end).toHaveBeenCalled()
  })

  it('should send a file response with data when sendFile is invoked', () => {
    // arrange
    const filePath = '/download'
    const fileName = 'test.png'
    // act
    sendFile(req, res, filePath, fileName)
    // assert
    expect(res.download).toHaveBeenCalled()
  })

  // it('should send a method not allowed response with data when endpointNotFound is invoked', () => {
  //   // arrange
  //   // act
  //   endpointNotFound(req, res, next);
  //   // assert
  //   expect(send400).toHaveBeenCalled();
  // });

  // it('should send a 400 response with data when sendBadRequest is invoked', () => {
  //   // arrange
  //   // act
  //   sendBadRequest(req, res, 'bad request');
  //   // assert
  //   expect(send400).toHaveBeenCalled();
  // });

  // it('should send a 400 response with data when sendUnauthorized is invoked', () => {
  //   // arrange
  //   // act
  //   sendUnauthorized(req, res, 'not authorized');
  //   // assert
  //   expect(destroySession).toHaveBeenCalled();
  //   expect(send400).toHaveBeenCalled();
  // });

  // it('should send a 400 response with data when sendForbidden is invoked', () => {
  //   // arrange
  //   // act
  //   sendForbidden(req, res, 'not authorized');
  //   // assert
  //   expect(destroySession).toHaveBeenCalled();
  //   expect(send400).toHaveBeenCalled();
  // });

  // it('should send a 400 response with data when sendNotFound is invoked', () => {
  //   // arrange
  //   // act
  //   sendNotFound(req, res, 'not found');
  //   // assert
  //   expect(send400).toHaveBeenCalled();
  // });

  // it('should send a 400 response with data when sendMethodNotAllowed is invoked', () => {
  //   // arrange
  //   // act
  //   sendMethodNotAllowed(req, res, 'not allowed');
  //   // assert
  //   expect(send400).toHaveBeenCalled();
  // });
})
