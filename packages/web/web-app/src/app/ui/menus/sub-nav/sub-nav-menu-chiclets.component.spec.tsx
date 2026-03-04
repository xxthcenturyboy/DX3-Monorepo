import { MemoryRouter } from 'react-router'

import { renderWithProviders } from '../../../../../testing-render'
import { SubNavChicletMenu } from './sub-nav-menu-chiclets.component'

const mockMenus = [
  { route: '/user/:id/overview', title: 'Overview' },
  { route: '/user/:id/settings', title: 'Settings' },
]

describe('SubNavChicletMenu', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(
      <MemoryRouter>
        <SubNavChicletMenu
          id="u1"
          menus={mockMenus}
        />
      </MemoryRouter>,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render all menu titles', () => {
    const { getByText } = renderWithProviders(
      <MemoryRouter>
        <SubNavChicletMenu
          id="u1"
          menus={mockMenus}
        />
      </MemoryRouter>,
    )
    expect(getByText('Overview')).toBeTruthy()
    expect(getByText('Settings')).toBeTruthy()
  })

  it('should render with empty menus', () => {
    const { baseElement } = renderWithProviders(
      <MemoryRouter>
        <SubNavChicletMenu
          id="u1"
          menus={[]}
        />
      </MemoryRouter>,
    )
    expect(baseElement).toBeTruthy()
  })
})
