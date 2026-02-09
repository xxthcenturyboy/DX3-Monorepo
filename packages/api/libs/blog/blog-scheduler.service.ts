import cron from 'node-cron'

import { ApiLoggingClass } from '../logger'
import type { BlogService } from './blog-api.service'

/**
 * Cron job that runs every minute to publish scheduled blog posts.
 * Call start() from API main.ts after Express is configured.
 */
export function startBlogScheduler(blogService: BlogService): void {
  cron.schedule('* * * * *', async () => {
    try {
      const count = await blogService.processScheduledPosts()
      if (count > 0) {
        ApiLoggingClass.instance?.logInfo(`BlogScheduler: Published ${count} scheduled post(s)`)
      }
    } catch (err) {
      ApiLoggingClass.instance?.logError(
        `BlogScheduler: Error processing scheduled posts: ${(err as Error).message}`,
      )
    }
  })

  ApiLoggingClass.instance?.logInfo('BlogScheduler: Started (runs every minute)')
}
