/**
 * Mock for user-profile-api
 * Provides mocks for user profile state functions
 */

// Mock user profile state function
const mockGetUserProfileState = jest.fn().mockImplementation((user, _isAuthenticated) => ({
  emails: [],
  fullName: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : '',
  hasSecuredAccount: true,
  id: user.id,
  isAdmin: false,
  isSuperAdmin: false,
  optInBeta: false,
  phones: [],
  restrictions: [],
  roles: user.roles || [],
  username: user.username || '',
}))

// Mock user profile functions
jest.mock('./user-profile-api', () => ({
  getUserProfileState: mockGetUserProfileState,
}))

export const mockUserProfileApi = () => {
  // User profile API is already mocked at the top level
  // This function exists for consistency with other mock setup functions
}
