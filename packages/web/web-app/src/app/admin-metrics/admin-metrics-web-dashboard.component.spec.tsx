jest.mock('./admin-metrics-web.api', () => ({
  useLazyGetMetricsFeaturesQuery: () => [
    jest.fn().mockReturnValue(Promise.resolve({ data: [] })),
    { data: undefined, error: undefined, isFetching: false, isUninitialized: true },
  ],
  useLazyGetMetricsGrowthQuery: () => [
    jest.fn().mockReturnValue(Promise.resolve({ data: undefined })),
    { data: undefined, error: undefined, isFetching: false, isUninitialized: true },
  ],
  useLazyGetMetricsStatusQuery: () => [
    jest.fn().mockReturnValue(Promise.resolve({ data: { isAvailable: false } })),
    { data: undefined, error: undefined, isFetching: false, isUninitialized: true },
  ],
}))

import { renderWithProviders } from '../../../testing-render'
import { adminMetricsInitialState } from './admin-metrics-web.reducer'
import { AdminMetricsDashboardComponent } from './admin-metrics-web-dashboard.component'

describe('AdminMetricsDashboardComponent', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(<AdminMetricsDashboardComponent />)
    expect(baseElement).toBeTruthy()
  })

  it('should render when metrics are not available', () => {
    const { baseElement } = renderWithProviders(<AdminMetricsDashboardComponent />, {
      preloadedState: {
        adminMetrics: {
          ...adminMetricsInitialState,
          isAvailable: false,
        },
      },
    })
    expect(baseElement).toBeTruthy()
  })
})
