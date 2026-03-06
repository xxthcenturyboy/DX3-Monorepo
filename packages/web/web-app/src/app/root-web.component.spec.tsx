import { BrowserRouter, MemoryRouter } from 'react-router'

import { renderWithProviders } from '../../testing-render'
import { Root } from './root-web.component'

jest.mock('./data/rtk-query')

// Expose the mock so individual tests can assert call counts.
const mockFetchProfile = jest.fn()

jest.mock('./user/profile/user-profile-web.api', () => ({
  useLazyGetProfileQuery: () => [mockFetchProfile, { data: undefined, isSuccess: false }],
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
  beforeEach(() => {
    mockFetchProfile.mockClear()
  })

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

  it('should not call fetchProfile when on a blog detail page (public sub-path)', () => {
    // /blog/my-post must be treated as a no-redirect route so that unauthenticated
    // visitors are never accidentally re-authenticated or redirected to Dashboard.
    renderWithProviders(
      <MemoryRouter initialEntries={['/blog/my-post']}>
        <Root />
      </MemoryRouter>,
    )
    expect(mockFetchProfile).not.toHaveBeenCalled()
  })

  it('should not call fetchProfile when on the blog list page', () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/blog']}>
        <Root />
      </MemoryRouter>,
    )
    expect(mockFetchProfile).not.toHaveBeenCalled()
  })
})
