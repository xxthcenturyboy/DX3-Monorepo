import { FeatureFlagController } from './feature-flag-api.controller'

/**
 * FeatureFlagController Unit Tests
 *
 * Note: Full integration tests with mocked services are pending resolution
 * of a broader mocking issue affecting multiple controller tests in this codebase.
 * See phone-api.controller.spec.ts and shortlink-api.controller.spec.ts for similar issues.
 */
describe('FeatureFlagController', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(FeatureFlagController).toBeDefined()
  })

  it('should have createFlag method', () => {
    // arrange
    // act
    // assert
    expect(FeatureFlagController.createFlag).toBeDefined()
    expect(typeof FeatureFlagController.createFlag).toBe('function')
  })

  it('should have getAdminFlags method', () => {
    // arrange
    // act
    // assert
    expect(FeatureFlagController.getAdminFlags).toBeDefined()
    expect(typeof FeatureFlagController.getAdminFlags).toBe('function')
  })

  it('should have getAllFlags method', () => {
    // arrange
    // act
    // assert
    expect(FeatureFlagController.getAllFlags).toBeDefined()
    expect(typeof FeatureFlagController.getAllFlags).toBe('function')
  })

  it('should have updateFlag method', () => {
    // arrange
    // act
    // assert
    expect(FeatureFlagController.updateFlag).toBeDefined()
    expect(typeof FeatureFlagController.updateFlag).toBe('function')
  })
})
