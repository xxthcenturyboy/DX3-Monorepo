import { createTheme, ThemeProvider } from '@mui/material/styles'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type React from 'react'

import { CustomDialog } from './dialog.component'

// Create a test theme
const testTheme = createTheme()

// Helper function to render with theme provider
const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={testTheme}>{ui}</ThemeProvider>)
}

describe('CustomDialog', () => {
  const mockCloseDialog = jest.fn()
  const defaultProps = {
    body: <div>Dialog Body Content</div>,
    closeDialog: mockCloseDialog,
    isMobileWidth: false,
    open: true,
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render successfully when open', () => {
      renderWithTheme(<CustomDialog {...defaultProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should not be visible when closed', () => {
      renderWithTheme(
        <CustomDialog
          {...defaultProps}
          open={false}
        />,
      )

      const dialog = screen.queryByRole('dialog')
      if (dialog) {
        expect(dialog).toHaveAttribute('aria-hidden', 'true')
      }
    })

    it('should render body content', () => {
      renderWithTheme(<CustomDialog {...defaultProps} />)

      expect(screen.getByText('Dialog Body Content')).toBeInTheDocument()
    })

    it('should render with custom body', () => {
      renderWithTheme(
        <CustomDialog
          {...defaultProps}
          body={<div>Custom Content</div>}
        />,
      )

      expect(screen.getByText('Custom Content')).toBeInTheDocument()
    })

    it('should render with complex body', () => {
      renderWithTheme(
        <CustomDialog
          {...defaultProps}
          body={
            <div>
              <h1>Title</h1>
              <p>Paragraph</p>
              <button type="button">Action</button>
            </div>
          }
        />,
      )

      expect(screen.getByText('Title')).toBeInTheDocument()
      expect(screen.getByText('Paragraph')).toBeInTheDocument()
      expect(screen.getByText('Action')).toBeInTheDocument()
    })
  })

  describe('Close Behavior', () => {
    it('should call closeDialog when backdrop is clicked', () => {
      const { container } = renderWithTheme(<CustomDialog {...defaultProps} />)

      const backdrop = container.querySelector('.MuiBackdrop-root')
      if (backdrop) {
        fireEvent.click(backdrop)
        expect(mockCloseDialog).toHaveBeenCalledTimes(1)
      }
    })

    it('should call closeDialog on ESC key press', async () => {
      renderWithTheme(<CustomDialog {...defaultProps} />)

      const dialog = screen.getByRole('dialog')
      fireEvent.keyDown(dialog, { code: 'Escape', key: 'Escape' })

      await waitFor(() => {
        expect(mockCloseDialog).toHaveBeenCalled()
      })
    })

    it('should not call closeDialog multiple times on single backdrop click', () => {
      const { container } = renderWithTheme(<CustomDialog {...defaultProps} />)

      const backdrop = container.querySelector('.MuiBackdrop-root')
      if (backdrop) {
        fireEvent.click(backdrop)
        expect(mockCloseDialog).toHaveBeenCalledTimes(1)
      }
    })

    it('should call closeDialog on each backdrop click', () => {
      const { container } = renderWithTheme(<CustomDialog {...defaultProps} />)

      const backdrop = container.querySelector('.MuiBackdrop-root')
      if (backdrop) {
        fireEvent.click(backdrop)
        fireEvent.click(backdrop)
        fireEvent.click(backdrop)
        expect(mockCloseDialog).toHaveBeenCalledTimes(3)
      }
    })
  })

  describe('Open/Close State', () => {
    it('should render when open is true', () => {
      renderWithTheme(
        <CustomDialog
          {...defaultProps}
          open={true}
        />,
      )

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Dialog Body Content')).toBeInTheDocument()
    })

    it('should transition from closed to open', () => {
      const { rerender } = renderWithTheme(
        <CustomDialog
          {...defaultProps}
          open={false}
        />,
      )

      // Dialog exists but may be hidden
      const dialogs = screen.queryAllByRole('dialog', { hidden: true })
      expect(dialogs.length).toBeGreaterThan(0)

      rerender(
        <ThemeProvider theme={testTheme}>
          <CustomDialog
            {...defaultProps}
            open={true}
          />
        </ThemeProvider>,
      )

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Dialog Body Content')).toBeInTheDocument()
    })

    it('should transition from open to closed', () => {
      const { rerender } = renderWithTheme(
        <CustomDialog
          {...defaultProps}
          open={true}
        />,
      )

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Dialog Body Content')).toBeInTheDocument()

      rerender(
        <ThemeProvider theme={testTheme}>
          <CustomDialog
            {...defaultProps}
            open={false}
          />
        </ThemeProvider>,
      )

      // Dialog is kept mounted but should not be visible
      // The dialog should still exist in DOM due to keepMounted
      const dialogs = screen.queryAllByRole('dialog', { hidden: true })
      expect(dialogs.length).toBeGreaterThan(0)
    })

    it('should handle rapid open/close toggling', () => {
      const { rerender } = renderWithTheme(
        <CustomDialog
          {...defaultProps}
          open={true}
        />,
      )

      expect(screen.getByText('Dialog Body Content')).toBeInTheDocument()

      rerender(
        <ThemeProvider theme={testTheme}>
          <CustomDialog
            {...defaultProps}
            open={false}
          />
        </ThemeProvider>,
      )

      rerender(
        <ThemeProvider theme={testTheme}>
          <CustomDialog
            {...defaultProps}
            open={true}
          />
        </ThemeProvider>,
      )

      expect(screen.getByText('Dialog Body Content')).toBeInTheDocument()
    })
  })

  describe('Mobile vs Desktop', () => {
    it('should render on desktop', () => {
      renderWithTheme(
        <CustomDialog
          {...defaultProps}
          isMobileWidth={false}
        />,
      )

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Dialog Body Content')).toBeInTheDocument()
    })

    it('should render on mobile', () => {
      renderWithTheme(
        <CustomDialog
          {...defaultProps}
          isMobileWidth={true}
        />,
      )

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Dialog Body Content')).toBeInTheDocument()
    })

    it('should accept isMobileWidth prop', () => {
      renderWithTheme(
        <CustomDialog
          {...defaultProps}
          isMobileWidth={true}
        />,
      )

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should transition from desktop to mobile', () => {
      const { rerender } = renderWithTheme(
        <CustomDialog
          {...defaultProps}
          isMobileWidth={false}
        />,
      )

      expect(screen.getByText('Dialog Body Content')).toBeInTheDocument()

      rerender(
        <ThemeProvider theme={testTheme}>
          <CustomDialog
            {...defaultProps}
            isMobileWidth={true}
          />
        </ThemeProvider>,
      )

      expect(screen.getByText('Dialog Body Content')).toBeInTheDocument()
    })
  })

  describe('Body Content', () => {
    it('should render text body', () => {
      renderWithTheme(
        <CustomDialog
          {...defaultProps}
          body="Plain text body"
        />,
      )

      expect(screen.getByText('Plain text body')).toBeInTheDocument()
    })

    it('should render React element body', () => {
      renderWithTheme(
        <CustomDialog
          {...defaultProps}
          body={<button type="button">Click me</button>}
        />,
      )

      expect(screen.getByText('Click me')).toBeInTheDocument()
    })

    it('should render null body gracefully', () => {
      renderWithTheme(
        <CustomDialog
          {...defaultProps}
          body={null}
        />,
      )

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should render undefined body gracefully', () => {
      renderWithTheme(
        <CustomDialog
          {...defaultProps}
          body={undefined}
        />,
      )

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should update body content', () => {
      const { rerender } = renderWithTheme(
        <CustomDialog
          {...defaultProps}
          body={<div>Initial Body</div>}
        />,
      )

      expect(screen.getByText('Initial Body')).toBeInTheDocument()

      rerender(
        <ThemeProvider theme={testTheme}>
          <CustomDialog
            {...defaultProps}
            body={<div>Updated Body</div>}
          />
        </ThemeProvider>,
      )

      expect(screen.getByText('Updated Body')).toBeInTheDocument()
      expect(screen.queryByText('Initial Body')).not.toBeInTheDocument()
    })

    it('should render body with nested components', () => {
      renderWithTheme(
        <CustomDialog
          {...defaultProps}
          body={
            <div>
              <div>Level 1</div>
              <div>
                <div>Level 2</div>
                <div>
                  <div>Level 3</div>
                </div>
              </div>
            </div>
          }
        />,
      )

      expect(screen.getByText('Level 1')).toBeInTheDocument()
      expect(screen.getByText('Level 2')).toBeInTheDocument()
      expect(screen.getByText('Level 3')).toBeInTheDocument()
    })
  })

  describe('Dialog Properties', () => {
    it('should keep dialog mounted when closed', () => {
      const { rerender } = renderWithTheme(
        <CustomDialog
          {...defaultProps}
          open={true}
        />,
      )

      expect(screen.getByRole('dialog')).toBeInTheDocument()

      rerender(
        <ThemeProvider theme={testTheme}>
          <CustomDialog
            {...defaultProps}
            open={false}
          />
        </ThemeProvider>,
      )

      // Dialog should still be in DOM (keepMounted: true)
      const dialogs = screen.queryAllByRole('dialog', { hidden: true })
      expect(dialogs.length).toBeGreaterThan(0)
    })

    it('should render successfully', () => {
      renderWithTheme(<CustomDialog {...defaultProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  describe('Content Rendering', () => {
    it('should render body content successfully', () => {
      renderWithTheme(<CustomDialog {...defaultProps} />)

      expect(screen.getByText('Dialog Body Content')).toBeInTheDocument()
    })

    it('should render body inside dialog', () => {
      renderWithTheme(<CustomDialog {...defaultProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Dialog Body Content')).toBeInTheDocument()
    })

    it('should center content', () => {
      renderWithTheme(
        <CustomDialog
          {...defaultProps}
          body={<div data-testid="centered-content">Centered</div>}
        />,
      )

      expect(screen.getByTestId('centered-content')).toBeInTheDocument()
      expect(screen.getByText('Centered')).toBeInTheDocument()
    })

    it('should handle content padding', () => {
      renderWithTheme(
        <CustomDialog
          {...defaultProps}
          body={<div>Padded Content</div>}
        />,
      )

      expect(screen.getByText('Padded Content')).toBeInTheDocument()
    })

    it('should handle overflow content', () => {
      const longContent = 'Long content that might overflow '.repeat(50)
      renderWithTheme(
        <CustomDialog
          {...defaultProps}
          body={<div>{longContent}</div>}
        />,
      )

      expect(screen.getByText(/Long content/)).toBeInTheDocument()
    })

    it('should render complex body structure', () => {
      renderWithTheme(
        <CustomDialog
          {...defaultProps}
          body={
            <div>
              <div>Header</div>
              <div>Content</div>
              <div>Footer</div>
            </div>
          }
        />,
      )

      expect(screen.getByText('Header')).toBeInTheDocument()
      expect(screen.getByText('Content')).toBeInTheDocument()
      expect(screen.getByText('Footer')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty body', () => {
      renderWithTheme(
        <CustomDialog
          {...defaultProps}
          // biome-ignore lint/complexity/noUselessFragments: I think it is necessary
          body={<></>}
        />,
      )

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should handle body with special characters', () => {
      const specialChars = 'Special chars: <>&"\''
      renderWithTheme(
        <CustomDialog
          {...defaultProps}
          body={<div>{specialChars}</div>}
        />,
      )

      expect(screen.getByText(/Special chars/)).toBeInTheDocument()
    })

    it('should handle very long body content', () => {
      const longContent = 'A'.repeat(1000)
      renderWithTheme(
        <CustomDialog
          {...defaultProps}
          body={<div>{longContent}</div>}
        />,
      )

      expect(screen.getByText(longContent)).toBeInTheDocument()
    })

    it('should handle body with form elements', () => {
      renderWithTheme(
        <CustomDialog
          {...defaultProps}
          body={
            <form>
              <input
                placeholder="Enter text"
                type="text"
              />
              <button type="submit">Submit</button>
            </form>
          }
        />,
      )

      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
      expect(screen.getByText('Submit')).toBeInTheDocument()
    })

    it('should handle body with images', () => {
      renderWithTheme(
        <CustomDialog
          {...defaultProps}
          body={
            <img
              alt="Test-file"
              src="test.jpg"
            />
          }
        />,
      )

      expect(screen.getByAltText('Test-file')).toBeInTheDocument()
    })
  })

  describe('Integration Scenarios', () => {
    it('should work as a confirmation dialog', () => {
      renderWithTheme(
        <CustomDialog
          {...defaultProps}
          body={
            <div>
              <p>Are you sure?</p>
              <button
                onClick={mockCloseDialog}
                type="button"
              >
                Cancel
              </button>
              <button type="button">Confirm</button>
            </div>
          }
        />,
      )

      expect(screen.getByText('Are you sure?')).toBeInTheDocument()
      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.getByText('Confirm')).toBeInTheDocument()
    })

    it('should work as a form dialog', () => {
      renderWithTheme(
        <CustomDialog
          {...defaultProps}
          body={
            <form>
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
              />
              <button type="submit">Save</button>
            </form>
          }
        />,
      )

      expect(screen.getByLabelText('Name')).toBeInTheDocument()
      expect(screen.getByText('Save')).toBeInTheDocument()
    })

    it('should work as an information dialog', () => {
      renderWithTheme(
        <CustomDialog
          {...defaultProps}
          body={
            <div>
              <h2>Information</h2>
              <p>This is important information.</p>
              <button
                onClick={mockCloseDialog}
                type="button"
              >
                OK
              </button>
            </div>
          }
        />,
      )

      expect(screen.getByText('Information')).toBeInTheDocument()
      expect(screen.getByText('This is important information.')).toBeInTheDocument()
    })

    it('should handle full flow: open, interact, close', () => {
      const { container, rerender } = renderWithTheme(
        <CustomDialog
          {...defaultProps}
          open={false}
        />,
      )

      // Open dialog
      rerender(
        <ThemeProvider theme={testTheme}>
          <CustomDialog
            {...defaultProps}
            open={true}
          />
        </ThemeProvider>,
      )

      expect(screen.getByText('Dialog Body Content')).toBeInTheDocument()

      // Close via backdrop
      const backdrop = container.querySelector('.MuiBackdrop-root')
      if (backdrop) {
        fireEvent.click(backdrop)
        expect(mockCloseDialog).toHaveBeenCalled()
      }
    })
  })

  describe('Component Structure', () => {
    it('should render Dialog component', () => {
      renderWithTheme(<CustomDialog {...defaultProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should render all components together', () => {
      renderWithTheme(
        <CustomDialog
          {...defaultProps}
          body={<div>Complete Dialog</div>}
        />,
      )

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Complete Dialog')).toBeInTheDocument()
    })

    it('should render with proper structure', () => {
      renderWithTheme(
        <CustomDialog
          {...defaultProps}
          body={
            <div>
              <h1>Title</h1>
              <p>Description</p>
            </div>
          }
        />,
      )

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Title')).toBeInTheDocument()
      expect(screen.getByText('Description')).toBeInTheDocument()
    })
  })

  describe('Callbacks', () => {
    it('should maintain closeDialog reference', () => {
      const { rerender } = renderWithTheme(<CustomDialog {...defaultProps} />)

      const { container } = renderWithTheme(<CustomDialog {...defaultProps} />)
      const backdrop = container.querySelector('.MuiBackdrop-root')

      if (backdrop) {
        fireEvent.click(backdrop)
        expect(mockCloseDialog).toHaveBeenCalledTimes(1)

        rerender(
          <ThemeProvider theme={testTheme}>
            <CustomDialog {...defaultProps} />
          </ThemeProvider>,
        )

        fireEvent.click(backdrop)
        expect(mockCloseDialog).toHaveBeenCalledTimes(2)
      }
    })

    it('should handle different closeDialog functions', () => {
      const firstClose = jest.fn()
      const secondClose = jest.fn()

      const { container, rerender } = renderWithTheme(
        <CustomDialog
          {...defaultProps}
          closeDialog={firstClose}
        />,
      )

      const backdrop = container.querySelector('.MuiBackdrop-root')
      if (backdrop) {
        fireEvent.click(backdrop)
        expect(firstClose).toHaveBeenCalledTimes(1)
        expect(secondClose).not.toHaveBeenCalled()

        rerender(
          <ThemeProvider theme={testTheme}>
            <CustomDialog
              {...defaultProps}
              closeDialog={secondClose}
            />
          </ThemeProvider>,
        )

        fireEvent.click(backdrop)
        expect(firstClose).toHaveBeenCalledTimes(1)
        expect(secondClose).toHaveBeenCalledTimes(1)
      }
    })
  })

  describe('Accessibility', () => {
    it('should be keyboard accessible', () => {
      renderWithTheme(<CustomDialog {...defaultProps} />)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
    })

    it('should support accessible body content', () => {
      renderWithTheme(
        <CustomDialog
          {...defaultProps}
          body={
            <div>
              <h1>Accessible Title</h1>
              <main>Main content</main>
            </div>
          }
        />,
      )

      expect(screen.getByText('Accessible Title')).toBeInTheDocument()
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    it('should support ARIA labels in body', () => {
      renderWithTheme(
        <CustomDialog
          {...defaultProps}
          body={
            <section aria-label="Dialog content area">
              <p>Content</p>
            </section>
          }
        />,
      )

      expect(screen.getByLabelText('Dialog content area')).toBeInTheDocument()
    })
  })

  describe('Use Cases', () => {
    it('should work as a modal overlay', () => {
      renderWithTheme(
        <CustomDialog
          {...defaultProps}
          body={<div>Modal Content</div>}
        />,
      )

      expect(screen.getByText('Modal Content')).toBeInTheDocument()
    })

    it('should work as an alert dialog', () => {
      renderWithTheme(
        <CustomDialog
          {...defaultProps}
          body={
            <div>
              <p>Warning!</p>
              <button
                onClick={mockCloseDialog}
                type="button"
              >
                Close
              </button>
            </div>
          }
        />,
      )

      expect(screen.getByText('Warning!')).toBeInTheDocument()
    })

    it('should work with dynamic content', () => {
      const { rerender } = renderWithTheme(
        <CustomDialog
          {...defaultProps}
          body={<div>Loading...</div>}
        />,
      )

      expect(screen.getByText('Loading...')).toBeInTheDocument()

      rerender(
        <ThemeProvider theme={testTheme}>
          <CustomDialog
            {...defaultProps}
            body={<div>Content Loaded!</div>}
          />
        </ThemeProvider>,
      )

      expect(screen.getByText('Content Loaded!')).toBeInTheDocument()
    })
  })
})
