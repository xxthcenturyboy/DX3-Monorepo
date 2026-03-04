jest.mock('./public-menu.component', () => ({
  PublicMenu: ({ mobileBreak }: { mobileBreak?: boolean }) => (
    <div data-testid="public-menu">{`mobileBreak:${mobileBreak}`}</div>
  ),
}))

import { renderWithProviders } from '../../../../testing-render'
import { uiInitialState } from '../store/ui-web.reducer'
import { PublicMenuMobile } from './public-menu-mobile.component'

describe('PublicMenuMobile', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(<PublicMenuMobile />)
    expect(baseElement).toBeTruthy()
  })

  it('should render with public menu open', () => {
    const { baseElement } = renderWithProviders(<PublicMenuMobile />, {
      preloadedState: {
        ui: {
          ...uiInitialState,
          publicMenuOpen: true,
        },
      },
    })
    expect(baseElement).toBeTruthy()
  })
})
