/**
 * Blog Admin Editor Component Tests
 */

import { ThemeProvider } from '@mui/material/styles'

import '../testing/blog-test-setup'
import { screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'

import { renderWithProviders } from '../../../../testing-render'
import { AUTH_PRELOADED_STATE, BLOG_TEST_THEME } from '../testing/blog-test.fixtures'
import { BlogAdminEditorComponent } from './blog-admin-web-editor.component'

const mockCreatePost = jest.fn()
const mockPublishPost = jest.fn()
const mockSchedulePost = jest.fn().mockReturnValue({ unwrap: () => Promise.resolve({}) })
const mockUnpublishPost = jest.fn()
const mockUnschedulePost = jest.fn()
const mockUpdatePost = jest.fn()
const mockUploadContent = jest.fn()

jest.mock('../blog-web.api', () => ({
  useCreateBlogPostMutation: () => [mockCreatePost, { isLoading: false }],
  useGetBlogAdminPostByIdQuery: jest.fn().mockReturnValue({
    data: undefined,
    isLoading: false,
  }),
  useGetBlogCategoriesQuery: () => ({ data: [] }),
  useGetBlogTagsQuery: () => ({ data: [] }),
  usePublishBlogPostMutation: () => [mockPublishPost],
  useScheduleBlogPostMutation: () => [mockSchedulePost],
  useUnpublishBlogPostMutation: () => [mockUnpublishPost],
  useUnscheduleBlogPostMutation: () => [mockUnschedulePost],
  useUpdateBlogPostMutation: () => [mockUpdatePost, { isLoading: false }],
}))

jest.mock('../../media/media-web.api', () => ({
  useUploadContentMutation: () => [mockUploadContent],
}))

jest.mock('@mdxeditor/editor', () => ({
  BlockTypeSelect: () => null,
  BoldItalicUnderlineToggles: () => null,
  CreateLink: () => null,
  headingsPlugin: () => ({}),
  InsertThematicBreak: () => null,
  imagePlugin: () => ({}),
  ListsToggle: () => null,
  linkDialogPlugin: () => ({}),
  linkPlugin: () => ({}),
  listsPlugin: () => ({}),
  MDXEditor: () => <div data-testid="mdx-editor-mock">MDXEditor</div>,
  markdownShortcutPlugin: () => ({}),
  quotePlugin: () => ({}),
  thematicBreakPlugin: () => ({}),
  toolbarPlugin: () => ({}),
  UndoRedo: () => null,
}))

describe('BlogAdminEditorComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render new post editor at /new route', () => {
    renderWithProviders(
      <ThemeProvider theme={BLOG_TEST_THEME}>
        <MemoryRouter initialEntries={['/blog-editor/new']}>
          <Routes>
            <Route
              element={<BlogAdminEditorComponent />}
              path="/blog-editor/new"
            />
          </Routes>
        </MemoryRouter>
      </ThemeProvider>,
      { preloadedState: AUTH_PRELOADED_STATE },
    )

    expect(screen.getByTestId('mdx-editor-mock')).toBeTruthy()
  })
})
