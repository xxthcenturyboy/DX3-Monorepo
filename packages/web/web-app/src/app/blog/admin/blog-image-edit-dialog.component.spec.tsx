/**
 * Blog Image Edit Dialog Component Tests
 */

import { ThemeProvider } from '@mui/material/styles'
import { fireEvent, screen } from '@testing-library/react'

import { renderWithProviders } from '../../../../testing-render'
import { BLOG_TEST_THEME } from '../testing/blog-test.fixtures'
import '../testing/blog-test-setup'

import { BlogImageEditDialog } from './blog-image-edit-dialog.component'

const mockSaveImage = jest.fn()
const mockCloseImageDialog = jest.fn()

const mockUseCellValues = jest.fn()
let usePublisherCallCount = 0

jest.mock('@mdxeditor/editor', () => ({
  closeImageDialog$: {},
  imageDialogState$: {},
  saveImage$: {},
}))

jest.mock('@mdxeditor/gurx', () => ({
  useCellValues: (...args: unknown[]) => mockUseCellValues(...args),
  usePublisher: () => {
    usePublisherCallCount += 1
    return usePublisherCallCount === 1 ? mockSaveImage : mockCloseImageDialog
  },
}))

describe('BlogImageEditDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    usePublisherCallCount = 0
    mockUseCellValues.mockReturnValue([
      {
        initialValues: {
          altText: 'Test alt',
          src: 'https://example.com/img.jpg',
          title: 'Test title',
        },
        type: 'editing',
      },
    ])
  })

  it('should return null when state is inactive', () => {
    mockUseCellValues.mockReturnValue([{ type: 'inactive' }])

    const { container } = renderWithProviders(
      <ThemeProvider theme={BLOG_TEST_THEME}>
        <BlogImageEditDialog />
      </ThemeProvider>,
    )

    expect(container.firstChild).toBeNull()
  })

  it('should render editing dialog when state is editing', () => {
    mockUseCellValues.mockReturnValue([
      {
        initialValues: {
          altText: 'Test alt',
          src: 'https://example.com/img.jpg',
          title: 'Test title',
        },
        type: 'editing',
      },
    ])

    renderWithProviders(
      <ThemeProvider theme={BLOG_TEST_THEME}>
        <BlogImageEditDialog />
      </ThemeProvider>,
    )

    expect(screen.getByText('Edit Image')).toBeTruthy()
    expect(screen.getByLabelText(/Alt text/)).toBeTruthy()
    expect(screen.getByLabelText(/Alignment/)).toBeTruthy()
    expect(screen.getByLabelText(/Title/)).toBeTruthy()
    expect(screen.getByText('Save')).toBeTruthy()
    expect(screen.getByText('Cancel')).toBeTruthy()
  })

  it('should render new image dialog when state is new', () => {
    mockUseCellValues.mockReturnValue([{ type: 'new' }])

    renderWithProviders(
      <ThemeProvider theme={BLOG_TEST_THEME}>
        <BlogImageEditDialog />
      </ThemeProvider>,
    )

    expect(screen.getByText('Edit Image')).toBeTruthy()
    expect(screen.getByText('Use toolbar to add images')).toBeTruthy()
    expect(screen.getByText('Cancel')).toBeTruthy()
  })

  it('should call closeImageDialog when Cancel clicked in editing mode', () => {
    mockUseCellValues.mockReturnValue([
      {
        initialValues: {
          altText: '',
          src: 'https://img.jpg',
          title: '',
        },
        type: 'editing',
      },
    ])

    renderWithProviders(
      <ThemeProvider theme={BLOG_TEST_THEME}>
        <BlogImageEditDialog />
      </ThemeProvider>,
    )

    fireEvent.change(screen.getByLabelText(/Alt text/), {
      target: { value: 'Changed alt' },
    })
    fireEvent.click(screen.getByText('Cancel'))
    expect(mockCloseImageDialog).toHaveBeenCalled()
  })
})
