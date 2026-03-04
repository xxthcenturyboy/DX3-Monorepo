jest.mock('./phone-web.api', () => ({
  useDeletePhoneProfileMutation: () => [
    jest.fn().mockReturnValue({ unwrap: jest.fn().mockResolvedValue({ deleted: true }) }),
    { data: undefined, error: undefined, isLoading: false, isUninitialized: true },
  ],
}))

import { renderWithProviders } from '../../../testing-render'
import { DeletePhoneDialog } from './phone-web-delete.dialog'

const mockPhone = {
  countryCode: '+1',
  default: false,
  id: 'p1',
  isDeleted: false,
  isSent: false,
  isVerified: true,
  label: '',
  phone: '+1234567890',
}

describe('DeletePhoneDialog', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(
      <DeletePhoneDialog
        closeDialog={jest.fn()}
        phoneDataCallback={jest.fn()}
        phoneItem={mockPhone}
      />,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render action buttons', () => {
    const { container } = renderWithProviders(
      <DeletePhoneDialog
        closeDialog={jest.fn()}
        phoneDataCallback={jest.fn()}
        phoneItem={mockPhone}
      />,
    )
    expect(container.querySelector('button')).toBeTruthy()
  })

  it('should render without phone item', () => {
    const { baseElement } = renderWithProviders(
      <DeletePhoneDialog
        closeDialog={jest.fn()}
        phoneDataCallback={jest.fn()}
      />,
    )
    expect(baseElement).toBeTruthy()
  })
})
