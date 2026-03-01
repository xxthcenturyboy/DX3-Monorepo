import cron from 'node-cron'

import { ApiLoggingClass } from '../logger'
import type { BlogService } from './blog-api.service'
import { startBlogScheduler } from './blog-scheduler.service'

const mockSchedule = jest.fn()
const mockProcessScheduledPosts = jest.fn()

jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))

jest.mock('node-cron', () => ({
  schedule: jest.fn(),
}))

;(cron.schedule as jest.Mock).mockImplementation((expr: string, callback: () => Promise<void>) => {
  mockSchedule(expr, callback)
  return { start: jest.fn(), stop: jest.fn() }
})

describe('startBlogScheduler', () => {
  let mockBlogService: BlogService

  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
  })

  beforeEach(() => {
    mockProcessScheduledPosts.mockResolvedValue(0)
    mockBlogService = {
      processScheduledPosts: mockProcessScheduledPosts,
    } as unknown as BlogService
    jest.clearAllMocks()
  })

  it('should exist when imported', () => {
    expect(startBlogScheduler).toBeDefined()
  })

  it('should schedule cron with every-minute expression', () => {
    startBlogScheduler(mockBlogService)
    expect(cron.schedule).toHaveBeenCalledWith('* * * * *', expect.any(Function))
  })

  it('should call processScheduledPosts when cron callback runs', async () => {
    startBlogScheduler(mockBlogService)
    const callback = (cron.schedule as jest.Mock).mock.calls[0][1]
    await callback()
    expect(mockProcessScheduledPosts).toHaveBeenCalled()
  })
})
