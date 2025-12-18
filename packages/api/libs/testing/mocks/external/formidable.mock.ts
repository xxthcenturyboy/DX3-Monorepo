/// <reference types="jest" />

/**
 * Mock for formidable form parsing library
 * Provides form data parsing mocks for file upload tests
 */

export const mockFormidable = () => {
  const formMock = {
    on: jest.fn().mockReturnThis(),
    once: jest.fn().mockReturnThis(),
    parse: jest.fn((_req, callback) => {
      // Default successful parse
      callback(null, { field1: 'value1' }, { file1: { name: 'test.jpg', path: '/tmp/file' } })
    }),
  }

  jest.mock('formidable', () => ({
    __esModule: true,
    default: jest.fn(() => formMock),
  }))

  return formMock
}

/**
 * Export mock instance for use in test assertions
 *
 * @example
 * import { formidableMock } from '../testing/mocks';
 * expect(formidableMock.parse).toHaveBeenCalled();
 */
export const formidableMock = {
  on: jest.fn(),
  parse: jest.fn(),
}

/**
 * Helper to mock formidable parse errors
 *
 * @example
 * import { mockFormidableError } from '../testing/mocks';
 * mockFormidableError('maxFiles exceeded');
 */
export const mockFormidableError = (errorMessage: string) => {
  const formidable = require('formidable')
  formidable.default = jest.fn(() => ({
    parse: jest.fn((_req, callback) => {
      callback(new Error(errorMessage), {}, {})
    }),
  }))
}
