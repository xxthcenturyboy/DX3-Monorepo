jest.mock('./notification-desktop.component', () => ({
  NotificationsDesktop: () => <div data-testid="notifications-desktop">Desktop</div>,
}))

jest.mock('./notification-mobile.component', () => ({
  NotificationsMobile: () => <div data-testid="notifications-mobile">Mobile</div>,
}))

import { renderWithProviders } from '../../../testing-render'
import { uiInitialState } from '../ui/store/ui-web.reducer'
import { NotificationsMenu } from './notifications.menu'

describe('NotificationsMenu', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(
      <NotificationsMenu
        anchorElement={null}
        clickCloseMenu={jest.fn()}
      />,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render the desktop notifications menu when window is wide', () => {
    const { getByTestId } = renderWithProviders(
      <NotificationsMenu
        anchorElement={null}
        clickCloseMenu={jest.fn()}
      />,
      {
        preloadedState: {
          ui: { ...uiInitialState, windowWidth: 1920 },
        },
      },
    )
    expect(getByTestId('notifications-desktop')).toBeTruthy()
  })

  it('should render the mobile menu when window is narrow', () => {
    const { getByTestId } = renderWithProviders(
      <NotificationsMenu
        anchorElement={null}
        clickCloseMenu={jest.fn()}
      />,
      {
        preloadedState: {
          ui: { ...uiInitialState, windowWidth: 400 },
        },
      },
    )
    expect(getByTestId('notifications-mobile')).toBeTruthy()
  })
})
