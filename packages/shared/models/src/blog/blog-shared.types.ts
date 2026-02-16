import type { BLOG_POST_STATUS } from './blog-shared.consts'

/**
 * Blog post status type derived from constants
 */
export type BlogPostStatusType = (typeof BLOG_POST_STATUS)[keyof typeof BLOG_POST_STATUS]

/**
 * Blog category entity (flat, single-level)
 */
export type BlogCategoryType = {
  id: string
  name: string
  slug: string
}

/**
 * Blog tag entity (flat)
 */
export type BlogTagType = {
  id: string
  name: string
  slug: string
}

/**
 * Blog post entity with full relations
 */
export type BlogPostType = {
  authorId: string
  canonicalUrl: string | null
  categories: BlogCategoryType[]
  content: string
  createdAt: Date
  excerpt: string | null
  featuredImageId: string | null
  id: string
  isAnonymous: boolean
  publishedAt: Date | null
  readingTimeMinutes: number
  scheduledAt: Date | null
  seoDescription: string | null
  seoTitle: string | null
  slug: string
  status: BlogPostStatusType
  tags: BlogTagType[]
  title: string
  updatedAt: Date
}

/**
 * Blog post with author display info (for public view)
 */
export type BlogPostWithAuthorType = BlogPostType & {
  authorDisplayName: string
}

/**
 * Payload for creating a new blog post (admin)
 */
export type CreateBlogPostPayloadType = {
  categories?: string[]
  content: string
  excerpt?: string | null
  featuredImageId?: string | null
  isAnonymous?: boolean
  tags?: string[]
  title: string
}

/**
 * Payload for updating a blog post (admin)
 */
export type UpdateBlogPostPayloadType = Partial<CreateBlogPostPayloadType> & {
  canonicalUrl?: string | null
  seoDescription?: string | null
  seoTitle?: string | null
  slug?: string
}

/**
 * Payload for scheduling a post
 */
export type ScheduleBlogPostPayloadType = {
  scheduledAt: string
}

/**
 * Query parameters for listing published posts (public, cursor-based)
 */
export type GetBlogPostsQueryType = {
  cursor?: string
  limit?: number
}

/**
 * Query parameters for listing all posts (admin)
 */
export type GetBlogPostsAdminQueryType = {
  filterValue?: string
  limit?: number
  offset?: number
  orderBy?: string
  sortDir?: 'ASC' | 'DESC'
  status?: BlogPostStatusType
}

/**
 * Response type for blog posts list (cursor-based)
 */
export type GetBlogPostsResponseType = {
  cursor: string | null
  posts: BlogPostWithAuthorType[]
}

/**
 * Response type for admin blog posts list
 */
export type GetBlogPostsAdminResponseType = {
  count: number
  rows: BlogPostType[]
}
