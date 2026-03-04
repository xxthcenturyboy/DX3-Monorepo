jest.mock('./stats-web.api', () => ({
  useLazyGetApiHealthzQuery: () => [
    jest.fn().mockReturnValue(Promise.resolve()),
    {
      data: undefined,
      error: undefined,
      isFetching: false,
      isSuccess: false,
      isUninitialized: true,
    },
  ],
}))

import { renderWithProviders } from '../../../testing-render'
import { StatsWebApiHealthComponent } from './stats-web-api-health.component'

describe('StatsWebApiHealthComponent', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(<StatsWebApiHealthComponent />)
    expect(baseElement).toBeTruthy()
  })

  it('should render with api stats data', () => {
    const { baseElement } = renderWithProviders(<StatsWebApiHealthComponent />, {
      preloadedState: {
        stats: {
          api: {
            http: { status: 'OK' },
            memory: {
              status: 'OK',
              usage: {
                arrayBuffers: 1024,
                external: 512,
                heapTotal: 2048,
                heapUsed: 1024,
                rss: 4096,
              },
            },
            postgres: { status: 'OK', version: '16.0' },
            redis: {
              profile: { ping: true, read: true, write: true },
              status: 'OK',
            },
          },
        },
      },
    })
    expect(baseElement).toBeTruthy()
  })
})
