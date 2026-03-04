// Mock global fetch for SSR health endpoint
global.fetch = jest.fn().mockResolvedValue({
  json: jest.fn().mockResolvedValue({
    memory: { heapTotal: 100, heapUsed: 50, rss: 200 },
    metrics: {},
    uptime: 300,
  }),
  ok: true,
})

import { renderWithProviders } from '../../../testing-render'
import { StatsWebSsrHealthComponent } from './stats-web-ssr-health.component'

describe('StatsWebSsrHealthComponent', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(<StatsWebSsrHealthComponent />)
    expect(baseElement).toBeTruthy()
  })

  it('should render the SSR health content wrapper', () => {
    const { container } = renderWithProviders(<StatsWebSsrHealthComponent />)
    expect(container.firstChild).toBeTruthy()
  })

  it('should render when fetch fails', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))
    const { baseElement } = renderWithProviders(<StatsWebSsrHealthComponent />)
    expect(baseElement).toBeTruthy()
  })
})
