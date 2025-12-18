import { USER_ROLE } from '@dx3/models-shared'
import { MOCK_USERS, type MockUserDataType, TEST_EMAIL } from '@dx3/test-data'

/**
 * Mock for UserModel with comprehensive user, phone, and email mocking
 * Provides flexible mocking for user-related tests across the API
 *
 * @example Basic Usage in Tests
 * ```typescript
 * import { UserModel } from '../../user/user-api.postgres-model';
 * import { TEST_UUID } from '@dx3/test-data';
 *
 * jest.mock('../../user/user-api.postgres-model');
 *
 * describe('YourService', () => {
 *   beforeEach(() => {
 *     jest.clearAllMocks();
 *   });
 *
 *   test('should work with mock user', async () => {
 *     // Mock UserModel.findByPk directly
 *     UserModel.findByPk = jest.fn().mockResolvedValue({
 *       id: TEST_UUID,
 *       accountLocked: false,
 *       getDefaultEmailModel: jest.fn().mockResolvedValue({
 *         email: 'test@example.com',
 *         verified: true,
 *       }),
 *       getDefaultPhoneModel: jest.fn().mockResolvedValue({
 *         phone: '1234567890',
 *         countryCode: '1',
 *         regionCode: 'US',
 *       }),
 *     });
 *
 *     // Your test code here
 *   });
 * });
 * ```
 *
 * @example Using Helper Functions
 * ```typescript
 * import { addExtendedMockUser, MockUserModel } from '../testing/mocks';
 *
 * // Add a custom mock user
 * addExtendedMockUser('custom-user-id', {
 *   accountLocked: false,
 *   roles: [USER_ROLE.ADMIN],
 *   defaultEmail: { email: 'admin@test.com', verified: true },
 *   defaultPhone: { phone: '1234567890', countryCode: '1', regionCode: 'US' },
 * });
 *
 * // Use MockUserModel.findByPk to retrieve
 * const user = await MockUserModel.findByPk('custom-user-id');
 * ```
 */

/**
 * Mock UserModel class with all necessary methods
 */
export class MockUserModel {
  id: string
  accountLocked?: boolean
  roles?: string[];
  [key: string]: unknown

  constructor(data?: Partial<MockUserDataType>) {
    if (data) {
      Object.assign(this, data)
    }
  }

  static async userHasRole(id: string, role: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const user = MOCK_USERS[id]
      if (!user) {
        return reject('no user with this id')
      }

      return resolve((user.roles || []).includes(role))
    })
  }

  static async findByPk(id: string, _options?: unknown): Promise<MockUserModel | null> {
    const userData = MOCK_USERS[id]
    if (userData) {
      const instance = new MockUserModel(userData)
      return instance
    }
    return null
  }

  static async findOne(_options?: unknown): Promise<MockUserModel | null> {
    // Can be customized based on options if needed
    return null
  }

  static async create(
    values?: Partial<MockUserDataType>,
    _options?: unknown,
  ): Promise<MockUserModel> {
    const instance = new MockUserModel(values)
    return instance
  }

  static async loginWithPassword(email: string, _password: string): Promise<MockUserModel | null> {
    if (email === TEST_EMAIL || email.includes('existing')) {
      throw new Error('User not found!')
    }
    return null
  }

  static async loginWithUsernamePassword(
    username: string,
    _password: string,
  ): Promise<MockUserModel | null> {
    if (username === 'existing-user') {
      const instance = new MockUserModel()
      instance.id = 'existing-user-id'
      return instance
    }
    // Mock logic: for any username/password, throw "User not found!"
    throw new Error('User not found!')
  }

  static async getBiomAuthKey(userId: string): Promise<string | null> {
    if (MOCK_USERS[userId]) {
      const authKey = MOCK_USERS[userId].biomAuthKey
      return authKey || null
    }

    return null
  }

  static async getByRefreshToken(refreshToken: string): Promise<MockUserModel | null> {
    if (refreshToken === 'valid-token') {
      const instance = new MockUserModel()
      instance.id = 'user-id'
      instance.refreshTokens = ['valid-token']
      return instance
    }
    return null
  }

  static async updateRefreshToken(_userId: string, _refreshTokens: string[]): Promise<boolean> {
    // Mock logic: always return true for successful update
    return true
  }

  static async clearRefreshTokens(_userId: string): Promise<void> {
    // Default implementation - can be overridden in tests
    return
  }

  async getDefaultEmailModel(): Promise<{ email: string; verified?: boolean } | null> {
    const userData = MOCK_USERS[this.id]
    return userData?.defaultEmail || null
  }

  async getDefaultPhoneModel(): Promise<{
    phone: string
    countryCode: string
    regionCode?: string
    verified?: boolean
  } | null> {
    const userData = MOCK_USERS[this.id]
    return userData?.defaultPhone || null
  }

  async save(): Promise<this> {
    return this
  }

  async destroy(): Promise<void> {
    return
  }

  async update(values: Partial<MockUserDataType>): Promise<this> {
    Object.assign(this, values)
    return this
  }
}

/**
 * Setup function to mock UserModel globally
 * Call this in your test setup to enable UserModel mocking
 */
export const mockUserModel = () => {
  jest.mock('./user-api.postgres-model', () => ({
    USER_ROLE,
    UserModel: MockUserModel,
  }))
}

/**
 * Create a mock user instance with custom data
 * Useful for tests that need specific user configurations
 *
 * @example
 * import { createMockUserInstance } from '../testing/mocks';
 * const mockUser = createMockUserInstance({
 *   id: 'custom-user',
 *   accountLocked: false,
 *   defaultEmail: { email: 'custom@test.com' }
 * });
 */
export const createMockUserInstance = (data: MockUserDataType): MockUserModel => {
  return new MockUserModel(data)
}
