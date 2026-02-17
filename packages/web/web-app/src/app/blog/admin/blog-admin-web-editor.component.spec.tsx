/**
 * Blog Admin Editor Component Tests
 */

import { createTheme, ThemeProvider } from '@mui/material/styles'

jest.mock('../../store/store-web.redux', () => ({
  store: {
    getState: () => ({
      i18n: { translations: {} },
    }),
  },
}))
import { screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'

import { renderWithProviders } from '../../../../testing-render'
import { BlogAdminEditorComponent } from './blog-admin-web-editor.component'

jest.mock('../../data/rtk-query')
jest.mock('../../i18n', () => ({
  useStrings: () => ({
    ALIGN_CENTER: 'Center',
    ALIGN_LEFT: 'Left',
    ALIGN_RIGHT: 'Right',
    BLOG_DISCARD_CHANGES_CONFIRM: 'Discard changes?',
    BLOG_EDITOR_TITLE: 'Blog Editor',
    BLOG_EDIT_POST_TITLE: 'Edit Post',
    BLOG_IMAGE_UPLOAD_SAVE_POST_FIRST: 'Save post first',
    BLOG_INSERT_IMAGE: 'Insert Image',
    BLOG_INSERT_PDF: 'Insert PDF',
    BLOG_NEW_POST_TITLE: 'New Post',
    BLOG_PDF_UPLOAD_SAVE_POST_FIRST: 'Save post first',
    BLOG_UNPUBLISH_TO_EDIT: 'Unpublish to edit',
    BLOG_UPLOAD_FEATURED_IMAGE: 'Featured Image',
    CANCEL: 'Cancel',
    CANCELING: 'Canceling',
    DISCARD: 'Discard',
    PREVIEW: 'Preview',
    TITLE: 'Title',
  }),
  useTranslation: () => (key: string) => key,
}))

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

jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useMediaQuery: () => false,
}))

jest.mock('../../config/config-web.service', () => ({
  WebConfigService: {
    getWebUrls: () => ({
      API_URL: 'http://test.api',
      WEB_APP_URL: 'http://test.app',
    }),
  },
}))

const testTheme = createTheme()

describe('BlogAdminEditorComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    const modalRoot = document.getElementById('modal-root')
    if (!modalRoot) {
      const div = document.createElement('div')
      div.id = 'modal-root'
      document.body.appendChild(div)
    }
  })

  it('should render new post editor at /new route', () => {
    renderWithProviders(
      <ThemeProvider theme={testTheme}>
        <MemoryRouter initialEntries={['/blog-editor/new']}>
          <Routes>
            <Route
              path="/blog-editor/new"
              element={<BlogAdminEditorComponent />}
            />
          </Routes>
        </MemoryRouter>
      </ThemeProvider>,
      {
        preloadedState: {
          auth: {
            logoutResponse: false,
            password: '',
            token: 'test-token',
            userId: 'u1',
            username: 'u@example.com',
          },
        },
      },
    )

    expect(screen.getByTestId('mdx-editor-mock')).toBeTruthy()
  })
})
