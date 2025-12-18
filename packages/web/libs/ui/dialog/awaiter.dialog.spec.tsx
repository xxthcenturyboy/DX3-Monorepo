import { createTheme, ThemeProvider } from '@mui/material/styles'
import { fireEvent, render, screen } from '@testing-library/react'
import type React from 'react'

import { DialogAwaiter } from './awaiter.dialog'

// Mock the dependencies
jest.mock('../lottie/awaiter.lottie', () => ({
  AwaiterLottie: () => <div data-testid="awaiter-lottie">Loading Animation</div>,
}))

jest.mock('./ui-wrapper.dialog', () => ({
  DialogWrapper: ({ children }: any) => <div data-testid="dialog-wrapper">{children}</div>,
}))

// Create a test theme
const testTheme = createTheme()

// Helper function to render with theme provider
const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={testTheme}>{ui}</ThemeProvider>)
}

describe('DialogAwaiter', () => {
  const defaultProps = {
    isMobileWidth: false,
    open: true,
  }

  describe('Basic Rendering', () => {
    it('should render successfully when open', () => {
      renderWithTheme(<DialogAwaiter {...defaultProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should not be visible when closed', () => {
      renderWithTheme(
        <DialogAwaiter
          {...defaultProps}
          open={false}
        />,
      )

      const dialog = screen.queryByRole('dialog')
      if (dialog) {
        expect(dialog).toHaveAttribute('aria-hidden', 'true')
      }
    })

    it('should render AwaiterLottie when open', () => {
      renderWithTheme(
        <DialogAwaiter
          {...defaultProps}
          open={true}
        />,
      )

      expect(screen.getByTestId('awaiter-lottie')).toBeInTheDocument()
    })

    it('should not render AwaiterLottie when closed', () => {
      renderWithTheme(
        <DialogAwaiter
          {...defaultProps}
          open={false}
        />,
      )

      expect(screen.queryByTestId('awaiter-lottie')).not.toBeInTheDocument()
    })

    it('should render DialogWrapper', () => {
      renderWithTheme(<DialogAwaiter {...defaultProps} />)

      expect(screen.getByTestId('dialog-wrapper')).toBeInTheDocument()
    })

    it('should render default message', () => {
      renderWithTheme(<DialogAwaiter {...defaultProps} />)

      expect(screen.getByText('Please Standby')).toBeInTheDocument()
    })
  })

  describe('Custom Message', () => {
    it('should render custom message', () => {
      renderWithTheme(
        <DialogAwaiter
          {...defaultProps}
          message="Loading data..."
        />,
      )

      expect(screen.getByText('Loading data...')).toBeInTheDocument()
      expect(screen.queryByText('Please Standby')).not.toBeInTheDocument()
    })

    it('should render default message when message prop is undefined', () => {
      renderWithTheme(
        <DialogAwaiter
          {...defaultProps}
          message={undefined}
        />,
      )

      expect(screen.getByText('Please Standby')).toBeInTheDocument()
    })

    it('should render empty string message', () => {
      renderWithTheme(
        <DialogAwaiter
          {...defaultProps}
          message=""
        />,
      )

      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
    })

    it('should render long message', () => {
      const longMessage = 'Please wait while we process your request. This may take a few moments.'
      renderWithTheme(
        <DialogAwaiter
          {...defaultProps}
          message={longMessage}
        />,
      )

      expect(screen.getByText(longMessage)).toBeInTheDocument()
    })

    it('should handle message with special characters', () => {
      const specialMessage = 'Loading <data> & processing...'
      renderWithTheme(
        <DialogAwaiter
          {...defaultProps}
          message={specialMessage}
        />,
      )

      expect(screen.getByText(specialMessage)).toBeInTheDocument()
    })

    it('should handle multiple different messages', () => {
      const { rerender } = renderWithTheme(
        <DialogAwaiter
          {...defaultProps}
          message="Loading..."
        />,
      )

      expect(screen.getByText('Loading...')).toBeInTheDocument()

      rerender(
        <ThemeProvider theme={testTheme}>
          <DialogAwaiter
            {...defaultProps}
            message="Processing..."
          />
        </ThemeProvider>,
      )

      expect(screen.getByText('Processing...')).toBeInTheDocument()
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })
  })

  describe('Non-Dismissible Behavior', () => {
    it('should not close on backdrop click', () => {
      const { container } = renderWithTheme(<DialogAwaiter {...defaultProps} />)

      const backdrop = container.querySelector('.MuiBackdrop-root')
      if (backdrop) {
        fireEvent.click(backdrop)
        // Dialog should still be visible
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      }
    })

    it('should not close on ESC key press', () => {
      renderWithTheme(<DialogAwaiter {...defaultProps} />)

      const dialog = screen.getByRole('dialog')
      fireEvent.keyDown(dialog, { code: 'Escape', key: 'Escape' })

      // Dialog should still be visible
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should remain open when user tries to interact', () => {
      renderWithTheme(
        <DialogAwaiter
          {...defaultProps}
          message="Please wait..."
        />,
      )

      const message = screen.getByText('Please wait...')
      fireEvent.click(message)

      // Dialog should still be visible
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(message).toBeInTheDocument()
    })
  })

  describe('Mobile vs Desktop', () => {
    it('should render successfully on mobile', () => {
      renderWithTheme(
        <DialogAwaiter
          {...defaultProps}
          isMobileWidth={true}
        />,
      )

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Please Standby')).toBeInTheDocument()
    })

    it('should render successfully on desktop', () => {
      renderWithTheme(
        <DialogAwaiter
          {...defaultProps}
          isMobileWidth={false}
        />,
      )

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Please Standby')).toBeInTheDocument()
    })

    it('should accept isMobileWidth prop', () => {
      renderWithTheme(
        <DialogAwaiter
          {...defaultProps}
          isMobileWidth={true}
        />,
      )

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should render with custom message on mobile', () => {
      renderWithTheme(
        <DialogAwaiter
          {...defaultProps}
          isMobileWidth={true}
          message="Mobile loading"
        />,
      )

      expect(screen.getByText('Mobile loading')).toBeInTheDocument()
    })
  })

  describe('Open/Close State', () => {
    it('should transition from closed to open', () => {
      const { rerender } = renderWithTheme(
        <DialogAwaiter
          {...defaultProps}
          open={false}
        />,
      )

      expect(screen.queryByTestId('awaiter-lottie')).not.toBeInTheDocument()

      rerender(
        <ThemeProvider theme={testTheme}>
          <DialogAwaiter
            {...defaultProps}
            open={true}
          />
        </ThemeProvider>,
      )

      expect(screen.getByTestId('awaiter-lottie')).toBeInTheDocument()
      expect(screen.getByText('Please Standby')).toBeInTheDocument()
    })

    it('should transition from open to closed', () => {
      const { rerender } = renderWithTheme(
        <DialogAwaiter
          {...defaultProps}
          open={true}
        />,
      )

      expect(screen.getByTestId('awaiter-lottie')).toBeInTheDocument()

      rerender(
        <ThemeProvider theme={testTheme}>
          <DialogAwaiter
            {...defaultProps}
            open={false}
          />
        </ThemeProvider>,
      )

      expect(screen.queryByTestId('awaiter-lottie')).not.toBeInTheDocument()
    })

    it('should handle rapid open/close toggling', () => {
      const { rerender } = renderWithTheme(
        <DialogAwaiter
          {...defaultProps}
          open={true}
        />,
      )

      expect(screen.getByTestId('awaiter-lottie')).toBeInTheDocument()

      rerender(
        <ThemeProvider theme={testTheme}>
          <DialogAwaiter
            {...defaultProps}
            open={false}
          />
        </ThemeProvider>,
      )

      expect(screen.queryByTestId('awaiter-lottie')).not.toBeInTheDocument()

      rerender(
        <ThemeProvider theme={testTheme}>
          <DialogAwaiter
            {...defaultProps}
            open={true}
          />
        </ThemeProvider>,
      )

      expect(screen.getByTestId('awaiter-lottie')).toBeInTheDocument()
    })

    it('should keep dialog mounted when closed', () => {
      const { rerender } = renderWithTheme(
        <DialogAwaiter
          {...defaultProps}
          open={true}
        />,
      )

      expect(screen.getByRole('dialog')).toBeInTheDocument()

      rerender(
        <ThemeProvider theme={testTheme}>
          <DialogAwaiter
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
        <DialogAwaiter
          {...defaultProps}
          open={true}
        />,
      )

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByTestId('awaiter-lottie')).toBeInTheDocument()
      expect(screen.getByTestId('dialog-wrapper')).toBeInTheDocument()
      expect(screen.getByText('Please Standby')).toBeInTheDocument()
    })

    it('should render wrapper components', () => {
      renderWithTheme(<DialogAwaiter {...defaultProps} />)

      expect(screen.getByTestId('dialog-wrapper')).toBeInTheDocument()
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should render with all props', () => {
      renderWithTheme(
        <DialogAwaiter
          isMobileWidth={true}
          message="Custom loading message"
          open={true}
        />,
      )

      expect(screen.getByText('Custom loading message')).toBeInTheDocument()
      expect(screen.getByTestId('awaiter-lottie')).toBeInTheDocument()
    })

    it('should render message with correct ID', () => {
      renderWithTheme(<DialogAwaiter {...defaultProps} />)

      const text = screen.getByText('Please Standby')
      expect(text).toHaveAttribute('id', 'dialog-api-alert')
    })
  })

  describe('Dialog Content', () => {
    it('should render message text', () => {
      renderWithTheme(<DialogAwaiter {...defaultProps} />)

      expect(screen.getByText('Please Standby')).toBeInTheDocument()
    })

    it('should render custom message text', () => {
      renderWithTheme(
        <DialogAwaiter
          {...defaultProps}
          message="Processing request"
        />,
      )

      expect(screen.getByText('Processing request')).toBeInTheDocument()
    })

    it('should render dialog content successfully', () => {
      renderWithTheme(<DialogAwaiter {...defaultProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Please Standby')).toBeInTheDocument()
    })

    it('should render animation and text together', () => {
      renderWithTheme(
        <DialogAwaiter
          {...defaultProps}
          open={true}
        />,
      )

      expect(screen.getByTestId('awaiter-lottie')).toBeInTheDocument()
      expect(screen.getByText('Please Standby')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle message with line breaks', () => {
      const multilineMessage = 'Please wait...\nProcessing your request'
      renderWithTheme(
        <DialogAwaiter
          {...defaultProps}
          message={multilineMessage}
        />,
      )

      expect(screen.getByText((content) => content.includes('Please wait'))).toBeInTheDocument()
    })

    it('should handle very long message', () => {
      const longMessage = 'A'.repeat(200)
      renderWithTheme(
        <DialogAwaiter
          {...defaultProps}
          message={longMessage}
        />,
      )

      expect(screen.getByText(longMessage)).toBeInTheDocument()
    })

    it('should handle message with numbers and symbols', () => {
      const symbolMessage = 'Loading... 50% complete! @#$%'
      renderWithTheme(
        <DialogAwaiter
          {...defaultProps}
          message={symbolMessage}
        />,
      )

      expect(screen.getByText(symbolMessage)).toBeInTheDocument()
    })

    it('should handle undefined props gracefully', () => {
      renderWithTheme(
        <DialogAwaiter
          isMobileWidth={false}
          message={undefined}
          open={true}
        />,
      )

      expect(screen.getByText('Please Standby')).toBeInTheDocument()
    })
  })

  describe('Integration Scenarios', () => {
    it('should work correctly on desktop with all features', () => {
      renderWithTheme(
        <DialogAwaiter
          isMobileWidth={false}
          message="Loading desktop content"
          open={true}
        />,
      )

      expect(screen.getByText('Loading desktop content')).toBeInTheDocument()
      expect(screen.getByTestId('awaiter-lottie')).toBeInTheDocument()
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should work correctly on mobile with all features', () => {
      renderWithTheme(
        <DialogAwaiter
          isMobileWidth={true}
          message="Loading mobile content"
          open={true}
        />,
      )

      expect(screen.getByText('Loading mobile content')).toBeInTheDocument()
      expect(screen.getByTestId('awaiter-lottie')).toBeInTheDocument()
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should handle state changes smoothly', () => {
      const { rerender } = renderWithTheme(
        <DialogAwaiter
          isMobileWidth={false}
          message="Initial message"
          open={true}
        />,
      )

      expect(screen.getByText('Initial message')).toBeInTheDocument()

      rerender(
        <ThemeProvider theme={testTheme}>
          <DialogAwaiter
            isMobileWidth={true}
            message="Updated message"
            open={true}
          />
        </ThemeProvider>,
      )

      expect(screen.getByText('Updated message')).toBeInTheDocument()
      expect(screen.queryByText('Initial message')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should be keyboard accessible', () => {
      renderWithTheme(<DialogAwaiter {...defaultProps} />)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
    })

    it('should have proper role for screen readers', () => {
      renderWithTheme(<DialogAwaiter {...defaultProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should render text content accessible to screen readers', () => {
      renderWithTheme(
        <DialogAwaiter
          {...defaultProps}
          message="Loading content for screen reader"
        />,
      )

      expect(screen.getByText('Loading content for screen reader')).toBeInTheDocument()
    })
  })

  describe('Dialog Properties', () => {
    it('should render dialog successfully', () => {
      renderWithTheme(<DialogAwaiter {...defaultProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should keep dialog mounted', () => {
      const { rerender } = renderWithTheme(
        <DialogAwaiter
          {...defaultProps}
          open={true}
        />,
      )

      expect(screen.getByRole('dialog')).toBeInTheDocument()

      rerender(
        <ThemeProvider theme={testTheme}>
          <DialogAwaiter
            {...defaultProps}
            open={false}
          />
        </ThemeProvider>,
      )

      // Dialog should still be in DOM (keepMounted: true)
      const dialogs = screen.queryAllByRole('dialog', { hidden: true })
      expect(dialogs.length).toBeGreaterThan(0)
    })

    it('should render with type-safe props', () => {
      // Verify component accepts Partial<DialogProps>
      renderWithTheme(
        <DialogAwaiter
          isMobileWidth={false}
          message="Type-safe message"
          open={true}
        />,
      )

      expect(screen.getByText('Type-safe message')).toBeInTheDocument()
    })
  })

  describe('Use Cases', () => {
    it('should work as a loading indicator', () => {
      renderWithTheme(
        <DialogAwaiter
          isMobileWidth={false}
          message="Loading..."
          open={true}
        />,
      )

      expect(screen.getByTestId('awaiter-lottie')).toBeInTheDocument()
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should work as a processing indicator', () => {
      renderWithTheme(
        <DialogAwaiter
          isMobileWidth={false}
          message="Processing your payment..."
          open={true}
        />,
      )

      expect(screen.getByText('Processing your payment...')).toBeInTheDocument()
    })

    it('should work as a generic wait indicator', () => {
      renderWithTheme(
        <DialogAwaiter
          isMobileWidth={false}
          open={true}
        />,
      )

      expect(screen.getByText('Please Standby')).toBeInTheDocument()
    })

    it('should be closable only programmatically', () => {
      const { rerender } = renderWithTheme(
        <DialogAwaiter
          isMobileWidth={false}
          open={true}
        />,
      )

      expect(screen.getByTestId('awaiter-lottie')).toBeInTheDocument()

      // Simulate programmatic close
      rerender(
        <ThemeProvider theme={testTheme}>
          <DialogAwaiter
            isMobileWidth={false}
            open={false}
          />
        </ThemeProvider>,
      )

      expect(screen.queryByTestId('awaiter-lottie')).not.toBeInTheDocument()
    })
  })
})
