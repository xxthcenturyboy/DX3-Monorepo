jest.mock('./notification-web.api', () => ({
  useMarkAllAsDismissedMutation: () => [
    jest.fn().mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) }),
    { error: undefined, isLoading: false, isUninitialized: true },
  ],
  useMarkAsDismissedMutation: () => [
    jest.fn().mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) }),
    { error: undefined, isLoading: false, isUninitialized: true },
  ],
}))

import { renderWithProviders } from '../../../testing-render'
import { NotificationsDesktop } from './notification-desktop.component'

describe('NotificationsDesktop', () => {
  it('should render without crashing when closed', () => {
    const { baseElement } = renderWithProviders(
      <NotificationsDesktop
        anchorElement={null}
        clickCloseMenu={jest.fn()}
      />,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render without crashing when open', () => {
    const anchorEl = document.createElement('button')
    const { baseElement } = renderWithProviders(
      <NotificationsDesktop
        anchorElement={anchorEl}
        clickCloseMenu={jest.fn()}
      />,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render with user notifications', () => {
    const { baseElement } = renderWithProviders(
      <NotificationsDesktop
        anchorElement={null}
        clickCloseMenu={jest.fn()}
      />,
      {
        preloadedState: {
          notification: {
            system: [],
            user: [
              {
                createdAt: new Date('2024-01-01'),
                id: 'n1',
                level: 'INFO',
                message: 'Test notification',
                title: 'Test',
                userId: 'u1',
                viewed: false,
              },
            ],
          },
        },
      },
    )
    expect(baseElement).toBeTruthy()
  })
})
