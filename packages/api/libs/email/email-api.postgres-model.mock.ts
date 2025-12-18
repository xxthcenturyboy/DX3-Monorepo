import { TEST_EXISTING_EMAIL } from '@dx3/test-data'

/**
 * Mock for EmailModel
 * Provides database model mocks for email-related tests
 */

// Top-level mock - Jest hoists this automatically
jest.mock('./email-api.postgres-model', () => ({
  EmailModel: {
    clearAllDefaultByUserId: jest.fn().mockResolvedValue(undefined),
    createOrFindOneByUserId: jest.fn(),
    findAllByUserId: jest.fn().mockResolvedValue([]),
    findByEmail: jest.fn().mockImplementation((email: string) => {
      if (email === TEST_EXISTING_EMAIL) {
        return Promise.resolve({
          createdAt: new Date(),
          default: true,
          email: TEST_EXISTING_EMAIL,
          id: 'existing-email-id',
          updatedAt: new Date(),
          userId: 'existing-user-id',
          verifiedAt: new Date(),
        })
      }
      return Promise.resolve(null)
    }),
    isEmailAvailable: jest.fn().mockImplementation((email: string) => {
      // Mock logic: existing email is not available, others are available
      return Promise.resolve(email !== TEST_EXISTING_EMAIL)
    }),
    updateMessageInfo: jest.fn().mockResolvedValue(undefined),
    updateMessageInfoValidate: jest.fn().mockResolvedValue(undefined),
    validateEmail: jest.fn().mockResolvedValue(undefined),
    validateEmailWithToken: jest.fn().mockResolvedValue(null),
    verifyEmail: jest.fn().mockResolvedValue(undefined),
  },
}))

export const mockEmailModel = () => {
  // EmailModel is already mocked at the top level
  // This function exists for consistency with other mock setup functions
}

/**
 * Export mock instance for use in test assertions
 */
export const emailModelMock = {
  clearAllDefaultByUserId: jest.fn(),
  createOrFindOneByUserId: jest.fn(),
  findAllByUserId: jest.fn(),
  findByEmail: jest.fn(),
  isEmailAvailable: jest.fn(),
  updateMessageInfo: jest.fn(),
  updateMessageInfoValidate: jest.fn(),
  validateEmail: jest.fn(),
  validateEmailWithToken: jest.fn(),
  verifyEmail: jest.fn(),
}
