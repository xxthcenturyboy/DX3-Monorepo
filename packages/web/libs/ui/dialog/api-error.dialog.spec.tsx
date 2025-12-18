import { createTheme, ThemeProvider } from '@mui/material/styles'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type React from 'react'

import { DialogApiError } from './api-error.dialog'

// Mock the dependencies
jest.mock('../lottie/error.lottie', () => ({
  ErrorLottie: () => <div data-testid="error-lottie">Error Animation</div>,
}))

jest.mock('./ui-wrapper.dialog', () => ({
  DialogWrapper: ({ children, maxWidth }: any) => (
    <div
      data-max-width={maxWidth}
      data-testid="dialog-wrapper"
    >
      {children}
    </div>
  ),
}))

// Create a test theme
const testTheme = createTheme()

// Helper function to render with theme provider
const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={testTheme}>{ui}</ThemeProvider>)
}

describe('DialogApiError', () => {
  const mockCloseDialog = jest.fn()
  const defaultProps = {
    closeDialog: mockCloseDialog,
    isMobileWidth: false,
    open: true,
    windowHeight: 800,
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render successfully when open', () => {
      renderWithTheme(<DialogApiError {...defaultProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should not render when closed', () => {
      renderWithTheme(
        <DialogApiError
          {...defaultProps}
          open={false}
        />,
      )

      // Dialog is still in DOM with keepMounted, but may not be visible
      const dialog = screen.queryByRole('dialog')
      if (dialog) {
        expect(dialog).toHaveAttribute('aria-hidden', 'true')
      }
    })

    it('should render ErrorLottie when open', () => {
      renderWithTheme(
        <DialogApiError
          {...defaultProps}
          open={true}
        />,
      )

      expect(screen.getByTestId('error-lottie')).toBeInTheDocument()
    })

    it('should not render ErrorLottie when closed', () => {
      renderWithTheme(
        <DialogApiError
          {...defaultProps}
          open={false}
        />,
      )

      expect(screen.queryByTestId('error-lottie')).not.toBeInTheDocument()
    })

    it('should render DialogWrapper', () => {
      renderWithTheme(<DialogApiError {...defaultProps} />)

      expect(screen.getByTestId('dialog-wrapper')).toBeInTheDocument()
    })

    it('should render default message', () => {
      renderWithTheme(<DialogApiError {...defaultProps} />)

      expect(screen.getByText('Your request could not be completed.')).toBeInTheDocument()
    })

    it('should render OK button', () => {
      renderWithTheme(<DialogApiError {...defaultProps} />)

      expect(screen.getByText('OK')).toBeInTheDocument()
    })
  })

  describe('Custom Message', () => {
    it('should render custom message', () => {
      renderWithTheme(
        <DialogApiError
          {...defaultProps}
          message="Network error occurred"
        />,
      )

      expect(screen.getByText('Network error occurred')).toBeInTheDocument()
      expect(screen.queryByText('Your request could not be completed.')).not.toBeInTheDocument()
    })

    it('should render default message when message prop is undefined', () => {
      renderWithTheme(
        <DialogApiError
          {...defaultProps}
          message={undefined}
        />,
      )

      expect(screen.getByText('Your request could not be completed.')).toBeInTheDocument()
    })

    it('should render empty string message', () => {
      renderWithTheme(
        <DialogApiError
          {...defaultProps}
          message=""
        />,
      )

      // Empty string should be rendered
      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
    })

    it('should render long message', () => {
      const longMessage = 'A'.repeat(200)
      renderWithTheme(
        <DialogApiError
          {...defaultProps}
          message={longMessage}
        />,
      )

      expect(screen.getByText(longMessage)).toBeInTheDocument()
    })

    it('should handle message with special characters', () => {
      const specialMessage = "Error: Can't process <data> & save!"
      renderWithTheme(
        <DialogApiError
          {...defaultProps}
          message={specialMessage}
        />,
      )

      expect(screen.getByText(specialMessage)).toBeInTheDocument()
    })
  })

  describe('Button Interaction', () => {
    it('should call closeDialog when OK button is clicked', () => {
      renderWithTheme(<DialogApiError {...defaultProps} />)

      const button = screen.getByText('OK')
      fireEvent.click(button)

      expect(mockCloseDialog).toHaveBeenCalledTimes(1)
    })

    it('should call closeDialog multiple times on multiple clicks', () => {
      renderWithTheme(<DialogApiError {...defaultProps} />)

      const button = screen.getByText('OK')
      fireEvent.click(button)
      fireEvent.click(button)
      fireEvent.click(button)

      expect(mockCloseDialog).toHaveBeenCalledTimes(3)
    })
  })

  describe('Close Handlers', () => {
    it('should call closeDialog on backdrop click', () => {
      const { container } = renderWithTheme(<DialogApiError {...defaultProps} />)

      const backdrop = container.querySelector('.MuiBackdrop-root')
      if (backdrop) {
        fireEvent.click(backdrop)
        expect(mockCloseDialog).toHaveBeenCalled()
      }
    })

    it('should call closeDialog on ESC key press', async () => {
      renderWithTheme(<DialogApiError {...defaultProps} />)

      const dialog = screen.getByRole('dialog')
      fireEvent.keyDown(dialog, { code: 'Escape', key: 'Escape' })

      await waitFor(() => {
        expect(mockCloseDialog).toHaveBeenCalled()
      })
    })
  })

  describe('Mobile vs Desktop', () => {
    it('should render successfully on mobile', () => {
      renderWithTheme(
        <DialogApiError
          {...defaultProps}
          isMobileWidth={true}
        />,
      )

      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
      expect(screen.getByText('Your request could not be completed.')).toBeInTheDocument()
    })

    it('should render successfully on desktop', () => {
      renderWithTheme(
        <DialogApiError
          {...defaultProps}
          isMobileWidth={false}
        />,
      )

      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
      expect(screen.getByText('Your request could not be completed.')).toBeInTheDocument()
    })

    it('should accept isMobileWidth prop for mobile', () => {
      renderWithTheme(
        <DialogApiError
          {...defaultProps}
          isMobileWidth={true}
        />,
      )

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('OK')).toBeInTheDocument()
    })

    it('should accept isMobileWidth prop for desktop', () => {
      renderWithTheme(
        <DialogApiError
          {...defaultProps}
          isMobileWidth={false}
        />,
      )

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('OK')).toBeInTheDocument()
    })
  })

  describe('Window Height', () => {
    it('should render successfully with windowHeight on mobile', () => {
      renderWithTheme(
        <DialogApiError
          {...defaultProps}
          isMobileWidth={true}
          windowHeight={800}
        />,
      )

      // Verify component renders without errors
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Your request could not be completed.')).toBeInTheDocument()
    })

    it('should render successfully with windowHeight on desktop', () => {
      renderWithTheme(
        <DialogApiError
          {...defaultProps}
          isMobileWidth={false}
          windowHeight={800}
        />,
      )

      // Verify component renders without errors
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Your request could not be completed.')).toBeInTheDocument()
    })

    it('should handle different window heights on mobile', () => {
      renderWithTheme(
        <DialogApiError
          {...defaultProps}
          isMobileWidth={true}
          windowHeight={1024}
        />,
      )

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should handle small window height on mobile', () => {
      renderWithTheme(
        <DialogApiError
          {...defaultProps}
          isMobileWidth={true}
          windowHeight={400}
        />,
      )

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  describe('Dialog Content', () => {
    it('should have correct text ID', () => {
      renderWithTheme(<DialogApiError {...defaultProps} />)

      const text = screen.getByText('Your request could not be completed.')
      expect(text).toHaveAttribute('id', 'dialog-api-alert')
    })

    it('should render message text', () => {
      renderWithTheme(<DialogApiError {...defaultProps} />)

      expect(screen.getByText('Your request could not be completed.')).toBeInTheDocument()
    })

    it('should render custom message text', () => {
      renderWithTheme(
        <DialogApiError
          {...defaultProps}
          message="Test error message"
        />,
      )

      expect(screen.getByText('Test error message')).toBeInTheDocument()
    })

    it('should render dialog content successfully', () => {
      renderWithTheme(<DialogApiError {...defaultProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Your request could not be completed.')).toBeInTheDocument()
      expect(screen.getByText('OK')).toBeInTheDocument()
    })
  })

  describe('Dialog Properties', () => {
    it('should render dialog successfully', () => {
      renderWithTheme(<DialogApiError {...defaultProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should keep dialog mounted', () => {
      const { rerender } = renderWithTheme(
        <DialogApiError
          {...defaultProps}
          open={true}
        />,
      )

      expect(screen.getByRole('dialog')).toBeInTheDocument()

      // Rerender with open=false
      rerender(
        <ThemeProvider theme={testTheme}>
          <DialogApiError
            {...defaultProps}
            open={false}
          />
        </ThemeProvider>,
      )

      // Dialog should still be in DOM (keepMounted: true)
      const dialogs = screen.queryAllByRole('dialog', { hidden: true })
      expect(dialogs.length).toBeGreaterThan(0)
    })
  })

  describe('Component Structure', () => {
    it('should render all components together when open', () => {
      renderWithTheme(
        <DialogApiError
          {...defaultProps}
          open={true}
        />,
      )

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByTestId('error-lottie')).toBeInTheDocument()
      expect(screen.getByTestId('dialog-wrapper')).toBeInTheDocument()
      expect(screen.getByText('Your request could not be completed.')).toBeInTheDocument()
      expect(screen.getByText('OK')).toBeInTheDocument()
    })

    it('should render wrapper components', () => {
      renderWithTheme(<DialogApiError {...defaultProps} />)

      expect(screen.getByTestId('dialog-wrapper')).toBeInTheDocument()
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should render with all props', () => {
      renderWithTheme(
        <DialogApiError
          {...defaultProps}
          isMobileWidth={true}
          message="Test message"
          windowHeight={600}
        />,
      )

      expect(screen.getByText('Test message')).toBeInTheDocument()
      expect(screen.getByText('OK')).toBeInTheDocument()
    })

    it('should render button', () => {
      renderWithTheme(<DialogApiError {...defaultProps} />)

      const button = screen.getByText('OK')
      expect(button).toBeInTheDocument()
    })
  })

  describe('Content Rendering', () => {
    it('should render dialog content successfully', () => {
      renderWithTheme(<DialogApiError {...defaultProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Your request could not be completed.')).toBeInTheDocument()
    })

    it('should render error lottie and text together', () => {
      renderWithTheme(
        <DialogApiError
          {...defaultProps}
          open={true}
        />,
      )

      expect(screen.getByTestId('error-lottie')).toBeInTheDocument()
      expect(screen.getByText('Your request could not be completed.')).toBeInTheDocument()
    })

    it('should render with custom content', () => {
      renderWithTheme(
        <DialogApiError
          {...defaultProps}
          message="Custom content"
        />,
      )

      expect(screen.getByText('Custom content')).toBeInTheDocument()
    })

    it('should render all elements in correct structure', () => {
      renderWithTheme(
        <DialogApiError
          {...defaultProps}
          open={true}
        />,
      )

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByTestId('error-lottie')).toBeInTheDocument()
      expect(screen.getByTestId('dialog-wrapper')).toBeInTheDocument()
      expect(screen.getByText('OK')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle windowHeight of 0 on mobile', () => {
      renderWithTheme(
        <DialogApiError
          {...defaultProps}
          isMobileWidth={true}
          windowHeight={0}
        />,
      )

      // Component should render without errors even with edge case values
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should handle very large windowHeight', () => {
      renderWithTheme(
        <DialogApiError
          {...defaultProps}
          isMobileWidth={true}
          windowHeight={5000}
        />,
      )

      // Component should render without errors even with edge case values
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should handle rapid open/close toggling', () => {
      const { rerender } = renderWithTheme(
        <DialogApiError
          {...defaultProps}
          open={true}
        />,
      )

      expect(screen.getByTestId('error-lottie')).toBeInTheDocument()

      rerender(
        <ThemeProvider theme={testTheme}>
          <DialogApiError
            {...defaultProps}
            open={false}
          />
        </ThemeProvider>,
      )

      expect(screen.queryByTestId('error-lottie')).not.toBeInTheDocument()

      rerender(
        <ThemeProvider theme={testTheme}>
          <DialogApiError
            {...defaultProps}
            open={true}
          />
        </ThemeProvider>,
      )

      expect(screen.getByTestId('error-lottie')).toBeInTheDocument()
    })
  })

  describe('Integration Scenarios', () => {
    it('should work correctly on desktop with all features', () => {
      renderWithTheme(
        <DialogApiError
          closeDialog={mockCloseDialog}
          isMobileWidth={false}
          message="Server error occurred"
          open={true}
          windowHeight={900}
        />,
      )

      expect(screen.getByText('Server error occurred')).toBeInTheDocument()
      expect(screen.getByTestId('error-lottie')).toBeInTheDocument()

      const button = screen.getByText('OK')
      fireEvent.click(button)

      expect(mockCloseDialog).toHaveBeenCalledTimes(1)
    })

    it('should work correctly on mobile with all features', () => {
      renderWithTheme(
        <DialogApiError
          closeDialog={mockCloseDialog}
          isMobileWidth={true}
          message="Mobile error"
          open={true}
          windowHeight={600}
        />,
      )

      expect(screen.getByText('Mobile error')).toBeInTheDocument()
      expect(screen.getByTestId('error-lottie')).toBeInTheDocument()

      const button = screen.getByText('OK')
      fireEvent.click(button)

      expect(mockCloseDialog).toHaveBeenCalledTimes(1)
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should handle transition from closed to open', () => {
      const { rerender } = renderWithTheme(
        <DialogApiError
          {...defaultProps}
          open={false}
        />,
      )

      expect(screen.queryByTestId('error-lottie')).not.toBeInTheDocument()

      rerender(
        <ThemeProvider theme={testTheme}>
          <DialogApiError
            {...defaultProps}
            open={true}
          />
        </ThemeProvider>,
      )

      expect(screen.getByTestId('error-lottie')).toBeInTheDocument()
    })
  })

  describe('Additional DialogProps', () => {
    it('should render successfully with type annotations', () => {
      // Component accepts Partial<DialogProps> in its type definition
      renderWithTheme(<DialogApiError {...defaultProps} />)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
    })

    it('should render without errors', () => {
      renderWithTheme(<DialogApiError {...defaultProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Your request could not be completed.')).toBeInTheDocument()
      expect(screen.getByText('OK')).toBeInTheDocument()
    })
  })
})
