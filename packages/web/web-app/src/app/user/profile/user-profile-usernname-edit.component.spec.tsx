jest.mock('./user-profile-web.api', () => ({
  useLazyGetUsernameAvailabilityQuery: () => [
    jest.fn().mockReturnValue(Promise.resolve()),
    { data: undefined, error: undefined, isFetching: false, isUninitialized: true },
  ],
  useUpdateUsernameMutation: () => [
    jest.fn().mockReturnValue({ unwrap: jest.fn().mockResolvedValue({ id: 'u1' }) }),
    { data: undefined, error: undefined, isLoading: false, isUninitialized: true },
  ],
}))

jest.mock('../../auth/auth-web-request-otp.component', () => ({
  AuthWebRequestOtp: () => <div data-testid="otp-component">OTP</div>,
}))

import { userProfileInitialState } from './user-profile-web.reducer'
import { renderWithProviders } from '../../../../testing-render'
import { UserProfileEditUsername } from './user-profile-usernname-edit.component'

describe('UserProfileEditUsername', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(<UserProfileEditUsername />)
    expect(baseElement).toBeTruthy()
  })

  it('should render with existing username', () => {
    const { container } = renderWithProviders(<UserProfileEditUsername />, {
      preloadedState: {
        userProfile: {
          ...userProfileInitialState,
          id: 'u1',
          username: 'existinguser',
        },
      },
    })
    expect(container).toBeTruthy()
  })

  it('should render an edit icon button', () => {
    const { container } = renderWithProviders(<UserProfileEditUsername />)
    expect(container.querySelector('button')).toBeTruthy()
  })
})
