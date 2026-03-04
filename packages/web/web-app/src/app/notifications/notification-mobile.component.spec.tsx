jest.mock('./notification-web.api', () => ({
  useMarkAllAsDismissedMutation: () => [
    jest.fn().mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) }),
    { error: undefined, isLoading: false, isUninitialized: true },
  ],
}))

import { renderWithProviders } from '../../../testing-render'
import { uiInitialState } from '../ui/store/ui-web.reducer'
import { NotificationsMobile } from './notification-mobile.component'

describe('NotificationsMobile', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(<NotificationsMobile clickCloseMenu={jest.fn()} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render with notifications open state', () => {
    const { baseElement } = renderWithProviders(
      <NotificationsMobile clickCloseMenu={jest.fn()} />,
      {
        preloadedState: {
          ui: {
            ...uiInitialState,
            mobileNotiicationsOpen: true,
          },
        },
      },
    )
    expect(baseElement).toBeTruthy()
  })
})
