/**
 * Mock for HTTP Response helpers
 * Provides HTTP response function mocks for API tests
 *
 * These mocks are ALWAYS applied for controller tests since controllers
 * should be unit tested in isolation from the HTTP layer.
 */

// Define mock functions first (alphabetically sorted)
const mockSendAccepted = jest.fn()
const mockSendBadRequest = jest.fn()
const mockSendBadRequestWithCode = jest.fn()
const mockSendConflict = jest.fn()
const mockSendCreated = jest.fn()
const mockSendForbidden = jest.fn()
const mockSendForbiddenWithCode = jest.fn()
const mockSendInternalServerError = jest.fn()
const mockSendNoContent = jest.fn()
const mockSendNotFound = jest.fn()
const mockSendNotFoundWithCode = jest.fn()
const mockSendOK = jest.fn()
const mockSendServiceUnavailable = jest.fn()
const mockSendTooManyRequests = jest.fn()
const mockSendUnauthorized = jest.fn()
const mockSendUnauthorizedWithCode = jest.fn()
const mockSendUnprocessableEntity = jest.fn()

// Always mock HTTP response functions for controller tests
jest.mock('./http-responses', () => ({
  sendAccepted: mockSendAccepted,
  sendBadRequest: mockSendBadRequest,
  sendBadRequestWithCode: mockSendBadRequestWithCode,
  sendConflict: mockSendConflict,
  sendCreated: mockSendCreated,
  sendForbidden: mockSendForbidden,
  sendForbiddenWithCode: mockSendForbiddenWithCode,
  sendInternalServerError: mockSendInternalServerError,
  sendNoContent: mockSendNoContent,
  sendNotFound: mockSendNotFound,
  sendNotFoundWithCode: mockSendNotFoundWithCode,
  sendOK: mockSendOK,
  sendServiceUnavailable: mockSendServiceUnavailable,
  sendTooManyRequests: mockSendTooManyRequests,
  sendUnauthorized: mockSendUnauthorized,
  sendUnauthorizedWithCode: mockSendUnauthorizedWithCode,
  sendUnprocessableEntity: mockSendUnprocessableEntity,
}))

export const mockHttpResponses = () => {
  // HTTP response functions are already mocked at the top level for unit tests
  // This function exists for consistency with other mock setup functions
}

/**
 * Export mock instance for use in test assertions
 *
 * @example
 * import { httpResponseMock } from '../testing/mocks';
 * expect(httpResponseMock.sendOK).toHaveBeenCalledWith(res, data);
 */
export const httpResponseMock = {
  sendAccepted: mockSendAccepted,
  sendBadRequest: mockSendBadRequest,
  sendBadRequestWithCode: mockSendBadRequestWithCode,
  sendConflict: mockSendConflict,
  sendCreated: mockSendCreated,
  sendForbidden: mockSendForbidden,
  sendForbiddenWithCode: mockSendForbiddenWithCode,
  sendInternalServerError: mockSendInternalServerError,
  sendNoContent: mockSendNoContent,
  sendNotFound: mockSendNotFound,
  sendNotFoundWithCode: mockSendNotFoundWithCode,
  sendOK: mockSendOK,
  sendServiceUnavailable: mockSendServiceUnavailable,
  sendTooManyRequests: mockSendTooManyRequests,
  sendUnauthorized: mockSendUnauthorized,
  sendUnauthorizedWithCode: mockSendUnauthorizedWithCode,
  sendUnprocessableEntity: mockSendUnprocessableEntity,
}
