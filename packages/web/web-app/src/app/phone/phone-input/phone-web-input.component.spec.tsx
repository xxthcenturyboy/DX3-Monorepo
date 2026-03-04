jest.mock('react-phone-input-2', () => {
  const MockPhoneInput = ({
    onChange,
    value,
  }: {
    onChange?: (value: string) => void
    value?: string
  }) => (
    <input
      data-testid="phone-input"
      onChange={(e) => onChange?.(e.target.value)}
      type="tel"
      value={value || ''}
    />
  )
  MockPhoneInput.displayName = 'MockPhoneInput'
  return MockPhoneInput
})

import { renderWithProviders } from '../../../../testing-render'
import { PhoneNumberInput } from './phone-web-input.component'

const defaultProps = {
  defaultCountry: 'us',
  defaultValue: '',
  inputId: 'phone',
  onChange: jest.fn(),
  preferredCountries: ['us', 'ca'],
  required: false,
  value: '',
}

describe('PhoneNumberInput', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(<PhoneNumberInput {...defaultProps} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render the phone input field', () => {
    const { getByTestId } = renderWithProviders(<PhoneNumberInput {...defaultProps} />)
    expect(getByTestId('phone-input')).toBeTruthy()
  })

  it('should render with a default value', () => {
    const { getByTestId } = renderWithProviders(
      <PhoneNumberInput
        {...defaultProps}
        defaultValue="+1234567890"
        value="+1234567890"
      />,
    )
    expect(getByTestId('phone-input')).toBeTruthy()
  })

  it('should render in disabled state', () => {
    const { getByTestId } = renderWithProviders(
      <PhoneNumberInput
        {...defaultProps}
        disabled={true}
      />,
    )
    expect(getByTestId('phone-input')).toBeTruthy()
  })
})
