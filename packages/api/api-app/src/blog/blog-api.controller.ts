import type { Request, Response } from 'express'

import { TokenService } from '@dx3/api-libs/auth/tokens/token.service'
import { BlogService } from '@dx3/api-libs/blog/blog-api.service'
import { HeaderService } from '@dx3/api-libs/headers/header.service'
import { sendBadRequest, sendNotFound, sendOK } from '@dx3/api-libs/http-response/http-responses'
import { logRequest } from '@dx3/api-libs/logger/log-request.util'
import {
  BLOG_DEFAULTS,
  type CreateBlogPostPayloadType,
  type GetBlogPostsAdminQueryType,
  type ScheduleBlogPostPayloadType,
  type UpdateBlogPostPayloadType,
} from '@dx3/models-shared'

const blogService = new BlogService()

export const BlogController = {
  createPost: async (req: Request, res: Response) => {
    logRequest({ req, type: 'createBlogPost' })
    try {
      const token = HeaderService.getTokenFromRequest(req)
      if (!token) return sendBadRequest(req, res, 'Authentication required')

      const userId = TokenService.getUserIdFromToken(token)
      if (!userId) return sendBadRequest(req, res, 'Invalid token')

      const payload = req.body as CreateBlogPostPayloadType
      const post = await blogService.createPost(userId, payload)
      return sendOK(req, res, post)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed createBlogPost' })
      sendBadRequest(req, res, (err as Error).message)
    }
  },

  deletePost: async (req: Request, res: Response) => {
    logRequest({ req, type: 'deleteBlogPost' })
    try {
      const id = req.params.id
      if (!id) return sendBadRequest(req, res, 'Post ID is required')

      await blogService.deletePost(id)
      return sendOK(req, res, { deleted: true })
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed deleteBlogPost' })
      sendBadRequest(req, res, (err as Error).message)
    }
  },

  // ─── Admin endpoints (EDITOR role) ────────────────────────────────────────

  getAllPosts: async (req: Request, res: Response) => {
    logRequest({ req, type: 'getBlogAllPosts' })
    try {
      const query: GetBlogPostsAdminQueryType = {
        filterValue: req.query.filterValue as string | undefined,
        limit: req.query.limit ? Number.parseInt(req.query.limit as string, 10) : undefined,
        offset: req.query.offset ? Number.parseInt(req.query.offset as string, 10) : undefined,
        orderBy: req.query.orderBy as string | undefined,
        sortDir: req.query.sortDir as 'ASC' | 'DESC' | undefined,
        status: req.query.status as GetBlogPostsAdminQueryType['status'],
      }

      const result = await blogService.getAllPosts(query)
      return sendOK(req, res, result)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed getBlogAllPosts' })
      sendBadRequest(req, res, (err as Error).message)
    }
  },

  getCategories: async (req: Request, res: Response) => {
    logRequest({ req, type: 'getBlogCategories' })
    try {
      const categories = await blogService.getCategories()
      return sendOK(req, res, categories)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed getBlogCategories' })
      sendBadRequest(req, res, (err as Error).message)
    }
  },

  getPostPreview: async (req: Request, res: Response) => {
    logRequest({ req, type: 'getBlogPostPreview' })
    try {
      const id = req.params.id
      if (!id) return sendBadRequest(req, res, 'Post ID is required')

      const post = await blogService.getPostForPreview(id)
      if (!post) return sendNotFound(req, res, 'Post not found')

      return sendOK(req, res, post)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed getBlogPostPreview' })
      sendBadRequest(req, res, (err as Error).message)
    }
  },

  getPostById: async (req: Request, res: Response) => {
    logRequest({ req, type: 'getBlogPostById' })
    try {
      const id = req.params.id
      if (!id) return sendBadRequest(req, res, 'Post ID is required')

      const post = await blogService.getPostById(id)
      if (!post) return sendNotFound(req, res, 'Post not found')

      return sendOK(req, res, post)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed getBlogPostById' })
      sendBadRequest(req, res, (err as Error).message)
    }
  },

  getPostBySlug: async (req: Request, res: Response) => {
    logRequest({ req, type: 'getBlogPostBySlug' })
    try {
      const slug = req.params.slug
      if (!slug) {
        return sendBadRequest(req, res, 'Slug is required')
      }

      const post = await blogService.getPostBySlug(slug)
      if (!post) {
        return sendNotFound(req, res, 'Post not found')
      }

      return sendOK(req, res, post)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed getBlogPostBySlug' })
      sendBadRequest(req, res, (err as Error).message)
    }
  },
  // ─── Public endpoints (no auth) ───────────────────────────────────────────

  getPublishedPosts: async (req: Request, res: Response) => {
    logRequest({ req, type: 'getBlogPublishedPosts' })
    try {
      const cursor = req.query.cursor as string | undefined
      const limit = req.query.limit
        ? Number.parseInt(req.query.limit as string, 10)
        : BLOG_DEFAULTS.POSTS_PER_PAGE

      const result = await blogService.getPublishedPosts({ cursor, limit })
      return sendOK(req, res, result)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed getBlogPublishedPosts' })
      sendBadRequest(req, res, (err as Error).message)
    }
  },

  getRelatedPosts: async (req: Request, res: Response) => {
    logRequest({ req, type: 'getBlogRelatedPosts' })
    try {
      const id = req.params.id
      const limit = req.query.limit ? Number.parseInt(req.query.limit as string, 10) : 3

      if (!id) {
        return sendBadRequest(req, res, 'Post ID is required')
      }

      const posts = await blogService.getRelatedPosts(id, limit)
      return sendOK(req, res, posts)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed getBlogRelatedPosts' })
      sendBadRequest(req, res, (err as Error).message)
    }
  },

  getTags: async (req: Request, res: Response) => {
    logRequest({ req, type: 'getBlogTags' })
    try {
      const tags = await blogService.getTags()
      return sendOK(req, res, tags)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed getBlogTags' })
      sendBadRequest(req, res, (err as Error).message)
    }
  },

  publishPost: async (req: Request, res: Response) => {
    logRequest({ req, type: 'publishBlogPost' })
    try {
      const id = req.params.id
      if (!id) return sendBadRequest(req, res, 'Post ID is required')

      const post = await blogService.publishPost(id)
      return sendOK(req, res, post)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed publishBlogPost' })
      sendBadRequest(req, res, (err as Error).message)
    }
  },

  schedulePost: async (req: Request, res: Response) => {
    logRequest({ req, type: 'scheduleBlogPost' })
    try {
      const id = req.params.id
      if (!id) return sendBadRequest(req, res, 'Post ID is required')

      const body = req.body as ScheduleBlogPostPayloadType
      const scheduledAt = new Date(body.scheduledAt)
      if (Number.isNaN(scheduledAt.getTime())) {
        return sendBadRequest(req, res, 'Invalid scheduledAt date')
      }

      const post = await blogService.schedulePost(id, scheduledAt)
      return sendOK(req, res, post)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed scheduleBlogPost' })
      sendBadRequest(req, res, (err as Error).message)
    }
  },

  unschedulePost: async (req: Request, res: Response) => {
    logRequest({ req, type: 'unscheduleBlogPost' })
    try {
      const id = req.params.id
      if (!id) return sendBadRequest(req, res, 'Post ID is required')

      const post = await blogService.unschedulePost(id)
      return sendOK(req, res, post)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed unscheduleBlogPost' })
      sendBadRequest(req, res, (err as Error).message)
    }
  },

  unpublishPost: async (req: Request, res: Response) => {
    logRequest({ req, type: 'unpublishBlogPost' })
    try {
      const id = req.params.id
      if (!id) return sendBadRequest(req, res, 'Post ID is required')

      const post = await blogService.unpublishPost(id)
      return sendOK(req, res, post)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed unpublishBlogPost' })
      sendBadRequest(req, res, (err as Error).message)
    }
  },

  updatePost: async (req: Request, res: Response) => {
    logRequest({ req, type: 'updateBlogPost' })
    try {
      const token = HeaderService.getTokenFromRequest(req)
      if (!token) return sendBadRequest(req, res, 'Authentication required')

      const editorId = TokenService.getUserIdFromToken(token)
      if (!editorId) return sendBadRequest(req, res, 'Invalid token')

      const id = req.params.id
      if (!id) return sendBadRequest(req, res, 'Post ID is required')

      const payload = req.body as UpdateBlogPostPayloadType
      const post = await blogService.updatePost(id, editorId, payload)
      return sendOK(req, res, post)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed updateBlogPost' })
      sendBadRequest(req, res, (err as Error).message)
    }
  },
}

export type BlogControllerType = typeof BlogController
