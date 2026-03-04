import { BrowserRouter } from 'react-router'

import { renderWithProviders } from '../../testing-render'
import { Root } from './root-web.component'

jest.mock('./data/rtk-query')

jest.mock('./user/profile/user-profile-web.api', () => ({
  useLazyGetProfileQuery: () => [jest.fn(), { data: undefined, isSuccess: false }],
}))

jest.mock('./config/bootstrap/app-bootstrap', () => ({
  appBootstrap: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('./ui/menus/app-nav-bar.menu', () => ({
  AppNavBar: () => <nav data-testid="app-nav-bar" />,
}))

jest.mock('./ui/menus/menu-nav', () => ({
  MenuNav: () => <div data-testid="menu-nav" />,
}))

describe('Root', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <BrowserRouter>
        <Root />
      </BrowserRouter>,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render the AppNavBar component', () => {
    const { getByTestId } = renderWithProviders(
      <BrowserRouter>
        <Root />
      </BrowserRouter>,
    )
    expect(getByTestId('app-nav-bar')).toBeTruthy()
  })

  it('should render without MenuNav when not authenticated', () => {
    const { queryByTestId } = renderWithProviders(
      <BrowserRouter>
        <Root />
      </BrowserRouter>,
      {
        preloadedState: {
          auth: {
            logoutResponse: false,
            password: '',
            token: null,
            userId: null,
            username: '',
          },
        },
      },
    )
    expect(queryByTestId('menu-nav')).toBeNull()
  })
})
