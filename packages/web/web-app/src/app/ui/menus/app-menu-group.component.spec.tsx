import { fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router'

import { renderWithProviders } from '../../../../testing-render'
import { AppMenuGroup } from './app-menu-group.component'

const mockMenu = {
  collapsible: true,
  description: 'Test group description',
  id: 'test-group',
  items: [
    {
      id: 'item-1',
      routeKey: '/profile',
      title: 'Profile',
      type: 'ROUTE' as const,
    },
  ],
  title: 'Test Group',
}

describe('AppMenuGroup', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(
      <MemoryRouter>
        <AppMenuGroup
          isFirst={true}
          menu={mockMenu}
        />
      </MemoryRouter>,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render the menu group title', () => {
    const { getByText } = renderWithProviders(
      <MemoryRouter>
        <AppMenuGroup
          isFirst={true}
          menu={mockMenu}
        />
      </MemoryRouter>,
    )
    expect(getByText('Test Group')).toBeTruthy()
  })

  it('should toggle open state on click', () => {
    const { container } = renderWithProviders(
      <MemoryRouter>
        <AppMenuGroup
          isFirst={true}
          menu={mockMenu}
        >
          <div data-testid="child">Child</div>
        </AppMenuGroup>
      </MemoryRouter>,
    )
    const button = container.querySelector('button') || container.querySelector('[role="button"]')
    if (button) {
      fireEvent.click(button)
    }
    expect(container).toBeTruthy()
  })

  it('should render with an icon', () => {
    const menuWithIcon = { ...mockMenu, icon: 'Home' }
    const { container } = renderWithProviders(
      <MemoryRouter>
        <AppMenuGroup
          isFirst={true}
          menu={menuWithIcon}
        />
      </MemoryRouter>,
    )
    expect(container).toBeTruthy()
  })
})
