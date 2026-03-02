import { BlogRoutes } from './blog-api.routes'

jest.mock('@dx3/api-libs/auth/middleware/ensure-logged-in.middleware', () => ({
  ensureLoggedIn: jest.fn((_req: unknown, _res: unknown, next: () => void) => next()),
}))
jest.mock('@dx3/api-libs/auth/middleware/ensure-role.middleware', () => ({
  hasEditorRole: jest.fn((_req: unknown, _res: unknown, next: () => void) => next()),
}))
jest.mock('@dx3/api-libs/blog/blog-api.validation', () => ({
  blogPostParamsSchema: {},
  blogPostSlugParamsSchema: {},
  createBlogPostBodySchema: {},
  getBlogPostsAdminQuerySchema: {},
  getBlogPostsQuerySchema: {},
  scheduleBlogPostBodySchema: {},
  updateBlogPostBodySchema: {},
}))
jest.mock('@dx3/api-libs/validation/validate-request.middleware', () => ({
  validateRequest: jest.fn(() => (_req: unknown, _res: unknown, next: () => void) => next()),
}))

describe('BlogRoutes', () => {
  it('should exist when imported', () => {
    expect(BlogRoutes).toBeDefined()
  })

  it('should have static configure method', () => {
    expect(BlogRoutes.configure).toBeDefined()
  })

  it('should return a router when configure is invoked', () => {
    // arrange
    // act
    const router = BlogRoutes.configure()
    // assert
    expect(router).toBeDefined()
    expect(typeof router).toBe('function')
  })
})
