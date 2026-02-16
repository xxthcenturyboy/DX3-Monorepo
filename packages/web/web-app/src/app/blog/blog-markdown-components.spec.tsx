import { blogMarkdownComponents } from './blog-markdown-components'

describe('blogMarkdownComponents', () => {
  it('should export custom a and img components', () => {
    expect(blogMarkdownComponents.a).toBeDefined()
    expect(blogMarkdownComponents.img).toBeDefined()
  })
})
