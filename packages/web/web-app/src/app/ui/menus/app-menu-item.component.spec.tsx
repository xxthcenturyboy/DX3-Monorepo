import { MemoryRouter } from 'react-router'

import { supportInitialState } from '../../support/store/support-web.reducer'
import { renderWithProviders } from '../../../../testing-render'
import { AppMenuItem } from './app-menu-item.component'

const mockMenuItem = {
  id: 'menu-item-test',
  routeKey: '/dashboard',
  title: 'Dashboard',
  type: 'ROUTE' as const,
}

describe('AppMenuItem', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(
      <MemoryRouter>
        <AppMenuItem
          isFirst={true}
          isSubItem={false}
          menuItem={mockMenuItem}
        />
      </MemoryRouter>,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render the menu item title', () => {
    const { getByText } = renderWithProviders(
      <MemoryRouter>
        <AppMenuItem
          isFirst={true}
          isSubItem={false}
          menuItem={mockMenuItem}
        />
      </MemoryRouter>,
    )
    expect(getByText('Dashboard')).toBeTruthy()
  })

  it('should render as a sub item', () => {
    const { baseElement } = renderWithProviders(
      <MemoryRouter>
        <AppMenuItem
          isFirst={false}
          isSubItem={true}
          menuItem={mockMenuItem}
        />
      </MemoryRouter>,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render with an icon', () => {
    const menuItemWithIcon = { ...mockMenuItem, icon: 'Home' }
    const { container } = renderWithProviders(
      <MemoryRouter>
        <AppMenuItem
          isFirst={true}
          isSubItem={false}
          menuItem={menuItemWithIcon}
        />
      </MemoryRouter>,
    )
    expect(container).toBeTruthy()
  })

  it('should render with badge when badge is set', () => {
    const menuItemWithBadge = { ...mockMenuItem, badge: true, badgeSelector: 'support' }
    const { baseElement } = renderWithProviders(
      <MemoryRouter>
        <AppMenuItem
          isFirst={true}
          isSubItem={false}
          menuItem={menuItemWithBadge}
        />
      </MemoryRouter>,
      {
        preloadedState: {
          support: {
            ...supportInitialState,
            unviewedCount: 5,
          },
        },
      },
    )
    expect(baseElement).toBeTruthy()
  })
})
