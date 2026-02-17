import '../testing/blog-test-setup'

import { blogEditorMenu } from './blog-editor.menu'

describe('blogEditorMenu', () => {
  it('should return menu config with blog editor item', () => {
    const menu = blogEditorMenu()

    expect(menu).toBeDefined()
    expect(menu.id).toBe('menu-blog-editor')
    expect(menu.items).toHaveLength(1)
    expect(menu.items[0].id).toBe('menu-item-blog-editor-posts')
  })

  it('should include pathMatches for edit routes', () => {
    const menu = blogEditorMenu()
    const item = menu.items[0]

    expect(item.pathMatches).toContain('/blog-editor/edit')
    expect(item.pathMatches).toContain('/blog-editor')
    expect(item.pathMatches).toContain('/blog-editor/new')
    expect(item.pathMatches).toContain('/blog-editor/preview')
  })

  it('should have EDITOR role restriction', () => {
    const menu = blogEditorMenu()
    expect(menu.items[0].restriction).toBe('EDITOR')
  })
})
