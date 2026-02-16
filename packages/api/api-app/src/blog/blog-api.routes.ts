import { Router } from 'express'

import { ensureLoggedIn } from '@dx3/api-libs/auth/middleware/ensure-logged-in.middleware'
import { hasEditorRole } from '@dx3/api-libs/auth/middleware/ensure-role.middleware'

import { BlogController } from './blog-api.controller'

/**
 * Public blog routes (no auth required)
 */
function configurePublicRoutes(): Router {
  const router = Router()

  router.get('/posts', BlogController.getPublishedPosts)
  router.get('/posts/:id/related', BlogController.getRelatedPosts)
  router.get('/posts/:slug', BlogController.getPostBySlug)
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

  router.get('/posts', BlogController.getAllPosts)
  router.get('/posts/:id/preview', BlogController.getPostPreview)
  router.get('/posts/:id', BlogController.getPostById)
  router.post('/posts', BlogController.createPost)
  router.put('/posts/:id', BlogController.updatePost)
  router.delete('/posts/:id', BlogController.deletePost)
  router.post('/posts/:id/publish', BlogController.publishPost)
  router.post('/posts/:id/schedule', BlogController.schedulePost)
  router.post('/posts/:id/unschedule', BlogController.unschedulePost)
  router.post('/posts/:id/unpublish', BlogController.unpublishPost)

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
