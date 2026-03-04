jest.mock('../../config/bootstrap/login-bootstrap', () => ({
  loginBootstrap: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('./app-menu-account.component', () => ({
  AccountMenu: () => <div data-testid="account-menu">Account Menu</div>,
}))

jest.mock('../../notifications/notifications.menu', () => ({
  NotificationsMenu: () => <div data-testid="notifications-menu">Notifications Menu</div>,
}))

import { authInitialState } from '../../auth/auth-web.reducer'
import { renderWithProviders } from '../../../../testing-render'
import { AppNavBar } from './app-nav-bar.menu'
import { MemoryRouter } from 'react-router'

describe('AppNavBar', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(
      <MemoryRouter>
        <AppNavBar />
      </MemoryRouter>,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render a navbar', () => {
    const { container } = renderWithProviders(
      <MemoryRouter>
        <AppNavBar />
      </MemoryRouter>,
    )
    expect(container.querySelector('.MuiAppBar-root')).toBeTruthy()
  })

  it('should render when user is authenticated', () => {
    const { baseElement } = renderWithProviders(
      <MemoryRouter>
        <AppNavBar />
      </MemoryRouter>,
      {
        preloadedState: {
          auth: {
            ...authInitialState,
            token: 'valid.jwt.token',
          },
        },
      },
    )
    expect(baseElement).toBeTruthy()
  })
})
