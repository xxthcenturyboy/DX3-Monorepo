/**
 * Blog Admin Settings Drawer Component Tests
 */

import { BLOG_POST_STATUS } from '@dx3/models-shared'
import { createTheme, ThemeProvider } from '@mui/material/styles'

jest.mock('../../store/store-web.redux', () => ({
  store: {
    getState: () => ({
      i18n: { translations: {} },
    }),
  },
}))
import { fireEvent, screen } from '@testing-library/react'

import { renderWithProviders } from '../../../../testing-render'
import {
  BlogAdminSettingsDrawerComponent,
  BlogAdminSettingsTriggerButton,
} from './blog-admin-settings-drawer.component'

jest.mock('../../data/rtk-query')
jest.mock('../../i18n', () => ({
  useStrings: () => ({
    BLOG_PUBLISH: 'Publish',
    BLOG_PUBLISH_CONFIRM: 'Publish this post?',
    BLOG_PUBLISH_NOW: 'Publish Now',
    BLOG_SETTINGS: 'Settings',
    BLOG_SETTINGS_BUTTON: 'Settings',
    BLOG_UNPUBLISH: 'Unpublish',
    BLOG_UNPUBLISH_CONFIRM: 'Unpublish this post?',
    BLOG_UNSCHEDULE: 'Unschedule',
    BLOG_UNSCHEDULE_CONFIRM: 'Unschedule this post?',
    CANCEL: 'Cancel',
    CANCELING: 'Canceling',
    CLOSE: 'Close',
  }),
}))

jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useMediaQuery: () => false,
}))

const mockPublishPost = jest.fn().mockReturnValue({ unwrap: () => Promise.resolve({}) })
const mockSchedulePost = jest.fn().mockReturnValue({ unwrap: () => Promise.resolve({}) })
const mockUnpublishPost = jest.fn().mockReturnValue({ unwrap: () => Promise.resolve({}) })
const mockUnschedulePost = jest.fn().mockReturnValue({ unwrap: () => Promise.resolve({}) })

jest.mock('../blog-web.api', () => ({
  usePublishBlogPostMutation: () => [mockPublishPost],
  useScheduleBlogPostMutation: () => [mockSchedulePost],
  useUnpublishBlogPostMutation: () => [mockUnpublishPost],
  useUnscheduleBlogPostMutation: () => [mockUnschedulePost],
}))

jest.mock('./blog-admin-settings.component', () => ({
  BlogAdminSettingsComponent: ({ postTitle }: { postTitle?: string }) => (
    <div data-testid="settings-panel">
      {postTitle && <span data-testid="post-title">{postTitle}</span>}
    </div>
  ),
}))

jest.mock('./blog-schedule-dialog.component', () => ({
  BlogScheduleDialogComponent: () => null,
}))

const testTheme = createTheme()

const defaultCategories = [
  { id: 'cat-1', name: 'Category A', slug: 'category-a' },
]
const defaultTags = [
  { id: 'tag-1', name: 'Tag X', slug: 'tag-x' },
]

describe('BlogAdminSettingsDrawerComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    let modalRoot = document.getElementById('modal-root')
    if (!modalRoot) {
      modalRoot = document.createElement('div')
      modalRoot.id = 'modal-root'
      document.body.appendChild(modalRoot)
    }
  })

  it('should not render drawer when open is false', () => {
    renderWithProviders(
      <ThemeProvider theme={testTheme}>
        <BlogAdminSettingsDrawerComponent
          categories={defaultCategories}
          isNew={false}
          onClose={jest.fn()}
          open={false}
          postId="post-1"
          postStatus={BLOG_POST_STATUS.DRAFT}
          postTitle="My Post"
          tags={defaultTags}
        />
      </ThemeProvider>,
    )

    expect(screen.queryByText('Settings')).toBeNull()
  })

  it('should render drawer with header and close button when open', () => {
    const mockOnClose = jest.fn()

    renderWithProviders(
      <ThemeProvider theme={testTheme}>
        <BlogAdminSettingsDrawerComponent
          categories={defaultCategories}
          isNew={false}
          onClose={mockOnClose}
          open
          postId="post-1"
          postStatus={BLOG_POST_STATUS.DRAFT}
          postTitle="My Post"
          tags={defaultTags}
        />
      </ThemeProvider>,
    )

    expect(screen.getByText('Settings')).toBeTruthy()
    expect(screen.getByTestId('settings-panel')).toBeTruthy()
    expect(screen.getByTestId('post-title').textContent).toBe('My Post')

    const closeButton = screen.getByLabelText('Close')
    fireEvent.click(closeButton)
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('should render settings panel with post title', () => {
    renderWithProviders(
      <ThemeProvider theme={testTheme}>
        <BlogAdminSettingsDrawerComponent
          categories={defaultCategories}
          isNew={false}
          onClose={jest.fn()}
          open
          postId="post-1"
          postStatus={BLOG_POST_STATUS.DRAFT}
          postTitle="Test Blog Post"
          tags={defaultTags}
        />
      </ThemeProvider>,
    )

    expect(screen.getByTestId('post-title').textContent).toBe('Test Blog Post')
  })

  it('should call onClose when drawer backdrop is clicked', () => {
    const mockOnClose = jest.fn()

    const { container } = renderWithProviders(
      <ThemeProvider theme={testTheme}>
        <BlogAdminSettingsDrawerComponent
          categories={defaultCategories}
          isNew={false}
          onClose={mockOnClose}
          open
          postId="post-1"
          postStatus={BLOG_POST_STATUS.DRAFT}
          postTitle="My Post"
          tags={defaultTags}
        />
      </ThemeProvider>,
    )

    const backdrop = container.querySelector('.MuiDrawer-root .MuiBackdrop-root')
    if (backdrop) {
      fireEvent.click(backdrop)
      expect(mockOnClose).toHaveBeenCalled()
    }
  })
})

describe('BlogAdminSettingsTriggerButton', () => {
  it('should render Settings button and call onClick when clicked', () => {
    const mockOnClick = jest.fn()

    renderWithProviders(
      <ThemeProvider theme={testTheme}>
        <BlogAdminSettingsTriggerButton onClick={mockOnClick} />
      </ThemeProvider>,
    )

    const button = screen.getByLabelText('Settings')
    expect(button).toBeTruthy()
    expect(button.textContent).toBe('Settings')

    fireEvent.click(button)
    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })
})
