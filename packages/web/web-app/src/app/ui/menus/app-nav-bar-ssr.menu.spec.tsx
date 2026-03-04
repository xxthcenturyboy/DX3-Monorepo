import { MemoryRouter } from 'react-router'

import { renderWithProviders } from '../../../../testing-render'
import { AppNavBarSsr } from './app-nav-bar-ssr.menu'

describe('AppNavBarSsr', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(
      <MemoryRouter>
        <AppNavBarSsr />
      </MemoryRouter>,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render a navbar', () => {
    const { container } = renderWithProviders(
      <MemoryRouter>
        <AppNavBarSsr />
      </MemoryRouter>,
    )
    expect(container.querySelector('.MuiAppBar-root')).toBeTruthy()
  })
})
