import { NotificationRoutes } from './notification-api.routes'

jest.mock('@dx3/api-libs/http-response/http-responses.ts')

describe('NotificationRoutes', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(NotificationRoutes).toBeDefined()
  })

  it('should have static configure method without being instantiated', () => {
    // arrange
    // act
    // assert
    expect(NotificationRoutes.configure).toBeDefined()
  })

  it('should get routes when invoked', () => {
    // arrange
    // act
    const routes = NotificationRoutes.configure()
    // assert
    expect(routes).toBeDefined()
  })
})
