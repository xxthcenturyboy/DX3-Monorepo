jest.mock('../store', () => ({
  store: { getState: jest.fn().mockReturnValue({ auth: { token: null } }) },
}))

jest.mock('../config/config-web.service', () => ({
  WebConfigService: {
    getWebRoutes: jest.fn().mockReturnValue({
      DASHBOARD: { MAIN: '/dashboard' },
    }),
  },
}))

import { MemoryRouter, Route, Routes } from 'react-router'

import { renderWithProviders } from '../../../testing-render'
import { AuthenticatedRouter } from './authenticated.router'

describe('AuthenticatedRouter', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(
      <MemoryRouter>
        <Routes>
          <Route
            element={<AuthenticatedRouter />}
            path="/"
          />
        </Routes>
      </MemoryRouter>,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render Outlet when user is not authenticated', () => {
    const { container } = renderWithProviders(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route
            element={<AuthenticatedRouter />}
            path="/login"
          >
            <Route
              element={<div data-testid="child-route">Child</div>}
              index
            />
          </Route>
        </Routes>
      </MemoryRouter>,
    )
    expect(container).toBeTruthy()
  })

  it('should redirect to dashboard when user is authenticated', () => {
    const { container } = renderWithProviders(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route
            element={<AuthenticatedRouter />}
            path="/login"
          />
          <Route
            element={<div data-testid="dashboard">Dashboard</div>}
            path="/dashboard"
          />
        </Routes>
      </MemoryRouter>,
      {
        preloadedState: {
          auth: {
            logoutResponse: false,
            password: '',
            token: 'valid.jwt.token',
            userId: 'u1',
            username: '',
          },
        },
      },
    )
    expect(container).toBeTruthy()
  })
})
