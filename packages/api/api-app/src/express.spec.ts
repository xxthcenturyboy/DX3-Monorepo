import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { type Express as IExpress } from 'express'
import { Express } from 'jest-express/lib/express'

// import session from 'express-session';

import { logger as expressWinston } from 'express-winston'
import helmet from 'helmet'

import { handleError } from '@dx3/api-libs/error-handler/error-handler'
import { ApiLoggingClass } from '@dx3/api-libs/logger'

import { DxRedisCache } from './data/redis/dx-redis.cache'
import { configureExpress } from './express'

let app: IExpress

jest.mock('connect-redis')
jest.mock('express-winston')
jest.mock('helmet', () => () => (req: unknown, res: unknown, next: () => void) => next())
jest.mock('@dx3/api-libs/logger', () => require('@dx3/api-libs/testing/mocks/internal/logger.mock'))
jest.mock('./data/redis/dx-redis.cache')
jest.mock('@dx3/api-libs/error-handler/error-handler')

describe('configureExpress', () => {
  // const logInfoSpy = jest.spyOn(ApiLoggingClass.prototype, 'logInfo');

  beforeAll(() => {
    DxRedisCache.getRedisConnection = jest.fn().mockResolvedValue(null)
    app = new Express() as unknown as IExpress
  })

  beforeEach(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
  })

  it('should exist', () => {
    // arrange
    // act
    // assert
    expect(configureExpress).toBeDefined()
  })

  test('should configure express when invoked', async () => {
    // arrange
    await configureExpress(app, { DEBUG: true, SESSION_SECRET: 'test-secret' })
    // act
    // @ts-expect-error -ok
    expect(JSON.stringify(app.use.mock.calls)).toEqual(
      JSON.stringify([
        [
          cors({
            credentials: true,
            origin: '',
          }),
        ],
        [express.json({ limit: '10mb', type: 'application/json' })],
        [express.urlencoded({ extended: true, limit: '10mb' })],
        [cookieParser()],
        [
          expressWinston({
            winstonInstance: ApiLoggingClass.instance.logger,
          }),
        ],
        // [session({
        //   resave: false,
        //   saveUninitialized: false,
        //   secret: 'test-secret'
        // })],
        [() => handleError],
        [helmet({ contentSecurityPolicy: false })],
      ]),
    )
    // assert
    expect(app.use).toHaveBeenCalledTimes(7)
  })
})
