/**
 * Blog Image Edit Dialog Component Tests
 */

import { createTheme, ThemeProvider } from '@mui/material/styles'
import { fireEvent, screen } from '@testing-library/react'

import { renderWithProviders } from '../../../../testing-render'
import { BlogImageEditDialog } from './blog-image-edit-dialog.component'

jest.mock('../../i18n', () => ({
  useStrings: () => ({
    CANCEL: 'Cancel',
    CLOSE: 'Close',
    IMAGE_ALIGN_CENTER: 'Center',
    IMAGE_ALIGN_LEFT: 'Left',
    IMAGE_ALIGN_RIGHT: 'Right',
    IMAGE_EDIT_ALT: 'Alt text',
    IMAGE_EDIT_ALIGNMENT: 'Alignment',
    IMAGE_EDIT_DIALOG_TITLE: 'Edit Image',
    IMAGE_EDIT_TITLE: 'Title',
    IMAGE_EDIT_USE_TOOLBAR: 'Use toolbar to add images',
    SAVE: 'Save',
  }),
}))

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

const testTheme = createTheme()

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
      <ThemeProvider theme={testTheme}>
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
      <ThemeProvider theme={testTheme}>
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
      <ThemeProvider theme={testTheme}>
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
      <ThemeProvider theme={testTheme}>
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
