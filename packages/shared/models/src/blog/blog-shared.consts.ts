/**
 * Blog post status values
 * Tracks the lifecycle of a blog post
 */
export const BLOG_POST_STATUS = {
  ARCHIVED: 'archived',
  DRAFT: 'draft',
  PUBLISHED: 'published',
  SCHEDULED: 'scheduled',
} as const

export const BLOG_POST_STATUS_ARRAY = Object.values(BLOG_POST_STATUS)

/**
 * Default values for blog operations
 */
export const BLOG_DEFAULTS = {
  EXCERPT_MAX_LENGTH: 200,
  POSTS_PER_PAGE: 5,
  WORDS_PER_MINUTE: 200,
} as const
