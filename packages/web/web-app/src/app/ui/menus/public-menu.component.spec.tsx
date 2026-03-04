import { MemoryRouter } from 'react-router'

import { renderWithProviders } from '../../../../testing-render'
import { PublicMenu } from './public-menu.component'

describe('PublicMenu', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(
      <MemoryRouter>
        <PublicMenu />
      </MemoryRouter>,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render with closeMenu prop', () => {
    const { baseElement } = renderWithProviders(
      <MemoryRouter>
        <PublicMenu closeMenu={jest.fn()} />
      </MemoryRouter>,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render in mobile break mode', () => {
    const { baseElement } = renderWithProviders(
      <MemoryRouter>
        <PublicMenu mobileBreak={true} />
      </MemoryRouter>,
    )
    expect(baseElement).toBeTruthy()
  })
})
