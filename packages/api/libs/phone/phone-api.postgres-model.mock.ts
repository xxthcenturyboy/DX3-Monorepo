import { TEST_PHONE_1, TEST_PHONE_COUNTRY_CODE } from '@dx3/test-data'

/**
 * Mock for PhoneModel
 * Provides database model mocks for phone-related tests
 */

// Top-level mock - Jest hoists this automatically
jest.mock('./phone-api.postgres-model', () => ({
  PhoneModel: {
    clearAllDefaultByUserId: jest.fn().mockResolvedValue(undefined),
    createOrFindOneByUserId: jest.fn(),
    findAllByUserId: jest.fn().mockResolvedValue([]),
    findByPhoneAndCode: jest.fn().mockImplementation((phone: string, countryCode: string) => {
      if (phone === TEST_PHONE_1 && countryCode === TEST_PHONE_COUNTRY_CODE) {
        return Promise.resolve({
          countryCode: TEST_PHONE_COUNTRY_CODE,
          createdAt: new Date(),
          default: true,
          id: 'existing-phone-id',
          phone: TEST_PHONE_1,
          regionCode: 'US',
          updatedAt: new Date(),
          userId: 'existing-user-id',
          verifiedAt: new Date(),
        })
      }
      return Promise.resolve(null)
    }),
    isPhoneAvailable: jest.fn().mockImplementation((phone: string, countryCode: string) => {
      // Mock logic: existing phone is not available, others are available
      return Promise.resolve(!(phone === TEST_PHONE_1 && countryCode === TEST_PHONE_COUNTRY_CODE))
    }),
  },
}))

export const mockPhoneModel = () => {
  // PhoneModel is already mocked at the top level
  // This function exists for consistency with other mock setup functions
}

/**
 * Export mock instance for use in test assertions
 */
export const phoneModelMock = {
  clearAllDefaultByUserId: jest.fn(),
  createOrFindOneByUserId: jest.fn(),
  findAllByUserId: jest.fn(),
  findByPhoneAndCode: jest.fn(),
  isPhoneAvailable: jest.fn(),
}
