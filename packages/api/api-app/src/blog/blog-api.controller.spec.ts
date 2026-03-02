import type { Request as IRequest, Response as IResponse } from 'express'
import { Request } from 'jest-express/lib/request'
import { Response } from 'jest-express/lib/response'

import { BlogService } from '@dx3/api-libs/blog/blog-api.service'
import { sendBadRequest, sendNotFound, sendOK } from '@dx3/api-libs/http-response/http-responses'
import { logRequest } from '@dx3/api-libs/logger/log-request.util'

import { BlogController } from './blog-api.controller'

// blog-api.controller instantiates BlogService at module scope (const blogService = new BlogService()).
// jest.mock() factories with inline objects capture the instance created during module load,
// which is accessible via BlogService.mock.instances[0] in beforeAll (before clearAllMocks runs).
jest.mock('@dx3/api-libs/blog/blog-api.service', () => ({
  BlogService: jest.fn(() => ({
    createPost: jest.fn(),
    deletePost: jest.fn(),
    getAllPosts: jest.fn(),
    getCategories: jest.fn(),
    getPostById: jest.fn(),
    getPostBySlug: jest.fn(),
    getPostForPreview: jest.fn(),
    getPublishedPosts: jest.fn(),
    getRelatedPosts: jest.fn(),
    getTags: jest.fn(),
    publishPost: jest.fn(),
    schedulePost: jest.fn(),
    unpublishPost: jest.fn(),
    unschedulePost: jest.fn(),
    updatePost: jest.fn(),
  })),
}))
jest.mock('@dx3/api-libs/auth/tokens/token.service', () => ({
  TokenService: {
    getUserIdFromToken: jest.fn().mockReturnValue('test-user-id'),
  },
}))
jest.mock('@dx3/api-libs/headers/header.service', () => ({
  HeaderService: {
    getTokenFromRequest: jest.fn().mockReturnValue('test-token'),
  },
}))
jest.mock('@dx3/api-libs/http-response/http-responses', () => ({
  sendBadRequest: jest.fn(),
  sendNotFound: jest.fn(),
  sendOK: jest.fn(),
}))
jest.mock('@dx3/api-libs/logger/log-request.util', () => ({
  logRequest: jest.fn(),
}))

type BlogServiceMock = {
  createPost: jest.Mock
  deletePost: jest.Mock
  getAllPosts: jest.Mock
  getCategories: jest.Mock
  getPostById: jest.Mock
  getPostBySlug: jest.Mock
  getPostForPreview: jest.Mock
  getPublishedPosts: jest.Mock
  getRelatedPosts: jest.Mock
  getTags: jest.Mock
  publishPost: jest.Mock
  schedulePost: jest.Mock
  unpublishPost: jest.Mock
  unschedulePost: jest.Mock
  updatePost: jest.Mock
}

describe('BlogController', () => {
  let req: IRequest
  let res: IResponse
  // Singleton instance created at module-load time via the jest.mock factory above
  let blogServiceMock: BlogServiceMock

  beforeAll(() => {
    // jest.fn(() => obj) returns `obj` as the constructed value — accessible via mock.results[0].value.
    // mock.instances[0] stores the raw `this` before the factory return, which is empty.
    blogServiceMock = jest.mocked(BlogService).mock.results[0]?.value as BlogServiceMock
  })

  beforeEach(() => {
    jest.clearAllMocks()
    req = new Request() as unknown as IRequest
    res = new Response() as unknown as IResponse
    req.params = {}
    req.query = {}
    req.body = {}
    req.headers = {}
    // Restore token/header default return values cleared by clearAllMocks
    const { HeaderService } = jest.requireMock('@dx3/api-libs/headers/header.service')
    HeaderService.getTokenFromRequest.mockReturnValue('test-token')
    const { TokenService } = jest.requireMock('@dx3/api-libs/auth/tokens/token.service')
    TokenService.getUserIdFromToken.mockReturnValue('test-user-id')
  })

  it('should exist when imported', () => {
    expect(BlogController).toBeDefined()
  })

  // ─── createPost ────────────────────────────────────────────────────────────

  describe('createPost', () => {
    it('should call sendBadRequest when token is missing', async () => {
      // arrange
      const { HeaderService } = jest.requireMock('@dx3/api-libs/headers/header.service')
      HeaderService.getTokenFromRequest.mockReturnValueOnce(null)
      // act
      await BlogController.createPost(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalledWith(req, res, 'Authentication required')
    })

    it('should call sendBadRequest when userId cannot be extracted from token', async () => {
      // arrange
      const { TokenService } = jest.requireMock('@dx3/api-libs/auth/tokens/token.service')
      TokenService.getUserIdFromToken.mockReturnValueOnce(null)
      // act
      await BlogController.createPost(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalledWith(req, res, 'Invalid token')
    })

    it('should call sendOK with post on success', async () => {
      // arrange
      const mockPost = { id: 'post-1', title: 'Test Post' }
      blogServiceMock.createPost.mockResolvedValueOnce(mockPost)
      req.body = { content: 'Hello', title: 'Test Post' }
      // act
      await BlogController.createPost(req, res)
      // assert
      expect(sendOK).toHaveBeenCalledWith(req, res, mockPost)
    })

    it('should call sendBadRequest when service throws', async () => {
      // arrange
      blogServiceMock.createPost.mockRejectedValueOnce(new Error('DB error'))
      req.body = { content: 'Hello', title: 'Test Post' }
      // act
      await BlogController.createPost(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
      expect(logRequest).toHaveBeenCalled()
    })
  })

  // ─── deletePost ────────────────────────────────────────────────────────────

  describe('deletePost', () => {
    it('should call sendBadRequest when id param is missing', async () => {
      // arrange
      req.params = {}
      // act
      await BlogController.deletePost(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalledWith(req, res, 'Post ID is required')
    })

    it('should call sendOK with deleted flag on success', async () => {
      // arrange
      blogServiceMock.deletePost.mockResolvedValueOnce(undefined)
      req.params = { id: 'post-1' }
      // act
      await BlogController.deletePost(req, res)
      // assert
      expect(sendOK).toHaveBeenCalledWith(req, res, { deleted: true })
    })

    it('should call sendBadRequest when service throws', async () => {
      // arrange
      blogServiceMock.deletePost.mockRejectedValueOnce(new Error('Not found'))
      req.params = { id: 'bad-id' }
      // act
      await BlogController.deletePost(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })
  })

  // ─── getAllPosts ────────────────────────────────────────────────────────────

  describe('getAllPosts', () => {
    it('should call sendOK with result on success', async () => {
      // arrange
      const mockResult = { count: 1, rows: [{ id: 'post-1' }] }
      blogServiceMock.getAllPosts.mockResolvedValueOnce(mockResult)
      req.query = { limit: '10', offset: '0', orderBy: 'createdAt', sortDir: 'DESC' }
      // act
      await BlogController.getAllPosts(req, res)
      // assert
      expect(sendOK).toHaveBeenCalledWith(req, res, mockResult)
    })

    it('should call sendBadRequest when service throws', async () => {
      // arrange
      blogServiceMock.getAllPosts.mockRejectedValueOnce(new Error('Query failed'))
      // act
      await BlogController.getAllPosts(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })
  })

  // ─── getCategories ─────────────────────────────────────────────────────────

  describe('getCategories', () => {
    it('should call sendOK with categories on success', async () => {
      // arrange
      const mockCategories = [{ id: 'cat-1', name: 'Tech' }]
      blogServiceMock.getCategories.mockResolvedValueOnce(mockCategories)
      // act
      await BlogController.getCategories(req, res)
      // assert
      expect(sendOK).toHaveBeenCalledWith(req, res, mockCategories)
    })

    it('should call sendBadRequest when service throws', async () => {
      // arrange
      blogServiceMock.getCategories.mockRejectedValueOnce(new Error('DB error'))
      // act
      await BlogController.getCategories(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })
  })

  // ─── getPostById ───────────────────────────────────────────────────────────

  describe('getPostById', () => {
    it('should call sendBadRequest when id param is missing', async () => {
      // arrange
      req.params = {}
      // act
      await BlogController.getPostById(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalledWith(req, res, 'Post ID is required')
    })

    it('should call sendNotFound when post is not found', async () => {
      // arrange
      blogServiceMock.getPostById.mockResolvedValueOnce(null)
      req.params = { id: 'missing-id' }
      // act
      await BlogController.getPostById(req, res)
      // assert
      expect(sendNotFound).toHaveBeenCalledWith(req, res, 'Post not found')
    })

    it('should call sendOK with post on success', async () => {
      // arrange
      const mockPost = { id: 'post-1', title: 'Hello' }
      blogServiceMock.getPostById.mockResolvedValueOnce(mockPost)
      req.params = { id: 'post-1' }
      // act
      await BlogController.getPostById(req, res)
      // assert
      expect(sendOK).toHaveBeenCalledWith(req, res, mockPost)
    })
  })

  // ─── getPostBySlug ─────────────────────────────────────────────────────────

  describe('getPostBySlug', () => {
    it('should call sendBadRequest when slug param is missing', async () => {
      // arrange
      req.params = {}
      // act
      await BlogController.getPostBySlug(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalledWith(req, res, 'Slug is required')
    })

    it('should call sendNotFound when post is not found', async () => {
      // arrange
      blogServiceMock.getPostBySlug.mockResolvedValueOnce(null)
      req.params = { slug: 'missing-slug' }
      // act
      await BlogController.getPostBySlug(req, res)
      // assert
      expect(sendNotFound).toHaveBeenCalledWith(req, res, 'Post not found')
    })

    it('should call sendOK with post on success', async () => {
      // arrange
      const mockPost = { id: 'post-1', slug: 'my-post' }
      blogServiceMock.getPostBySlug.mockResolvedValueOnce(mockPost)
      req.params = { slug: 'my-post' }
      // act
      await BlogController.getPostBySlug(req, res)
      // assert
      expect(sendOK).toHaveBeenCalledWith(req, res, mockPost)
    })
  })

  // ─── getPostPreview ────────────────────────────────────────────────────────

  describe('getPostPreview', () => {
    it('should call sendBadRequest when id param is missing', async () => {
      // arrange
      req.params = {}
      // act
      await BlogController.getPostPreview(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalledWith(req, res, 'Post ID is required')
    })

    it('should call sendNotFound when post is not found', async () => {
      // arrange
      blogServiceMock.getPostForPreview.mockResolvedValueOnce(null)
      req.params = { id: 'post-1' }
      // act
      await BlogController.getPostPreview(req, res)
      // assert
      expect(sendNotFound).toHaveBeenCalledWith(req, res, 'Post not found')
    })

    it('should call sendOK with post on success', async () => {
      // arrange
      const mockPost = { id: 'post-1', title: 'Preview Post' }
      blogServiceMock.getPostForPreview.mockResolvedValueOnce(mockPost)
      req.params = { id: 'post-1' }
      // act
      await BlogController.getPostPreview(req, res)
      // assert
      expect(sendOK).toHaveBeenCalledWith(req, res, mockPost)
    })
  })

  // ─── getPublishedPosts ─────────────────────────────────────────────────────

  describe('getPublishedPosts', () => {
    it('should call sendOK with result on success', async () => {
      // arrange
      const mockResult = { items: [], nextCursor: null }
      blogServiceMock.getPublishedPosts.mockResolvedValueOnce(mockResult)
      req.query = { cursor: 'abc', limit: '5' }
      // act
      await BlogController.getPublishedPosts(req, res)
      // assert
      expect(sendOK).toHaveBeenCalledWith(req, res, mockResult)
    })

    it('should call sendBadRequest when service throws', async () => {
      // arrange
      blogServiceMock.getPublishedPosts.mockRejectedValueOnce(new Error('DB error'))
      // act
      await BlogController.getPublishedPosts(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })
  })

  // ─── getRelatedPosts ───────────────────────────────────────────────────────

  describe('getRelatedPosts', () => {
    it('should call sendBadRequest when id param is missing', async () => {
      // arrange
      req.params = {}
      // act
      await BlogController.getRelatedPosts(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalledWith(req, res, 'Post ID is required')
    })

    it('should call sendOK with related posts on success', async () => {
      // arrange
      const mockPosts = [{ id: 'post-2' }, { id: 'post-3' }]
      blogServiceMock.getRelatedPosts.mockResolvedValueOnce(mockPosts)
      req.params = { id: 'post-1' }
      req.query = { limit: '3' }
      // act
      await BlogController.getRelatedPosts(req, res)
      // assert
      expect(sendOK).toHaveBeenCalledWith(req, res, mockPosts)
    })
  })

  // ─── getTags ───────────────────────────────────────────────────────────────

  describe('getTags', () => {
    it('should call sendOK with tags on success', async () => {
      // arrange
      const mockTags = [{ id: 'tag-1', name: 'TypeScript' }]
      blogServiceMock.getTags.mockResolvedValueOnce(mockTags)
      // act
      await BlogController.getTags(req, res)
      // assert
      expect(sendOK).toHaveBeenCalledWith(req, res, mockTags)
    })

    it('should call sendBadRequest when service throws', async () => {
      // arrange
      blogServiceMock.getTags.mockRejectedValueOnce(new Error('DB error'))
      // act
      await BlogController.getTags(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })
  })

  // ─── publishPost ───────────────────────────────────────────────────────────

  describe('publishPost', () => {
    it('should call sendBadRequest when id param is missing', async () => {
      // arrange
      req.params = {}
      // act
      await BlogController.publishPost(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalledWith(req, res, 'Post ID is required')
    })

    it('should call sendOK with published post on success', async () => {
      // arrange
      const mockPost = { id: 'post-1', status: 'published' }
      blogServiceMock.publishPost.mockResolvedValueOnce(mockPost)
      req.params = { id: 'post-1' }
      // act
      await BlogController.publishPost(req, res)
      // assert
      expect(sendOK).toHaveBeenCalledWith(req, res, mockPost)
    })
  })

  // ─── schedulePost ──────────────────────────────────────────────────────────

  describe('schedulePost', () => {
    it('should call sendBadRequest when id param is missing', async () => {
      // arrange
      req.params = {}
      req.body = { scheduledAt: '2026-06-01T10:00:00Z' }
      // act
      await BlogController.schedulePost(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalledWith(req, res, 'Post ID is required')
    })

    it('should call sendBadRequest when scheduledAt is an invalid date', async () => {
      // arrange
      req.params = { id: 'post-1' }
      req.body = { scheduledAt: 'not-a-date' }
      // act
      await BlogController.schedulePost(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalledWith(req, res, 'Invalid scheduledAt date')
    })

    it('should call sendOK with scheduled post on success', async () => {
      // arrange
      const mockPost = { id: 'post-1', scheduledAt: '2026-06-01T10:00:00Z' }
      blogServiceMock.schedulePost.mockResolvedValueOnce(mockPost)
      req.params = { id: 'post-1' }
      req.body = { scheduledAt: '2026-06-01T10:00:00Z' }
      // act
      await BlogController.schedulePost(req, res)
      // assert
      expect(sendOK).toHaveBeenCalledWith(req, res, mockPost)
    })
  })

  // ─── unpublishPost ─────────────────────────────────────────────────────────

  describe('unpublishPost', () => {
    it('should call sendBadRequest when id param is missing', async () => {
      // arrange
      req.params = {}
      // act
      await BlogController.unpublishPost(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalledWith(req, res, 'Post ID is required')
    })

    it('should call sendOK with unpublished post on success', async () => {
      // arrange
      const mockPost = { id: 'post-1', status: 'draft' }
      blogServiceMock.unpublishPost.mockResolvedValueOnce(mockPost)
      req.params = { id: 'post-1' }
      // act
      await BlogController.unpublishPost(req, res)
      // assert
      expect(sendOK).toHaveBeenCalledWith(req, res, mockPost)
    })
  })

  // ─── unschedulePost ────────────────────────────────────────────────────────

  describe('unschedulePost', () => {
    it('should call sendBadRequest when id param is missing', async () => {
      // arrange
      req.params = {}
      // act
      await BlogController.unschedulePost(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalledWith(req, res, 'Post ID is required')
    })

    it('should call sendOK with unscheduled post on success', async () => {
      // arrange
      const mockPost = { id: 'post-1', scheduledAt: null }
      blogServiceMock.unschedulePost.mockResolvedValueOnce(mockPost)
      req.params = { id: 'post-1' }
      // act
      await BlogController.unschedulePost(req, res)
      // assert
      expect(sendOK).toHaveBeenCalledWith(req, res, mockPost)
    })
  })

  // ─── updatePost ────────────────────────────────────────────────────────────

  describe('updatePost', () => {
    it('should call sendBadRequest when token is missing', async () => {
      // arrange
      const { HeaderService } = jest.requireMock('@dx3/api-libs/headers/header.service')
      HeaderService.getTokenFromRequest.mockReturnValueOnce(null)
      req.params = { id: 'post-1' }
      // act
      await BlogController.updatePost(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalledWith(req, res, 'Authentication required')
    })

    it('should call sendBadRequest when editorId cannot be extracted from token', async () => {
      // arrange
      const { TokenService } = jest.requireMock('@dx3/api-libs/auth/tokens/token.service')
      TokenService.getUserIdFromToken.mockReturnValueOnce(null)
      req.params = { id: 'post-1' }
      // act
      await BlogController.updatePost(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalledWith(req, res, 'Invalid token')
    })

    it('should call sendBadRequest when id param is missing', async () => {
      // arrange
      req.params = {}
      // act
      await BlogController.updatePost(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalledWith(req, res, 'Post ID is required')
    })

    it('should call sendOK with updated post on success', async () => {
      // arrange
      const mockPost = { id: 'post-1', title: 'Updated' }
      blogServiceMock.updatePost.mockResolvedValueOnce(mockPost)
      req.params = { id: 'post-1' }
      req.body = { title: 'Updated' }
      // act
      await BlogController.updatePost(req, res)
      // assert
      expect(sendOK).toHaveBeenCalledWith(req, res, mockPost)
    })
  })
})
