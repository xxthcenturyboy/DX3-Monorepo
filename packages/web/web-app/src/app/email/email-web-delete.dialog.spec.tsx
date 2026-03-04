jest.mock('./email-web.api', () => ({
  useDeleteEmailProfileMutation: () => [
    jest.fn().mockReturnValue({ unwrap: jest.fn().mockResolvedValue({ deleted: true }) }),
    { data: undefined, error: undefined, isLoading: false, isUninitialized: true },
  ],
}))

import { renderWithProviders } from '../../../testing-render'
import { DeleteEmailDialog } from './email-web-delete.dialog'

describe('DeleteEmailDialog', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(
      <DeleteEmailDialog
        closeDialog={jest.fn()}
        emailDataCallback={jest.fn()}
        emailItem={{ default: false, email: 'test@example.com', id: 'e1', isDeleted: false, isVerified: true, label: '' }}
      />,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render action buttons', () => {
    const { container } = renderWithProviders(
      <DeleteEmailDialog
        closeDialog={jest.fn()}
        emailDataCallback={jest.fn()}
        emailItem={{ default: false, email: 'test@example.com', id: 'e1', isDeleted: false, isVerified: true, label: '' }}
      />,
    )
    expect(container.querySelector('button')).toBeTruthy()
  })

  it('should render without email item', () => {
    const { baseElement } = renderWithProviders(
      <DeleteEmailDialog
        closeDialog={jest.fn()}
        emailDataCallback={jest.fn()}
      />,
    )
    expect(baseElement).toBeTruthy()
  })
})
