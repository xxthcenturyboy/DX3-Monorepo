jest.mock('./auth-web.api', () => ({
  useOtpRequestIdMutation: () => [
    jest.fn().mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) }),
    { data: undefined, error: undefined, isLoading: false, isUninitialized: true },
  ],
}))

jest.mock('./auth-web-request-otp-entry.component', () => ({
  AuthWebRequestOtpEntry: () => <div data-testid="otp-entry">OTP Entry</div>,
}))

import { userProfileInitialState } from '../user/profile/user-profile-web.reducer'
import { renderWithProviders } from '../../../testing-render'
import { AuthWebRequestOtpLoggedIn } from './auth-web-request-otp-logged-in.component'

describe('AuthWebRequestOtpLoggedIn', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(
      <AuthWebRequestOtpLoggedIn
        hasCallbackError={false}
        onCompleteCallback={jest.fn()}
      />,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render with a verified email contact', () => {
    const { baseElement } = renderWithProviders(
      <AuthWebRequestOtpLoggedIn
        hasCallbackError={false}
        onCompleteCallback={jest.fn()}
      />,
      {
        preloadedState: {
          userProfile: {
            ...userProfileInitialState,
            emails: [{ default: true, email: 'test@example.com', id: 'e1', isDeleted: false, isVerified: true, label: '' }],
            id: 'u1',
            phones: [],
          },
        },
      },
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render with callback error', () => {
    const { baseElement } = renderWithProviders(
      <AuthWebRequestOtpLoggedIn
        hasCallbackError={true}
        onCompleteCallback={jest.fn()}
      />,
    )
    expect(baseElement).toBeTruthy()
  })
})
