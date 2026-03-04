jest.mock('./auth-web-request-otp-logged-in.component', () => ({
  AuthWebRequestOtpLoggedIn: () => <div data-testid="otp-logged-in">OTP Logged In</div>,
}))

jest.mock('./auth-web-request-otp-logged-out.component', () => ({
  AuthWebRequestOtpLoggedOut: () => <div data-testid="otp-logged-out">OTP Logged Out</div>,
}))

import { authInitialState } from './auth-web.reducer'
import { userProfileInitialState } from '../user/profile/user-profile-web.reducer'
import { renderWithProviders } from '../../../testing-render'
import { AuthWebRequestOtp } from './auth-web-request-otp.component'

describe('AuthWebRequestOtp', () => {
  it('should render the logged-out version when user profile is not valid', () => {
    const { getByTestId } = renderWithProviders(
      <AuthWebRequestOtp
        hasCallbackError={false}
        onCompleteCallback={jest.fn()}
      />,
    )
    expect(getByTestId('otp-logged-out')).toBeTruthy()
  })

  it('should render the logged-in version when user profile is valid', () => {
    const { getByTestId } = renderWithProviders(
      <AuthWebRequestOtp
        hasCallbackError={false}
        onCompleteCallback={jest.fn()}
      />,
      {
        preloadedState: {
          auth: {
            ...authInitialState,
            token: 'valid.jwt.token',
          },
          userProfile: {
            ...userProfileInitialState,
            emails: [{ default: true, email: 'test@example.com', id: 'e1', isDeleted: false, isVerified: true, label: '' }],
            id: 'u1',
          },
        },
      },
    )
    expect(getByTestId('otp-logged-in')).toBeTruthy()
  })

  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(
      <AuthWebRequestOtp
        hasCallbackError={false}
        onCompleteCallback={jest.fn()}
      />,
    )
    expect(baseElement).toBeTruthy()
  })
})
