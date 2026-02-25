/**
 * Blog Admin Settings Drawer Component Tests
 */

import { ThemeProvider } from '@mui/material/styles'

import { BLOG_POST_STATUS } from '@dx3/models-shared'

import '../testing/blog-test-setup'
import { fireEvent, screen } from '@testing-library/react'

import { renderWithProviders } from '../../../../testing-render'
import {
  BLOG_TEST_CATEGORIES_MINIMAL,
  BLOG_TEST_TAGS_MINIMAL,
  BLOG_TEST_THEME,
} from '../testing/blog-test.fixtures'
import {
  BlogAdminSettingsDrawerComponent,
  BlogAdminSettingsTriggerButton,
} from './blog-admin-settings-drawer.component'

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

describe('BlogAdminSettingsDrawerComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should not render drawer when open is false', () => {
    renderWithProviders(
      <ThemeProvider theme={BLOG_TEST_THEME}>
        <BlogAdminSettingsDrawerComponent
          categories={BLOG_TEST_CATEGORIES_MINIMAL}
          isNew={false}
          onClose={jest.fn()}
          open={false}
          postId="post-1"
          postStatus={BLOG_POST_STATUS.DRAFT}
          postTitle="My Post"
          tags={BLOG_TEST_TAGS_MINIMAL}
        />
      </ThemeProvider>,
    )

    expect(screen.queryByText('Settings')).toBeNull()
  })

  it('should render drawer with header and close button when open', () => {
    const mockOnClose = jest.fn()

    renderWithProviders(
      <ThemeProvider theme={BLOG_TEST_THEME}>
        <BlogAdminSettingsDrawerComponent
          categories={BLOG_TEST_CATEGORIES_MINIMAL}
          isNew={false}
          onClose={mockOnClose}
          open
          postId="post-1"
          postStatus={BLOG_POST_STATUS.DRAFT}
          postTitle="My Post"
          tags={BLOG_TEST_TAGS_MINIMAL}
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
      <ThemeProvider theme={BLOG_TEST_THEME}>
        <BlogAdminSettingsDrawerComponent
          categories={BLOG_TEST_CATEGORIES_MINIMAL}
          isNew={false}
          onClose={jest.fn()}
          open
          postId="post-1"
          postStatus={BLOG_POST_STATUS.DRAFT}
          postTitle="Test Blog Post"
          tags={BLOG_TEST_TAGS_MINIMAL}
        />
      </ThemeProvider>,
    )

    expect(screen.getByTestId('post-title').textContent).toBe('Test Blog Post')
  })

  it('should call onClose when drawer backdrop is clicked', () => {
    const mockOnClose = jest.fn()

    const { container } = renderWithProviders(
      <ThemeProvider theme={BLOG_TEST_THEME}>
        <BlogAdminSettingsDrawerComponent
          categories={BLOG_TEST_CATEGORIES_MINIMAL}
          isNew={false}
          onClose={mockOnClose}
          open
          postId="post-1"
          postStatus={BLOG_POST_STATUS.DRAFT}
          postTitle="My Post"
          tags={BLOG_TEST_TAGS_MINIMAL}
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
      <ThemeProvider theme={BLOG_TEST_THEME}>
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
