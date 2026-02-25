/**
 * Blog Editor List Reducer Tests
 */

import { BLOG_POST_STATUS } from '@dx3/models-shared'

import {
  blogEditorListActions,
  blogEditorListInitialState,
  blogEditorListReducer,
} from './blog-admin-web-list.reducer'

describe('blogEditorListReducer', () => {
  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = blogEditorListReducer(undefined, { type: '@@INIT' })

      expect(state.filterValue).toBe('')
      expect(state.limit).toBe(25)
      expect(state.offset).toBe(0)
      expect(state.orderBy).toBe('createdAt')
      expect(state.sortDir).toBe('DESC')
      expect(state.status).toBe('')
    })
  })

  describe('filterValueSet', () => {
    it('should set filter value', () => {
      const state = blogEditorListReducer(
        blogEditorListInitialState,
        blogEditorListActions.filterValueSet('search term'),
      )
      expect(state.filterValue).toBe('search term')
    })
  })

  describe('limitSet', () => {
    it('should set limit', () => {
      const state = blogEditorListReducer(
        blogEditorListInitialState,
        blogEditorListActions.limitSet(50),
      )
      expect(state.limit).toBe(50)
    })
  })

  describe('offsetSet', () => {
    it('should set offset', () => {
      const state = blogEditorListReducer(
        blogEditorListInitialState,
        blogEditorListActions.offsetSet(25),
      )
      expect(state.offset).toBe(25)
    })
  })

  describe('orderBySet', () => {
    it('should set order by', () => {
      const state = blogEditorListReducer(
        blogEditorListInitialState,
        blogEditorListActions.orderBySet('title'),
      )
      expect(state.orderBy).toBe('title')
    })
  })

  describe('sortDirSet', () => {
    it('should set sort direction to ASC', () => {
      const state = blogEditorListReducer(
        blogEditorListInitialState,
        blogEditorListActions.sortDirSet('ASC'),
      )
      expect(state.sortDir).toBe('ASC')
    })

    it('should set sort direction to DESC', () => {
      const state = blogEditorListReducer(
        blogEditorListInitialState,
        blogEditorListActions.sortDirSet('DESC'),
      )
      expect(state.sortDir).toBe('DESC')
    })
  })

  describe('statusSet', () => {
    it('should set status filter', () => {
      const state = blogEditorListReducer(
        blogEditorListInitialState,
        blogEditorListActions.statusSet(BLOG_POST_STATUS.DRAFT),
      )
      expect(state.status).toBe(BLOG_POST_STATUS.DRAFT)
    })

    it('should clear status with empty string', () => {
      const withStatus = blogEditorListReducer(
        blogEditorListInitialState,
        blogEditorListActions.statusSet(BLOG_POST_STATUS.PUBLISHED),
      )
      const state = blogEditorListReducer(withStatus, blogEditorListActions.statusSet(''))
      expect(state.status).toBe('')
    })
  })
})
