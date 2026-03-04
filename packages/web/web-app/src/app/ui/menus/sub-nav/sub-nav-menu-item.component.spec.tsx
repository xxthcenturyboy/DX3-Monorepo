import { MemoryRouter } from 'react-router'

import { renderWithProviders } from '../../../../../testing-render'
import { SubNavMenuItem } from './sub-nav-menu-item.component'

const mockMenuItem = {
  route: '/user/:id/details',
  segment: 'details',
  title: 'Details',
}

describe('SubNavMenuItem', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(
      <MemoryRouter>
        <SubNavMenuItem
          id="u1"
          menuItem={mockMenuItem}
        />
      </MemoryRouter>,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render the menu item title', () => {
    const { getByText } = renderWithProviders(
      <MemoryRouter>
        <SubNavMenuItem
          id="u1"
          menuItem={mockMenuItem}
        />
      </MemoryRouter>,
    )
    expect(getByText('Details')).toBeTruthy()
  })

  it('should render as selected when path matches', () => {
    const { container } = renderWithProviders(
      <MemoryRouter initialEntries={['/user/u1/details']}>
        <SubNavMenuItem
          id="u1"
          menuItem={mockMenuItem}
        />
      </MemoryRouter>,
    )
    // Selected item should have selected class
    const button = container.querySelector('.Mui-selected')
    expect(button).toBeTruthy()
  })
})
