import { EmailRoutes } from './email-api.routes'

describe('EmailRoutes', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(EmailRoutes).toBeDefined()
  })

  it('should have static configure method without being instantiated', () => {
    // arrange
    // act
    // assert
    expect(EmailRoutes.configure).toBeDefined()
  })

  it('should get routes when invoked', () => {
    // arrange
    // act
    const routes = EmailRoutes.configure()
    // assert
    expect(routes).toBeDefined()
  })
})
