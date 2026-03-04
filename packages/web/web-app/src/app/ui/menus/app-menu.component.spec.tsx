jest.mock('../../auth/auth-web-logout.button', () => ({
  LogoutButton: () => <button type="button">Logout</button>,
}))

import { MemoryRouter } from 'react-router'

import { renderWithProviders } from '../../../../testing-render'
import { AppMenu } from './app-menu.component'

describe('AppMenu', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(
      <MemoryRouter>
        <AppMenu />
      </MemoryRouter>,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render in mobile break mode', () => {
    const { baseElement } = renderWithProviders(
      <MemoryRouter>
        <AppMenu mobileBreak={true} />
      </MemoryRouter>,
    )
    expect(baseElement).toBeTruthy()
  })
})
