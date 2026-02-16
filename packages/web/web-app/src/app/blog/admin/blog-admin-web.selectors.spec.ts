/**
 * Blog Editor Selectors Tests
 */

import { BLOG_POST_STATUS } from '@dx3/models-shared'

import type { RootState } from '../../store/store-web.redux'
import { setupStore } from '../../store/testing/testing.store'
import { blogEditorBodyInitialState } from './blog-admin-web-body.reducer'
import { blogEditorListInitialState } from './blog-admin-web-list.reducer'
import {
  selectBlogEditorBodyDirty,
  selectBlogEditorContent,
  selectBlogEditorFilterValue,
  selectBlogEditorIsDirty,
  selectBlogEditorLimit,
  selectBlogEditorOffset,
  selectBlogEditorOrderBy,
  selectBlogEditorQueryParams,
  selectBlogEditorSettings,
  selectBlogEditorSortDir,
  selectBlogEditorStatus,
  selectBlogEditorTitle,
} from './blog-admin-web.selectors'

const createMockState = (
  bodyOverrides: Partial<typeof blogEditorBodyInitialState> = {},
  listOverrides: Partial<typeof blogEditorListInitialState> = {},
): RootState => {
  const store = setupStore({
    blogEditorBody: { ...blogEditorBodyInitialState, ...bodyOverrides },
    blogEditorList: { ...blogEditorListInitialState, ...listOverrides },
  })
  return store.getState() as unknown as RootState
}

describe('blog admin selectors', () => {
  describe('selectBlogEditorContent', () => {
    it('should return content from body state', () => {
      const state = createMockState({ content: 'Hello world' })
      expect(selectBlogEditorContent(state)).toBe('Hello world')
    })
  })

  describe('selectBlogEditorTitle', () => {
    it('should return title from body state', () => {
      const state = createMockState({ title: 'My Post' })
      expect(selectBlogEditorTitle(state)).toBe('My Post')
    })
  })

  describe('selectBlogEditorBodyDirty', () => {
    it('should return false when title and content match initial', () => {
      const state = createMockState({
        content: 'Same',
        initialContent: 'Same',
        initialTitle: 'Title',
        title: 'Title',
      })
      expect(selectBlogEditorBodyDirty(state)).toBe(false)
    })

    it('should return true when title differs from initial', () => {
      const state = createMockState({
        content: 'Same',
        initialContent: 'Same',
        initialTitle: 'Original',
        title: 'Edited',
      })
      expect(selectBlogEditorBodyDirty(state)).toBe(true)
    })

    it('should return true when content differs from initial', () => {
      const state = createMockState({
        content: 'Edited',
        initialContent: 'Original',
        initialTitle: 'Title',
        title: 'Title',
      })
      expect(selectBlogEditorBodyDirty(state)).toBe(true)
    })
  })

  describe('selectBlogEditorIsDirty', () => {
    it('should mirror selectBlogEditorBodyDirty', () => {
      const cleanState = createMockState({
        content: 'C',
        initialContent: 'C',
        initialTitle: 'T',
        title: 'T',
      })
      const dirtyState = createMockState({
        content: 'X',
        initialContent: 'C',
        initialTitle: 'T',
        title: 'T',
      })
      expect(selectBlogEditorIsDirty(cleanState)).toBe(false)
      expect(selectBlogEditorIsDirty(dirtyState)).toBe(true)
    })
  })

  describe('selectBlogEditorFilterValue', () => {
    it('should return filter value from list state', () => {
      const state = createMockState({}, { filterValue: 'search' })
      expect(selectBlogEditorFilterValue(state)).toBe('search')
    })
  })

  describe('selectBlogEditorLimit', () => {
    it('should return limit from list state', () => {
      const state = createMockState({}, { limit: 50 })
      expect(selectBlogEditorLimit(state)).toBe(50)
    })
  })

  describe('selectBlogEditorOffset', () => {
    it('should return offset from list state', () => {
      const state = createMockState({}, { offset: 25 })
      expect(selectBlogEditorOffset(state)).toBe(25)
    })
  })

  describe('selectBlogEditorOrderBy', () => {
    it('should return orderBy from list state', () => {
      const state = createMockState({}, { orderBy: 'title' })
      expect(selectBlogEditorOrderBy(state)).toBe('title')
    })
  })

  describe('selectBlogEditorSortDir', () => {
    it('should return sortDir from list state', () => {
      const state = createMockState({}, { sortDir: 'ASC' })
      expect(selectBlogEditorSortDir(state)).toBe('ASC')
    })
  })

  describe('selectBlogEditorStatus', () => {
    it('should return status from list state', () => {
      const state = createMockState({}, { status: BLOG_POST_STATUS.DRAFT })
      expect(selectBlogEditorStatus(state)).toBe(BLOG_POST_STATUS.DRAFT)
    })
  })

  describe('selectBlogEditorSettings', () => {
    it('should return full settings state', () => {
      const state = createMockState()
      const settings = selectBlogEditorSettings(state)
      expect(settings).toBeDefined()
      expect(settings.slug).toBeDefined()
      expect(settings.excerpt).toBeDefined()
    })
  })

  describe('selectBlogEditorQueryParams', () => {
    it('should build query params object', () => {
      const state = createMockState({}, {
        filterValue: 'test',
        limit: 10,
        offset: 20,
        orderBy: 'publishedAt',
        sortDir: 'ASC',
        status: BLOG_POST_STATUS.PUBLISHED,
      })
      const params = selectBlogEditorQueryParams(state)
      expect(params).toEqual({
        filterValue: 'test',
        limit: 10,
        offset: 20,
        orderBy: 'publishedAt',
        sortDir: 'ASC',
        status: BLOG_POST_STATUS.PUBLISHED,
      })
    })

    it('should convert empty filterValue and status to undefined', () => {
      const state = createMockState({}, {
        filterValue: '',
        limit: 25,
        offset: 0,
        orderBy: 'createdAt',
        sortDir: 'DESC',
        status: '',
      })
      const params = selectBlogEditorQueryParams(state)
      expect(params.filterValue).toBeUndefined()
      expect(params.status).toBeUndefined()
    })
  })
})
