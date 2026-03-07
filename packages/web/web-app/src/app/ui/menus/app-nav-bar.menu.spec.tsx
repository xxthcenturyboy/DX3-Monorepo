jest.mock('../../config/bootstrap/login-bootstrap', () => ({
  loginBootstrap: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('./app-menu-account.component', () => ({
  AccountMenu: () => <div data-testid="account-menu">Account Menu</div>,
}))

jest.mock('../../notifications/notifications.menu', () => ({
  NotificationsMenu: () => <div data-testid="notifications-menu">Notifications Menu</div>,
}))

jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn().mockReturnValue({ _id: 'u1' }),
}))

import { act } from '@testing-library/react'
import { MemoryRouter } from 'react-router'

import { renderWithProviders } from '../../../../testing-render'
import { authInitialState } from '../../auth/auth-web.reducer'
import { loginBootstrap } from '../../config/bootstrap/login-bootstrap'
import { AppNavBar } from './app-nav-bar.menu'

const mockLoginBootstrap = loginBootstrap as jest.Mock

describe('AppNavBar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

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

  describe('loginBootstrap lifecycle', () => {
    it('should call loginBootstrap when user becomes authenticated', () => {
      const { store } = renderWithProviders(
        <MemoryRouter>
          <AppNavBar />
        </MemoryRouter>,
        {
          preloadedState: {
            auth: { ...authInitialState, token: 'valid.jwt.token' },
            userProfile: { id: 'u1', role: [] } as never,
          },
        },
      )
      expect(mockLoginBootstrap).toHaveBeenCalledTimes(1)
      expect(store).toBeDefined()
    })

    it('should reset didCallBootstrap when user logs out so subsequent logins re-trigger bootstrap', async () => {
      const preloadedAuthenticated = {
        auth: { ...authInitialState, token: 'valid.jwt.token' },
        userProfile: { id: 'u1', role: [] } as never,
      }

      const { store } = renderWithProviders(
        <MemoryRouter>
          <AppNavBar />
        </MemoryRouter>,
        { preloadedState: preloadedAuthenticated },
      )

      // First login — bootstrap called once
      expect(mockLoginBootstrap).toHaveBeenCalledTimes(1)

      // Simulate logout by clearing the auth token
      await act(async () => {
        store.dispatch({ payload: undefined, type: 'auth/tokenRemoved' })
      })

      // Simulate re-login by dispatching token again
      await act(async () => {
        store.dispatch({ payload: 'new.jwt.token', type: 'auth/tokenAdded' })
      })

      // Bootstrap must be called again after re-login
      expect(mockLoginBootstrap).toHaveBeenCalledTimes(2)
    })
  })
})

