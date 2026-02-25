import { Router } from 'express'

import { ensureLoggedIn } from '@dx3/api-libs/auth/middleware/ensure-logged-in.middleware'
import { hasEditorRole } from '@dx3/api-libs/auth/middleware/ensure-role.middleware'
import {
  blogPostParamsSchema,
  blogPostSlugParamsSchema,
  createBlogPostBodySchema,
  getBlogPostsAdminQuerySchema,
  getBlogPostsQuerySchema,
  scheduleBlogPostBodySchema,
  updateBlogPostBodySchema,
} from '@dx3/api-libs/blog/blog-api.validation'
import { validateRequest } from '@dx3/api-libs/validation/validate-request.middleware'

import { BlogController } from './blog-api.controller'

/**
 * Public blog routes (no auth required)
 */
function configurePublicRoutes(): Router {
  const router = Router()

  router.get(
    '/posts',
    validateRequest({ query: getBlogPostsQuerySchema }),
    BlogController.getPublishedPosts,
  )
  router.get(
    '/posts/:id/related',
    validateRequest({ params: blogPostParamsSchema }),
    BlogController.getRelatedPosts,
  )
  router.get(
    '/posts/:slug',
    validateRequest({ params: blogPostSlugParamsSchema }),
    BlogController.getPostBySlug,
  )
  router.get('/categories', BlogController.getCategories)
  router.get('/tags', BlogController.getTags)

  return router
}

/**
 * Admin blog routes (EDITOR role required)
 */
function configureAdminRoutes(): Router {
  const router = Router()

  router.all('/*', [ensureLoggedIn, hasEditorRole])

  router.get(
    '/posts',
    validateRequest({ query: getBlogPostsAdminQuerySchema }),
    BlogController.getAllPosts,
  )
  router.get(
    '/posts/:id/preview',
    validateRequest({ params: blogPostParamsSchema }),
    BlogController.getPostPreview,
  )
  router.get(
    '/posts/:id',
    validateRequest({ params: blogPostParamsSchema }),
    BlogController.getPostById,
  )
  router.post(
    '/posts',
    validateRequest({ body: createBlogPostBodySchema }),
    BlogController.createPost,
  )
  router.put(
    '/posts/:id',
    validateRequest({ body: updateBlogPostBodySchema, params: blogPostParamsSchema }),
    BlogController.updatePost,
  )
  router.delete(
    '/posts/:id',
    validateRequest({ params: blogPostParamsSchema }),
    BlogController.deletePost,
  )
  router.post(
    '/posts/:id/publish',
    validateRequest({ params: blogPostParamsSchema }),
    BlogController.publishPost,
  )
  router.post(
    '/posts/:id/schedule',
    validateRequest({ body: scheduleBlogPostBodySchema, params: blogPostParamsSchema }),
    BlogController.schedulePost,
  )
  router.post(
    '/posts/:id/unschedule',
    validateRequest({ params: blogPostParamsSchema }),
    BlogController.unschedulePost,
  )
  router.post(
    '/posts/:id/unpublish',
    validateRequest({ params: blogPostParamsSchema }),
    BlogController.unpublishPost,
  )

  return router
}

export class BlogRoutes {
  static configure(): Router {
    const router = Router()

    router.use('/', configurePublicRoutes())
    router.use('/admin', configureAdminRoutes())

    return router
  }
}

export type BlogRoutesType = typeof BlogRoutes.prototype
