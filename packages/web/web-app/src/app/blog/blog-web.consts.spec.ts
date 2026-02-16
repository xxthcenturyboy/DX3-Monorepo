import { BLOG_ENTITY_NAME, BLOG_ROUTES } from './blog-web.consts'

describe('blog-web.consts', () => {
  describe('BLOG_ENTITY_NAME', () => {
    it('should equal blog', () => {
      expect(BLOG_ENTITY_NAME).toEqual('blog')
    })
  })

  describe('BLOG_ROUTES', () => {
    it('should have all route keys', () => {
      expect(BLOG_ROUTES.MAIN).toEqual('/blog')
      expect(BLOG_ROUTES.POST).toEqual('/blog')
    })
  })
})
