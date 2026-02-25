import { z } from 'zod'

import { BLOG_POST_STATUS_ARRAY } from '@dx3/models-shared'

export const createBlogPostBodySchema = z.object({
  categories: z.array(z.string()).optional(),
  content: z.string().min(1),
  excerpt: z.string().nullable().optional(),
  featuredImageId: z.string().nullable().optional(),
  isAnonymous: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  title: z.string().min(1),
})

export const updateBlogPostBodySchema = createBlogPostBodySchema.partial().extend({
  canonicalUrl: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
  seoTitle: z.string().nullable().optional(),
  slug: z.string().optional(),
})

export const scheduleBlogPostBodySchema = z.object({
  scheduledAt: z.string().min(1),
})

export const blogPostParamsSchema = z.object({
  id: z.string().min(1),
})

export const blogPostSlugParamsSchema = z.object({
  slug: z.string().min(1),
})

export const getBlogPostsAdminQuerySchema = z.object({
  filterValue: z.string().optional(),
  limit: z.coerce.number().optional(),
  offset: z.coerce.number().optional(),
  orderBy: z.string().optional(),
  sortDir: z.enum(['ASC', 'DESC']).optional(),
  status: z.enum(BLOG_POST_STATUS_ARRAY as unknown as [string, ...string[]]).optional(),
})

export const getBlogPostsQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().optional(),
})
