/**
 * Mock for CookeiService
 * Provides cookie management mocks for authentication and session tests
 *
 * These mocks are ALWAYS applied for controller tests since controllers
 * should be unit tested in isolation from the cookie service.
 */

// Define mock functions first
const mockClearCookie = jest.fn()
const mockClearCookies = jest.fn()
const mockGetCookie = jest.fn()
const mockSetCookie = jest.fn()
const mockSetCookies = jest.fn()

// Always mock the local CookeiService class for controller tests
jest.mock('./cookie.service.ts', () => ({
  CookeiService: {
    clearCookie: mockClearCookie,
    clearCookies: mockClearCookies,
    getCookie: mockGetCookie,
    setCookie: mockSetCookie,
    setCookies: mockSetCookies,
  },
}))

export const mockCookieService = () => {
  // CookeiService is already mocked at the top level for unit tests
  // This function exists for consistency with other mock setup functions
}

/**
 * Export mock instance for use in test assertions
 *
 * @example
 * import { cookieServiceMock } from '../testing/mocks';
 * expect(cookieServiceMock.setCookie).toHaveBeenCalledWith(res, 'token', 'value');
 */
export const cookieServiceMock = {
  clearCookie: mockClearCookie,
  clearCookies: mockClearCookies,
  getCookie: mockGetCookie,
  setCookie: mockSetCookie,
  setCookies: mockSetCookies,
}
