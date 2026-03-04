import { MemoryRouter } from 'react-router'

import { renderWithProviders } from '../../../../../testing-render'
import { SubNavMenu } from './sub-nav-menu.component'

const mockMenus = [
  {
    route: '/user/:id/details',
    segment: 'details',
    title: 'Details',
  },
  {
    route: '/user/:id/permissions',
    segment: 'permissions',
    title: 'Permissions',
  },
]

describe('SubNavMenu', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(
      <MemoryRouter>
        <SubNavMenu
          id="u1"
          menus={mockMenus}
        />
      </MemoryRouter>,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render all menu items', () => {
    const { getByText } = renderWithProviders(
      <MemoryRouter>
        <SubNavMenu
          id="u1"
          menus={mockMenus}
        />
      </MemoryRouter>,
    )
    expect(getByText('Details')).toBeTruthy()
    expect(getByText('Permissions')).toBeTruthy()
  })

  it('should render empty menus array', () => {
    const { baseElement } = renderWithProviders(
      <MemoryRouter>
        <SubNavMenu
          id="u1"
          menus={[]}
        />
      </MemoryRouter>,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render with scrollBreak prop', () => {
    const { baseElement } = renderWithProviders(
      <MemoryRouter>
        <SubNavMenu
          id="u1"
          menus={mockMenus}
          scrollBreak="md"
        />
      </MemoryRouter>,
    )
    expect(baseElement).toBeTruthy()
  })
})
