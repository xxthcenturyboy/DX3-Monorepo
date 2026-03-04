jest.mock('./auth-web-otp.component', () => ({
  AuthWebOtpEntry: ({ onCompleteCallback }: { onCompleteCallback?: (value: string) => void }) => (
    <input
      data-testid="otp-entry-input"
      onChange={(e) =>
        e.target.value.length === 6 && onCompleteCallback && onCompleteCallback(e.target.value)
      }
      type="text"
    />
  ),
}))

import { renderWithProviders } from '../../../testing-render'
import { AuthWebRequestOtpEntry } from './auth-web-request-otp-entry.component'

describe('AuthWebRequestOtpEntry', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(
      <AuthWebRequestOtpEntry
        hasCallbackError={false}
        onClickStartOver={jest.fn()}
        onCompleteCallback={jest.fn()}
        selectedMethod="EMAIL"
      />,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render with PHONE method', () => {
    const { baseElement } = renderWithProviders(
      <AuthWebRequestOtpEntry
        hasCallbackError={false}
        onClickStartOver={jest.fn()}
        onCompleteCallback={jest.fn()}
        selectedMethod="PHONE"
      />,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render the OTP input', () => {
    const { getByTestId } = renderWithProviders(
      <AuthWebRequestOtpEntry
        hasCallbackError={false}
        onClickStartOver={jest.fn()}
        onCompleteCallback={jest.fn()}
        selectedMethod="EMAIL"
      />,
    )
    expect(getByTestId('otp-entry-input')).toBeTruthy()
  })

  it('should render the OTP input by default (start over button requires completed OTP)', () => {
    const { getByTestId } = renderWithProviders(
      <AuthWebRequestOtpEntry
        hasCallbackError={false}
        onClickStartOver={jest.fn()}
        onCompleteCallback={jest.fn()}
        selectedMethod="EMAIL"
      />,
    )
    expect(getByTestId('otp-entry-input')).toBeTruthy()
  })

  it('should render with hasCallbackError true before OTP entry', () => {
    const { baseElement } = renderWithProviders(
      <AuthWebRequestOtpEntry
        hasCallbackError={true}
        onClickStartOver={jest.fn()}
        onCompleteCallback={jest.fn()}
        selectedMethod="EMAIL"
      />,
    )
    expect(baseElement).toBeTruthy()
  })
})
