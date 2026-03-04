jest.mock('./app-menu-desktop.component', () => ({
  AppMenuDesktop: () => <div data-testid="app-menu-desktop">Desktop Menu</div>,
}))

jest.mock('./app-menu-mobile.component', () => ({
  AppMenuMobile: () => <div data-testid="app-menu-mobile">Mobile Menu</div>,
}))

import { uiInitialState } from '../store/ui-web.reducer'
import { renderWithProviders } from '../../../../testing-render'
import { MenuNav } from './menu-nav'

describe('MenuNav', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(<MenuNav />, {
      preloadedState: {
        ui: { ...uiInitialState, windowWidth: 1920 },
      },
    })
    expect(baseElement).toBeTruthy()
  })

  it('should render the desktop menu when window is wide', () => {
    const { getByTestId } = renderWithProviders(<MenuNav />, {
      preloadedState: {
        ui: { ...uiInitialState, windowWidth: 1920 },
      },
    })
    expect(getByTestId('app-menu-desktop')).toBeTruthy()
  })

  it('should render the mobile menu when window is narrow', () => {
    const { getByTestId } = renderWithProviders(<MenuNav />, {
      preloadedState: {
        ui: { ...uiInitialState, windowWidth: 400 },
      },
    })
    expect(getByTestId('app-menu-mobile')).toBeTruthy()
  })
})
