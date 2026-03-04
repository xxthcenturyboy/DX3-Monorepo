jest.mock('../../auth/auth-web-logout.button', () => ({
  LogoutButton: ({ context }: { context: string }) => (
    <button type="button">{`Logout-${context}`}</button>
  ),
}))

jest.mock('../../user/profile/user-profile-web-avatar.component', () => ({
  UserProfileAvatar: () => <div data-testid="user-avatar">Avatar</div>,
}))

import { MemoryRouter } from 'react-router'

import { renderWithProviders } from '../../../../testing-render'
import { AccountMenu } from './app-menu-account.component'

describe('AccountMenu', () => {
  it('should render without crashing when closed', () => {
    const { baseElement } = renderWithProviders(
      <MemoryRouter>
        <AccountMenu
          anchorElement={null}
          clickCloseMenu={jest.fn()}
        />
      </MemoryRouter>,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render when open', () => {
    const anchor = document.createElement('button')
    const { baseElement } = renderWithProviders(
      <MemoryRouter>
        <AccountMenu
          anchorElement={anchor}
          clickCloseMenu={jest.fn()}
        />
      </MemoryRouter>,
    )
    expect(baseElement).toBeTruthy()
  })
})
