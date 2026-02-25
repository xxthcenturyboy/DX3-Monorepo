/**
 * Blog Schedule Dialog Component Tests
 */

import { ThemeProvider } from '@mui/material/styles'

import '../testing/blog-test-setup'
import { fireEvent, screen } from '@testing-library/react'

import { renderWithProviders } from '../../../../testing-render'
import { BLOG_TEST_THEME } from '../testing/blog-test.fixtures'
import { clearStoreTranslations, setStoreTranslations } from '../testing/blog-test-mocks'
import { BlogScheduleDialogComponent } from './blog-schedule-dialog.component'

const mockOnClose = jest.fn()
const mockOnSuccess = jest.fn()
const mockSchedulePost = jest.fn().mockReturnValue({
  unwrap: () => Promise.resolve({}),
})

jest.mock('../blog-web.api', () => ({
  useScheduleBlogPostMutation: () => [mockSchedulePost],
}))

describe('BlogScheduleDialogComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setStoreTranslations({
      BLOG_SCHEDULE_TZ_OTHER: 'Other timezones',
      BLOG_SCHEDULE_TZ_YOURS: 'Your timezone',
    })
  })

  afterEach(() => {
    clearStoreTranslations()
  })

  it('should not show dialog when open is false', () => {
    renderWithProviders(
      <ThemeProvider theme={BLOG_TEST_THEME}>
        <BlogScheduleDialogComponent
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          open={false}
          postId={null}
          postTitle=""
        />
      </ThemeProvider>,
    )

    const dialog = screen.queryByRole('dialog')
    expect(dialog).toBeNull()
  })

  it('should render form when open and postId provided', () => {
    renderWithProviders(
      <ThemeProvider theme={BLOG_TEST_THEME}>
        <BlogScheduleDialogComponent
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          open
          postId="post-1"
          postTitle="My Blog Post"
        />
      </ThemeProvider>,
    )

    expect(screen.getByText('Schedule Publish')).toBeTruthy()
    expect(screen.getByText('My Blog Post')).toBeTruthy()
    expect(screen.getByText('Post')).toBeTruthy()
    expect(screen.getByLabelText(/Date & Time/)).toBeTruthy()
    expect(screen.getByLabelText(/Timezone/)).toBeTruthy()
    expect(screen.getByText('Cancel')).toBeTruthy()
    expect(screen.getByText('Confirm')).toBeTruthy()
  })

  it('should call onClose when Cancel clicked', () => {
    renderWithProviders(
      <ThemeProvider theme={BLOG_TEST_THEME}>
        <BlogScheduleDialogComponent
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          open
          postId="post-1"
          postTitle="Test"
        />
      </ThemeProvider>,
    )

    fireEvent.click(screen.getByText('Cancel'))
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should call schedulePost when Confirm clicked', async () => {
    renderWithProviders(
      <ThemeProvider theme={BLOG_TEST_THEME}>
        <BlogScheduleDialogComponent
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          open
          postId="post-1"
          postTitle="Test"
        />
      </ThemeProvider>,
    )

    fireEvent.click(screen.getByText('Confirm'))
    expect(mockSchedulePost).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'post-1',
        payload: expect.objectContaining({ scheduledAt: expect.any(String) }),
      }),
    )
  })
})
