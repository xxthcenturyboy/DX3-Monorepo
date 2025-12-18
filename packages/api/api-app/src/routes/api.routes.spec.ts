import type { Express as IExpress } from 'express'
import { Express } from 'jest-express/lib/express'

import { ApiRoutes } from './api.routes'

jest.mock('@dx3/api-libs/error-handler/error-handler.ts')
jest.mock('../rate-limiters/rate-limiters.dx.ts')

describe('AuthRoutes', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(ApiRoutes).toBeDefined()
  })

  it('should have correct methods and attributes routes when instantiated', () => {
    // arrange
    const app = new Express() as unknown as IExpress
    // act
    const routes = new ApiRoutes(app)
    // assert
    expect(routes).toBeDefined()
    expect(routes.app).toBeDefined()
    expect(routes.router).toBeDefined()
    expect(routes.loadRoutes).toBeDefined()
  })
})
