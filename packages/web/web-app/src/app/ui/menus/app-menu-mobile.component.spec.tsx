jest.mock('./app-menu.component', () => ({
  AppMenu: ({ mobileBreak }: { mobileBreak?: boolean }) => (
    <div data-testid="app-menu">{`mobileBreak:${mobileBreak}`}</div>
  ),
}))

import { uiInitialState } from '../store/ui-web.reducer'
import { renderWithProviders } from '../../../../testing-render'
import { AppMenuMobile } from './app-menu-mobile.component'

describe('AppMenuMobile', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(<AppMenuMobile />)
    expect(baseElement).toBeTruthy()
  })

  it('should render with menu open', () => {
    const { baseElement } = renderWithProviders(<AppMenuMobile />, {
      preloadedState: {
        ui: {
          ...uiInitialState,
          menuOpen: true,
        },
      },
    })
    expect(baseElement).toBeTruthy()
  })
})
