jest.mock('./auth-web.api', () => ({
  useOtpRequestEmailMutation: () => [
    jest.fn().mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) }),
    { error: undefined, isLoading: false },
  ],
  useOtpRequestPhoneMutation: () => [
    jest.fn().mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) }),
    { error: undefined, isLoading: false },
  ],
}))

jest.mock('../phone/phone-input/phone-web-input.component', () => ({
  PhoneNumberInput: () => <input data-testid="phone-input" type="tel" />,
}))

jest.mock('./auth-web-request-otp-entry.component', () => ({
  AuthWebRequestOtpEntry: () => <div data-testid="otp-entry">OTP Entry</div>,
}))

import { renderWithProviders } from '../../../testing-render'
import { AuthWebRequestOtpLoggedOut } from './auth-web-request-otp-logged-out.component'

describe('AuthWebRequestOtpLoggedOut', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(
      <AuthWebRequestOtpLoggedOut
        hasCallbackError={false}
        onCompleteCallback={jest.fn()}
      />,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render with callback error', () => {
    const { baseElement } = renderWithProviders(
      <AuthWebRequestOtpLoggedOut
        hasCallbackError={true}
        onCompleteCallback={jest.fn()}
      />,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render form inputs', () => {
    const { container } = renderWithProviders(
      <AuthWebRequestOtpLoggedOut
        hasCallbackError={false}
        onCompleteCallback={jest.fn()}
      />,
    )
    expect(container.querySelector('input, button')).toBeTruthy()
  })
})
