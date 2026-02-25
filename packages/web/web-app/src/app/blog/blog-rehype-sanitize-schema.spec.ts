import { blogRehypePlugins, blogRehypeSanitize } from './blog-rehype-sanitize-schema'

describe('blog-rehype-sanitize-schema', () => {
  describe('blogRehypeSanitize', () => {
    it('should be defined and be a function (plugin)', () => {
      expect(blogRehypeSanitize).toBeDefined()
      expect(typeof blogRehypeSanitize).toBe('function')
    })
  })

  describe('blogRehypePlugins', () => {
    it('should be array of two plugins', () => {
      expect(blogRehypePlugins).toHaveLength(2)
    })

    it('should have rehypeRaw first, sanitize second', () => {
      expect(typeof blogRehypePlugins[0]).toBe('function')
      expect(typeof blogRehypePlugins[1]).toBe('function')
    })
  })
})
