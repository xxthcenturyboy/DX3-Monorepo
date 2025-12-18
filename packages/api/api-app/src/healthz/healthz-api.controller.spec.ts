import { HealthzController } from './healthz-api.controller'

describe('HealthzController', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(HealthzController).toBeDefined()
  })

  it('should have getHealth method when instantiated', () => {
    // arrange
    // act
    // assert
    expect(HealthzController.getHealth).toBeDefined()
  })
})
