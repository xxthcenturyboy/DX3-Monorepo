import type { NextFunction, Request, Response, Router } from 'express'
import type { Express as IExpress } from 'express'
import { Express } from 'jest-express/lib/express'

import type { CityResponse } from 'maxmind'

import { ApiLoggingClass } from '@dx3/api-libs/logger'
import { GeoIpService } from '@dx3/api-libs/geoip/geoip-api.service'
import { HeaderService } from '@dx3/api-libs/headers/header.service'
import { sendBadRequest } from '@dx3/api-libs/http-response/http-responses'

import { ApiRoutes } from './api.routes'

// Logger mock must be explicit here — the global setupAllMocks() only initialises
// a real ApiLoggingClass instance; without this mock, ApiLoggingClass.instance
// is undefined inside the versionMiddleware error branch.
jest.mock('@dx3/api-libs/logger', () => require('@dx3/api-libs/testing/mocks/internal/logger.mock'))

// Rate limiters are globally mocked via test-setup; mock here to be explicit
jest.mock('../rate-limiters/rate-limiters.dx.ts')

// Sub-route mocks — configure() returns a plain jest.fn() acting as a router/middleware
jest.mock('../devices/well-known/well-known.routes', () => ({
  WellKnownRoutes: { configure: jest.fn().mockReturnValue(jest.fn()) },
}))
jest.mock('../healthz/healthz-api.routes', () => ({
  HealthzRoutes: { configure: jest.fn().mockReturnValue(jest.fn()) },
}))
jest.mock('../media/media-api.routes', () => ({
  MediaApiBaseRoutes: { configure: jest.fn().mockReturnValue(jest.fn()) },
}))
jest.mock('./v1.routes', () => ({
  RoutesV1: { configure: jest.fn().mockReturnValue(jest.fn()) },
}))
jest.mock('@dx3/api-libs/livez/lives-api.routes', () => ({
  LivezRoutes: { configure: jest.fn().mockReturnValue(jest.fn()) },
}))

// GeoIpService.lookup must be mocked to control the geo-lookup middleware branch
jest.mock('@dx3/api-libs/geoip/geoip-api.service', () => ({
  GeoIpService: { lookup: jest.fn().mockResolvedValue(null) },
}))

// HeaderService: extend the global mock to include methods used by api.routes
jest.mock('@dx3/api-libs/headers/header.service', () => ({
  HeaderService: {
    getFingerprintFromRequest: jest.fn().mockReturnValue(null),
    getTokenFromHandshake: jest.fn(),
    getTokenFromRequest: jest.fn(),
    getVersionFromRequest: jest.fn().mockReturnValue(0),
  },
}))

// createApiErrorMessage is used inside versionMiddleware error handler
jest.mock('@dx3/api-libs/utils', () => ({
  createApiErrorMessage: jest.fn().mockReturnValue({ code: 'ERR', message: 'Version error' }),
}))

// -----------------------------------------------------------------------
// Mock router factory: gives us a callable jest.fn() with use/all methods
// so we can intercept loadRoutes() and extract the middleware closures
// -----------------------------------------------------------------------
type MockRouterType = jest.Mock & { all: jest.Mock; use: jest.Mock }

function createMockRouter(): MockRouterType {
  const fn = jest.fn() as MockRouterType
  fn.all = jest.fn()
  fn.use = jest.fn()
  return fn
}

// -----------------------------------------------------------------------
// Type aliases for the three middleware closures extracted from loadRoutes
// -----------------------------------------------------------------------
type GeoIpMiddleware = (req: Request, res: Response, next: NextFunction) => Promise<void>
type FingerprintMiddleware = (req: Request, res: Response, next: NextFunction) => void
type VersionMiddleware = (req: Request, res: Response, next: NextFunction) => void

describe('ApiRoutes', () => {
  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
  })

  it('should exist when imported', () => {
    // arrange / act / assert
    expect(ApiRoutes).toBeDefined()
  })

  it('should have correct methods and attributes when instantiated', () => {
    // arrange
    const app = new Express() as unknown as IExpress
    // act
    const routes = new ApiRoutes(app)
    // assert
    expect(routes).toBeDefined()
    expect(routes.app).toBeDefined()
    expect(routes.baseRouter).toBeDefined()
    expect(routes.v1Router).toBeDefined()
    expect(routes.loadRoutes).toBeDefined()
  })

  describe('loadRoutes', () => {
    let app: IExpress
    let routes: ApiRoutes
    let mockBaseRouter: MockRouterType
    let mockV1Router: MockRouterType
    let geoIpMiddleware: GeoIpMiddleware
    let fingerprintMiddleware: FingerprintMiddleware
    let versionMiddleware: VersionMiddleware

    beforeEach(() => {
      app = new Express() as unknown as IExpress
      mockBaseRouter = createMockRouter()
      mockV1Router = createMockRouter()

      routes = new ApiRoutes(app)
      // Replace real Express routers with mocks BEFORE loadRoutes() so that
      // middleware closures created inside loadRoutes() close over the mocks.
      // This lets us extract the closure references from the captured .use() args.
      routes.baseRouter = mockBaseRouter as unknown as Router
      routes.v1Router = mockV1Router as unknown as Router

      routes.loadRoutes()

      // Extract middleware closures from the captured mock-router call arguments.
      //
      // loadRoutes() calls baseRouter.use() in this order:
      //   [0] '/healthz'   — no geoIp/fingerprint
      //   [1] '/livez'     — no geoIp/fingerprint
      //   [2] '/media'     — geoIpMiddleware(arg[1]), fingerprintMiddleware(arg[2])
      //   [3] '/.well-known'
      //
      // app.use() is called as:
      //   [0] ('/api', [rateLimiter, geoIp, fingerprint, versionMiddleware])
      //   [1] ('/*',  [...], endpointNotFound)
      geoIpMiddleware = mockBaseRouter.use.mock.calls[2][1] as GeoIpMiddleware
      fingerprintMiddleware = mockBaseRouter.use.mock.calls[2][2] as FingerprintMiddleware

      const apiMiddlewares = (app.use as jest.Mock).mock.calls[0][1] as unknown[]
      versionMiddleware = apiMiddlewares[3] as VersionMiddleware
    })

    it('should register routes on baseRouter, v1Router, and app', () => {
      // assert — key route methods were called
      expect(mockBaseRouter.use).toHaveBeenCalled()
      expect(mockBaseRouter.all).toHaveBeenCalled()
      expect(mockV1Router.use).toHaveBeenCalled()
      expect(app.use).toHaveBeenCalled()
    })

    // -------------------------------------------------------------------
    // geoIpMiddleware — closure that attaches geo data to req
    // -------------------------------------------------------------------
    describe('geoIpMiddleware', () => {
      it('should attach geo data to req and call next when lookup returns a result', async () => {
        // arrange
        const mockGeo = { city: { names: { en: 'New York' } } } as CityResponse
        const req = { ip: '1.2.3.4' } as Request
        const next = jest.fn()
        jest.mocked(GeoIpService.lookup).mockResolvedValueOnce(mockGeo)
        // act
        await geoIpMiddleware(req, {} as Response, next)
        // assert
        expect(GeoIpService.lookup).toHaveBeenCalledWith('1.2.3.4')
        expect(req.geo).toEqual(mockGeo)
        expect(next).toHaveBeenCalled()
      })

      it('should call next without setting req.geo when lookup returns null', async () => {
        // arrange
        const req = { ip: '1.2.3.4' } as Request
        const next = jest.fn()
        jest.mocked(GeoIpService.lookup).mockResolvedValueOnce(null)
        // act
        await geoIpMiddleware(req, {} as Response, next)
        // assert
        expect(req.geo).toBeUndefined()
        expect(next).toHaveBeenCalled()
      })
    })

    // -------------------------------------------------------------------
    // fingerprintMiddleware — closure that attaches client fingerprint to req
    // -------------------------------------------------------------------
    describe('fingerprintMiddleware', () => {
      it('should attach fingerprint to req and call next when header is present', () => {
        // arrange
        const req = {} as Request
        const next = jest.fn()
        jest.mocked(HeaderService.getFingerprintFromRequest).mockReturnValueOnce('fp-abc123')
        // act
        fingerprintMiddleware(req, {} as Response, next)
        // assert
        expect(req.fingerprint).toBe('fp-abc123')
        expect(next).toHaveBeenCalled()
      })

      it('should call next without setting req.fingerprint when no fingerprint header exists', () => {
        // arrange
        const req = {} as Request
        const next = jest.fn()
        jest.mocked(HeaderService.getFingerprintFromRequest).mockReturnValueOnce(null)
        // act
        fingerprintMiddleware(req, {} as Response, next)
        // assert
        expect(req.fingerprint).toBeUndefined()
        expect(next).toHaveBeenCalled()
      })
    })

    // -------------------------------------------------------------------
    // versionMiddleware — routes request to v1Router (version 1) or baseRouter
    // -------------------------------------------------------------------
    describe('versionMiddleware', () => {
      it('should delegate to v1Router when the request version header equals 1', () => {
        // arrange
        const req = {} as Request
        const res = {} as Response
        const next = jest.fn()
        jest.mocked(HeaderService.getVersionFromRequest).mockReturnValueOnce(1)
        // act
        versionMiddleware(req, res, next)
        // assert — mockV1Router is a jest.fn(), so it captures the (req, res, next) call
        expect(mockV1Router).toHaveBeenCalledWith(req, res, next)
        expect(mockBaseRouter).not.toHaveBeenCalled()
      })

      it('should delegate to baseRouter when the request version header is not 1', () => {
        // arrange
        const req = {} as Request
        const res = {} as Response
        const next = jest.fn()
        jest.mocked(HeaderService.getVersionFromRequest).mockReturnValueOnce(2)
        // act
        versionMiddleware(req, res, next)
        // assert
        expect(mockBaseRouter).toHaveBeenCalledWith(req, res, next)
        expect(mockV1Router).not.toHaveBeenCalled()
      })

      it('should call sendBadRequest when version extraction throws an error', () => {
        // arrange
        const req = {} as Request
        const res = {} as Response
        const next = jest.fn()
        jest.mocked(HeaderService.getVersionFromRequest).mockImplementationOnce(() => {
          throw new Error('Malformed version header')
        })
        // act
        versionMiddleware(req, res, next)
        // assert — error is caught and sendBadRequest is invoked with the request context
        expect(sendBadRequest).toHaveBeenCalledWith(req, res, expect.anything())
      })
    })
  })
})
