/**
 * Blog Editor Body Reducer Tests
 */

import {
  blogEditorBodyActions,
  blogEditorBodyInitialState,
  blogEditorBodyReducer,
} from './blog-admin-web-body.reducer'

describe('blogEditorBodyReducer', () => {
  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = blogEditorBodyReducer(undefined, { type: '@@INIT' })

      expect(state.content).toBe('')
      expect(state.initialContent).toBe('')
      expect(state.initialTitle).toBe('')
      expect(state.title).toBe('')
    })
  })

  describe('bodyFormLoad', () => {
    it('should load content and title into state and initial values', () => {
      const state = blogEditorBodyReducer(blogEditorBodyInitialState,
        blogEditorBodyActions.bodyFormLoad({
          content: '# Hello\n\nParagraph',
          title: 'My Post',
        }),
      )

      expect(state.content).toBe('# Hello\n\nParagraph')
      expect(state.initialContent).toBe('# Hello\n\nParagraph')
      expect(state.title).toBe('My Post')
      expect(state.initialTitle).toBe('My Post')
    })
  })

  describe('contentSet', () => {
    it('should update content without changing initial', () => {
      const loadedState = blogEditorBodyReducer(blogEditorBodyInitialState,
        blogEditorBodyActions.bodyFormLoad({ content: 'Original', title: 'T' }),
      )
      const state = blogEditorBodyReducer(loadedState,
        blogEditorBodyActions.contentSet('Edited content'),
      )

      expect(state.content).toBe('Edited content')
      expect(state.initialContent).toBe('Original')
    })
  })

  describe('titleSet', () => {
    it('should update title without changing initial', () => {
      const loadedState = blogEditorBodyReducer(blogEditorBodyInitialState,
        blogEditorBodyActions.bodyFormLoad({ content: 'C', title: 'Original Title' }),
      )
      const state = blogEditorBodyReducer(loadedState,
        blogEditorBodyActions.titleSet('New Title'),
      )

      expect(state.title).toBe('New Title')
      expect(state.initialTitle).toBe('Original Title')
    })
  })
})
