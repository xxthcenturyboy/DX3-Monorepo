import { BLOG_EDITOR_ENTITY_NAME, BLOG_EDITOR_ROUTES } from './blog-admin-web.consts'

describe('blog-admin-web.consts', () => {
  describe('BLOG_EDITOR_ENTITY_NAME', () => {
    it('should equal blogEditor', () => {
      expect(BLOG_EDITOR_ENTITY_NAME).toEqual('blogEditor')
    })
  })

  describe('BLOG_EDITOR_ROUTES', () => {
    it('should have all route keys', () => {
      expect(BLOG_EDITOR_ROUTES.EDIT).toEqual('/blog-editor/edit')
      expect(BLOG_EDITOR_ROUTES.LIST).toEqual('/blog-editor')
      expect(BLOG_EDITOR_ROUTES.MAIN).toEqual('/blog-editor')
      expect(BLOG_EDITOR_ROUTES.NEW).toEqual('/blog-editor/new')
      expect(BLOG_EDITOR_ROUTES.PREVIEW).toEqual('/blog-editor/preview')
    })

    it('should have consistent base path', () => {
      expect(BLOG_EDITOR_ROUTES.MAIN).toEqual(BLOG_EDITOR_ROUTES.LIST)
    })
  })
})
