jest.mock('./notification-web.api', () => ({
  useSendNotificationToAllMutation: () => [
    jest.fn().mockReturnValue({ unwrap: jest.fn().mockResolvedValue({ sent: true }) }),
    { data: undefined, error: undefined, isLoading: false, isUninitialized: true },
  ],
  useSendNotificationToUserMutation: () => [
    jest.fn().mockReturnValue({ unwrap: jest.fn().mockResolvedValue({ sent: true }) }),
    { data: undefined, error: undefined, isLoading: false, isUninitialized: true },
  ],
}))

import { renderWithProviders } from '../../../testing-render'
import { NotificationSendDialog } from './notification-web-send.dialog'

const mockUser = {
  createdAt: '2024-01-01',
  email: 'test@example.com',
  emails: [],
  firstName: 'Test',
  id: 'u1',
  lastName: 'User',
  phones: [],
  roles: ['USER'],
  username: 'testuser',
}

describe('NotificationSendDialog', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(
      <NotificationSendDialog
        closeDialog={jest.fn()}
        user={mockUser as never}
      />,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render a send button', () => {
    const { container } = renderWithProviders(
      <NotificationSendDialog
        closeDialog={jest.fn()}
        user={mockUser as never}
      />,
    )
    expect(container.querySelector('button')).toBeTruthy()
  })

  it('should render without a user (broadcast)', () => {
    const { baseElement } = renderWithProviders(
      <NotificationSendDialog
        closeDialog={jest.fn()}
        user={undefined}
      />,
    )
    expect(baseElement).toBeTruthy()
  })
})
