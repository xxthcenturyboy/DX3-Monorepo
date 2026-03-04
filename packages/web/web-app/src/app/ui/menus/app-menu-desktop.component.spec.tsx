jest.mock('./app-menu.component', () => ({
  AppMenu: () => <div data-testid="app-menu">App Menu</div>,
}))

import { renderWithProviders } from '../../../../testing-render'
import { uiInitialState } from '../store/ui-web.reducer'
import { AppMenuDesktop } from './app-menu-desktop.component'

describe('AppMenuDesktop', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(<AppMenuDesktop />)
    expect(baseElement).toBeTruthy()
  })

  it('should render with menu open', () => {
    const { baseElement } = renderWithProviders(<AppMenuDesktop />, {
      preloadedState: {
        ui: {
          ...uiInitialState,
          menuOpen: true,
        },
      },
    })
    expect(baseElement).toBeTruthy()
  })

  it('should render with menu closed', () => {
    const { baseElement } = renderWithProviders(<AppMenuDesktop />, {
      preloadedState: {
        ui: {
          ...uiInitialState,
          menuOpen: false,
        },
      },
    })
    expect(baseElement).toBeTruthy()
  })
})
