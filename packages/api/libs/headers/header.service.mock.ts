/**
 * Mock for HeaderService
 * Provides HTTP header management mocks for authentication tests
 */

export const mockHeaderService = () => {
  jest.mock('./header.service', () => ({
    HeaderService: {
      getTokenFromHandshake: jest.fn(),
      getTokenFromRequest: jest.fn(),
    },
  }))
}

/**
 * Export mock instance for use in test assertions
 *
 * @example
 * import { headerServiceMock } from '../testing/mocks';
 * expect(headerServiceMock.getTokenFromRequest).toHaveBeenCalledWith(req);
 */
export const headerServiceMock = {
  getTokenFromRequest: jest.fn(),
}
