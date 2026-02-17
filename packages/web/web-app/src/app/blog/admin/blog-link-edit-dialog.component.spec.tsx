/**
 * Blog Link Edit Dialog Component Tests
 */

import { ThemeProvider } from '@mui/material/styles'
import { fireEvent, screen } from '@testing-library/react'

import { renderWithProviders } from '../../../../testing-render'
import { BLOG_TEST_THEME } from '../testing/blog-test.fixtures'
import '../testing/blog-test-setup'
import { BlogLinkEditDialog } from './blog-link-edit-dialog.component'

const mockPublishWindowChange = jest.fn()
const mockUpdateLink = jest.fn()
const mockCancelLinkEdit = jest.fn()
const mockSwitchFromPreviewToLinkEdit = jest.fn()
const mockRemoveLink = jest.fn()

const mockUseCellValues = jest.fn()
const publisherMocks = [
  mockPublishWindowChange,
  mockUpdateLink,
  mockCancelLinkEdit,
  mockSwitchFromPreviewToLinkEdit,
  mockRemoveLink,
]
let usePublisherCallIndex = 0

jest.mock('@mdxeditor/editor', () => ({
  cancelLinkEdit$: {},
  linkDialogState$: {},
  onWindowChange$: {},
  removeLink$: {},
  rootEditor$: {},
  showLinkTitleField$: {},
  switchFromPreviewToLinkEdit$: {},
  updateLink$: {},
}))

jest.mock('@mdxeditor/gurx', () => ({
  useCellValues: (...args: unknown[]) => mockUseCellValues(...args),
  usePublisher: () => publisherMocks[usePublisherCallIndex++ % publisherMocks.length],
}))


describe('BlogLinkEditDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    usePublisherCallIndex = 0
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
    })
    mockUseCellValues.mockReturnValue([
      {
        rectangle: { height: 40, left: 10, top: 10, width: 100 },
        text: 'Link text',
        title: 'Link title',
        type: 'edit',
        url: 'https://example.com',
      },
      { focus: jest.fn() },
      true,
    ])
  })

  it('should return null when state is inactive', () => {
    mockUseCellValues.mockReturnValue([
      { type: 'inactive' },
      null,
      false,
    ])

    const { container } = renderWithProviders(
      <ThemeProvider theme={BLOG_TEST_THEME}>
        <BlogLinkEditDialog />
      </ThemeProvider>,
    )

    expect(container.firstChild).toBeNull()
  })

  it('should render link edit form when state is edit', () => {
    mockUseCellValues.mockReturnValue([
      {
        rectangle: { height: 40, left: 10, top: 10, width: 100 },
        text: 'Click here',
        title: 'My link',
        type: 'edit',
        url: 'https://example.com',
      },
      { focus: jest.fn() },
      true,
    ])

    renderWithProviders(
      <ThemeProvider theme={BLOG_TEST_THEME}>
        <BlogLinkEditDialog />
      </ThemeProvider>,
    )

    expect(screen.getByLabelText(/URL/)).toBeTruthy()
    expect(screen.getByLabelText(/Anchor text/)).toBeTruthy()
    expect(screen.getByLabelText(/Title/)).toBeTruthy()
    expect(screen.getByText('Save')).toBeTruthy()
    expect(screen.getByText('Cancel')).toBeTruthy()
  })

  it('should call updateLink when form submitted with changed values', () => {
    mockUseCellValues.mockReturnValue([
      {
        linkNodeKey: 'link-1',
        rectangle: { height: 40, left: 10, top: 10, width: 100 },
        text: 'Original',
        title: '',
        type: 'edit',
        url: 'https://original.com',
      },
      { focus: jest.fn() },
      true,
    ])

    renderWithProviders(
      <ThemeProvider theme={BLOG_TEST_THEME}>
        <BlogLinkEditDialog />
      </ThemeProvider>,
    )

    const urlInput = screen.getByLabelText(/URL/)
    fireEvent.change(urlInput, { target: { value: 'https://updated.com' } })
    fireEvent.click(screen.getByText('Save'))

    expect(mockUpdateLink).toHaveBeenCalledWith(
      expect.objectContaining({
        text: 'Original',
        url: 'https://updated.com',
      }),
    )
  })

  it('should call removeLink when remove button clicked', () => {
    mockUseCellValues.mockReturnValue([
      {
        linkNodeKey: 'link-1',
        rectangle: { height: 40, left: 10, top: 10, width: 100 },
        text: 'Link',
        title: '',
        type: 'edit',
        url: 'https://example.com',
      },
      { focus: jest.fn() },
      true,
    ])

    renderWithProviders(
      <ThemeProvider theme={BLOG_TEST_THEME}>
        <BlogLinkEditDialog />
      </ThemeProvider>,
    )

    fireEvent.click(screen.getByLabelText(/Remove link/))
    expect(mockRemoveLink).toHaveBeenCalled()
  })
})
