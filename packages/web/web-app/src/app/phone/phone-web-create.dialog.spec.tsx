jest.mock('../auth/auth-web.api', () => ({
  useOtpRequestPhoneMutation: () => [
    jest.fn().mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) }),
    {
      data: undefined,
      error: undefined,
      isLoading: false,
      isUninitialized: true,
      reset: jest.fn(),
    },
  ],
}))

jest.mock('./phone-web.api', () => ({
  useAddPhoneMutation: () => [
    jest.fn().mockReturnValue({ unwrap: jest.fn().mockResolvedValue({ id: 'p1' }) }),
    {
      data: undefined,
      error: undefined,
      isLoading: false,
      isUninitialized: true,
      reset: jest.fn(),
    },
  ],
  useCheckPhoneAvailabilityMutation: () => [
    jest.fn().mockReturnValue({ unwrap: jest.fn().mockResolvedValue({ available: true }) }),
    {
      data: undefined,
      error: undefined,
      isLoading: false,
      isUninitialized: true,
      reset: jest.fn(),
    },
  ],
}))

jest.mock('./phone-input/phone-web-input.component', () => ({
  PhoneNumberInput: () => (
    <input
      data-testid="phone-input"
      type="tel"
    />
  ),
}))

import { renderWithProviders } from '../../../testing-render'
import { AddPhoneDialog } from './phone-web-create.dialog'

describe('AddPhoneDialog', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(
      <AddPhoneDialog
        closeDialog={jest.fn()}
        phoneDataCallback={jest.fn()}
        userId="u1"
      />,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render form controls', () => {
    const { container } = renderWithProviders(
      <AddPhoneDialog
        closeDialog={jest.fn()}
        phoneDataCallback={jest.fn()}
        userId="u1"
      />,
    )
    expect(container.querySelector('input, button')).toBeTruthy()
  })
})
