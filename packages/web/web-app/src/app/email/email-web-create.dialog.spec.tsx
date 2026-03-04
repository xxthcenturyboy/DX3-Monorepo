jest.mock('../auth/auth-web.api', () => ({
  useOtpRequestEmailMutation: () => [
    jest.fn().mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) }),
    { data: undefined, error: undefined, isLoading: false, isUninitialized: true, reset: jest.fn() },
  ],
}))

jest.mock('./email-web.api', () => ({
  useAddEmailMutation: () => [
    jest.fn().mockReturnValue({ unwrap: jest.fn().mockResolvedValue({ id: 'e1' }) }),
    { data: undefined, error: undefined, isLoading: false, isUninitialized: true, reset: jest.fn() },
  ],
  useCheckEmailAvailabilityMutation: () => [
    jest.fn().mockReturnValue({ unwrap: jest.fn().mockResolvedValue({ available: true }) }),
    { data: undefined, error: undefined, isLoading: false, isUninitialized: true, reset: jest.fn() },
  ],
}))

import { renderWithProviders } from '../../../testing-render'
import { AddEmailDialog } from './email-web-create.dialog'

describe('AddEmailDialog', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(
      <AddEmailDialog
        closeDialog={jest.fn()}
        emailDataCallback={jest.fn()}
        userId="u1"
      />,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render email input form', () => {
    const { container } = renderWithProviders(
      <AddEmailDialog
        closeDialog={jest.fn()}
        emailDataCallback={jest.fn()}
        userId="u1"
      />,
    )
    expect(container.querySelector('input') || container.querySelector('button')).toBeTruthy()
  })
})
