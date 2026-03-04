jest.mock('mui-one-time-password-input', () => ({
  MuiOtpInput: ({
    onChange,
    value,
  }: {
    onChange?: (value: string) => void
    value?: string
  }) => (
    <input
      data-testid="otp-input"
      onChange={(e) => onChange && onChange(e.target.value)}
      type="text"
      value={value || ''}
    />
  ),
}))

import { renderWithProviders } from '../../../testing-render'
import { AuthWebOtpEntry } from './auth-web-otp.component'

describe('AuthWebOtpEntry', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(
      <AuthWebOtpEntry
        method="EMAIL"
        onCompleteCallback={jest.fn()}
      />,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render with PHONE method', () => {
    const { baseElement } = renderWithProviders(
      <AuthWebOtpEntry
        method="PHONE"
        onCompleteCallback={jest.fn()}
      />,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render with empty method', () => {
    const { baseElement } = renderWithProviders(
      <AuthWebOtpEntry
        method=""
        onCompleteCallback={jest.fn()}
      />,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render the OTP input', () => {
    const { getByTestId } = renderWithProviders(
      <AuthWebOtpEntry
        method="EMAIL"
        onCompleteCallback={jest.fn()}
      />,
    )
    expect(getByTestId('otp-input')).toBeTruthy()
  })
})
