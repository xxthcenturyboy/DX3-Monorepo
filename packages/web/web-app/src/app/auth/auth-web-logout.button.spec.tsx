jest.mock('./auth-web.api', () => ({
  useLogoutMutation: () => [
    jest.fn().mockReturnValue({ unwrap: jest.fn().mockResolvedValue({ loggedOut: true }) }),
  ],
}))

jest.mock('../admin-logs/admin-logs-web.sockets', () => ({
  AdminLogsWebSockets: { instance: null },
}))

jest.mock('../feature-flags/feature-flag-web.sockets', () => ({
  FeatureFlagWebSockets: { instance: null },
}))

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: () => jest.fn(),
}))

import { MemoryRouter } from 'react-router'

import { renderWithProviders } from '../../../testing-render'
import { LogoutButton } from './auth-web-logout.button'

describe('LogoutButton', () => {
  it('should render in APP_BAR context', () => {
    const { baseElement } = renderWithProviders(
      <MemoryRouter>
        <LogoutButton context="APP_BAR" />
      </MemoryRouter>,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render in APP_MENU context', () => {
    const { baseElement } = renderWithProviders(
      <MemoryRouter>
        <LogoutButton context="APP_MENU" />
      </MemoryRouter>,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render a log out button', () => {
    const { container } = renderWithProviders(
      <MemoryRouter>
        <LogoutButton context="APP_MENU" />
      </MemoryRouter>,
    )
    expect(container.querySelector('button')).toBeTruthy()
  })
})
