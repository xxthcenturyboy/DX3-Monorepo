/**
 * Blog Schedule Dialog Component Tests
 */

import { createTheme, ThemeProvider } from '@mui/material/styles'

jest.mock('../../store/store-web.redux', () => ({
  store: {
    getState: () => ({
      i18n: {
        translations: {
          BLOG_SCHEDULE_TZ_OTHER: 'Other timezones',
          BLOG_SCHEDULE_TZ_YOURS: 'Your timezone',
        },
      },
    }),
  },
}))
import { fireEvent, screen } from '@testing-library/react'

import { renderWithProviders } from '../../../../testing-render'
import { BlogScheduleDialogComponent } from './blog-schedule-dialog.component'

jest.mock('../../data/rtk-query')
jest.mock('../../i18n', () => ({
  useStrings: () => ({
    BLOG_SCHEDULE_DATE: 'Date & Time',
    BLOG_SCHEDULE_IN_YOUR_TZ: 'In your timezone: {time}',
    BLOG_SCHEDULE_POST: 'Post',
    BLOG_SCHEDULE_PUBLISH: 'Schedule Publish',
    BLOG_SCHEDULE_TIMEZONE: 'Timezone',
    CANCEL: 'Cancel',
    CONFIRM: 'Confirm',
  }),
}))

jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useMediaQuery: () => false,
}))

const mockOnClose = jest.fn()
const mockOnSuccess = jest.fn()
const mockSchedulePost = jest.fn().mockReturnValue({
  unwrap: () => Promise.resolve({}),
})

jest.mock('../blog-web.api', () => ({
  useScheduleBlogPostMutation: () => [mockSchedulePost],
}))

const testTheme = createTheme()

describe('BlogScheduleDialogComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should not show dialog when open is false', () => {
    renderWithProviders(
      <ThemeProvider theme={testTheme}>
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
      <ThemeProvider theme={testTheme}>
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
      <ThemeProvider theme={testTheme}>
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
      <ThemeProvider theme={testTheme}>
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
