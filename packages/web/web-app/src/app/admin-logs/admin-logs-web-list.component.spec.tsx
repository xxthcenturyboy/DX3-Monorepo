jest.mock('./admin-logs-web.api', () => ({
  useLazyGetAdminLogsQuery: () => [
    jest.fn().mockReturnValue(Promise.resolve({ data: undefined })),
    {
      data: undefined,
      error: undefined,
      isFetching: false,
      isSuccess: false,
      isUninitialized: true,
    },
  ],
  useLazyGetAdminLogsStatusQuery: () => [
    jest.fn().mockReturnValue(Promise.resolve({ data: { isAvailable: false } })),
    {
      data: undefined,
      error: undefined,
      isFetching: false,
      isSuccess: false,
      isUninitialized: true,
    },
  ],
}))

import { adminLogsInitialState } from './admin-logs-web.reducer'
import { renderWithProviders } from '../../../testing-render'
import { AdminLogsListComponent } from './admin-logs-web-list.component'

describe('AdminLogsListComponent', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(<AdminLogsListComponent />)
    expect(baseElement).toBeTruthy()
  })

  it('should render when logs are not available', () => {
    const { baseElement } = renderWithProviders(<AdminLogsListComponent />, {
      preloadedState: {
        adminLogs: {
          ...adminLogsInitialState,
          isAvailable: false,
        },
      },
    })
    expect(baseElement).toBeTruthy()
  })

  it('should render when logs are available', () => {
    const { baseElement } = renderWithProviders(<AdminLogsListComponent />, {
      preloadedState: {
        adminLogs: {
          ...adminLogsInitialState,
          isAvailable: true,
          limit: 25,
          logs: [],
          logsCount: 0,
          offset: 0,
        },
      },
    })
    expect(baseElement).toBeTruthy()
  })
})
