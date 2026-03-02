import { ApiLoggingClass } from '../logger'
import type { BlogService } from './blog-api.service'
import { startBlogScheduler } from './blog-scheduler.service'

jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))
jest.mock('node-cron', () => ({
  schedule: jest.fn(),
}))

import cron from 'node-cron'

describe('startBlogScheduler', () => {
  let mockBlogService: jest.Mocked<Pick<BlogService, 'processScheduledPosts'>>
  let scheduledCallback: () => Promise<void>
  let logInfoSpy: jest.SpyInstance
  let logErrorSpy: jest.SpyInstance

  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
  })

  beforeEach(() => {
    jest.clearAllMocks()
    mockBlogService = {
      processScheduledPosts: jest.fn(),
    }
    ;(cron.schedule as jest.Mock).mockImplementation(
      (_pattern: string, cb: () => Promise<void>) => {
        scheduledCallback = cb
      },
    )
    logInfoSpy = jest.spyOn(ApiLoggingClass.instance, 'logInfo')
    logErrorSpy = jest.spyOn(ApiLoggingClass.instance, 'logError')
  })

  afterEach(() => {
    logInfoSpy.mockRestore()
    logErrorSpy.mockRestore()
  })

  it('should register a cron job running every minute', () => {
    startBlogScheduler(mockBlogService as unknown as BlogService)

    expect(cron.schedule).toHaveBeenCalledWith('* * * * *', expect.any(Function))
  })

  it('should log info on startup', () => {
    startBlogScheduler(mockBlogService as unknown as BlogService)

    expect(logInfoSpy).toHaveBeenCalledWith('BlogScheduler: Started (runs every minute)')
  })

  it('should call processScheduledPosts when cron fires and log when count > 0', async () => {
    mockBlogService.processScheduledPosts.mockResolvedValue(3)

    startBlogScheduler(mockBlogService as unknown as BlogService)
    await scheduledCallback()

    expect(mockBlogService.processScheduledPosts).toHaveBeenCalled()
    expect(logInfoSpy).toHaveBeenCalledWith('BlogScheduler: Published 3 scheduled post(s)')
  })

  it('should not log published message when processScheduledPosts returns 0', async () => {
    mockBlogService.processScheduledPosts.mockResolvedValue(0)

    startBlogScheduler(mockBlogService as unknown as BlogService)
    await scheduledCallback()

    const publishedCalls = logInfoSpy.mock.calls.filter(([msg]: [string]) =>
      msg.includes('Published'),
    )
    expect(publishedCalls).toHaveLength(0)
  })

  it('should catch and log errors from processScheduledPosts', async () => {
    mockBlogService.processScheduledPosts.mockRejectedValue(new Error('DB error'))

    startBlogScheduler(mockBlogService as unknown as BlogService)
    await scheduledCallback()

    expect(logErrorSpy).toHaveBeenCalledWith(
      'BlogScheduler: Error processing scheduled posts: DB error',
    )
  })
})
