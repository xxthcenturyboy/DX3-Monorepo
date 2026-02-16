/**
 * Blog Editor Settings Reducer Tests
 */

import {
  blogEditorSettingsActions,
  blogEditorSettingsInitialState,
  blogEditorSettingsReducer,
} from './blog-admin-web-settings.reducer'

describe('blogEditorSettingsReducer', () => {
  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = blogEditorSettingsReducer(undefined, { type: '@@INIT' })

      expect(state.canonicalUrl).toBe('')
      expect(state.categories).toEqual([])
      expect(state.excerpt).toBe('')
      expect(state.featuredImageId).toBe('')
      expect(state.isAnonymous).toBe(false)
      expect(state.seoDescription).toBe('')
      expect(state.seoTitle).toBe('')
      expect(state.slug).toBe('')
      expect(state.tags).toEqual([])
    })
  })

  describe('settingsFormLoad', () => {
    it('should load partial settings and merge with defaults', () => {
      const state = blogEditorSettingsReducer(blogEditorSettingsInitialState,
        blogEditorSettingsActions.settingsFormLoad({
          excerpt: 'Short excerpt',
          slug: 'my-post',
        }),
      )

      expect(state.slug).toBe('my-post')
      expect(state.excerpt).toBe('Short excerpt')
      expect(state.categories).toEqual([])
    })

    it('should reset to defaults when payload is undefined', () => {
      const modifiedState = {
        ...blogEditorSettingsInitialState,
        slug: 'old-slug',
        excerpt: 'old excerpt',
      }

      const state = blogEditorSettingsReducer(modifiedState,
        blogEditorSettingsActions.settingsFormLoad(undefined),
      )

      expect(state).toEqual(blogEditorSettingsInitialState)
    })
  })

  describe('settingsSet', () => {
    it('should apply partial updates', () => {
      const state = blogEditorSettingsReducer(blogEditorSettingsInitialState,
        blogEditorSettingsActions.settingsSet({
          excerpt: 'New excerpt',
          seoTitle: 'SEO Title',
        }),
      )

      expect(state.excerpt).toBe('New excerpt')
      expect(state.seoTitle).toBe('SEO Title')
      expect(state.slug).toBe('')
    })

    it('should merge multiple updates', () => {
      let state = blogEditorSettingsReducer(blogEditorSettingsInitialState,
        blogEditorSettingsActions.settingsSet({ slug: 'first' }),
      )
      state = blogEditorSettingsReducer(state,
        blogEditorSettingsActions.settingsSet({ excerpt: 'excerpt' }),
      )

      expect(state.slug).toBe('first')
      expect(state.excerpt).toBe('excerpt')
    })
  })
})
