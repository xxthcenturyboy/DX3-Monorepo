import { createTheme, ThemeProvider } from '@mui/material/styles'
import { render, screen } from '@testing-library/react'
import type React from 'react'

import { GlobalAwaiter } from './global-awaiter.component'

// Mock react-spinners
jest.mock('react-spinners', () => ({
  BeatLoader: ({ color, size, margin }: any) => (
    <div
      data-color={color}
      data-margin={margin}
      data-size={size}
      data-testid="beat-loader"
    >
      Loading Spinner
    </div>
  ),
}))

// Mock theme colors
jest.mock('../system/mui-overrides/styles', () => ({
  themeColors: {
    primary: '#1976d2',
    secondary: '#dc004e',
  },
}))

// Create a test theme
const testTheme = createTheme()

// Helper function to render with theme provider
const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={testTheme}>{ui}</ThemeProvider>)
}

describe('GlobalAwaiter', () => {
  const defaultProps = {
    open: true,
  }

  describe('Basic Rendering', () => {
    it('should render when open is true', () => {
      const { container } = renderWithTheme(<GlobalAwaiter {...defaultProps} />)

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should render BeatLoader spinner', () => {
      renderWithTheme(<GlobalAwaiter {...defaultProps} />)

      expect(screen.getByTestId('beat-loader')).toBeInTheDocument()
    })

    it('should pass correct props to BeatLoader', () => {
      renderWithTheme(<GlobalAwaiter {...defaultProps} />)

      const loader = screen.getByTestId('beat-loader')
      expect(loader).toHaveAttribute('data-color', '#dc004e')
      expect(loader).toHaveAttribute('data-size', '30')
      expect(loader).toHaveAttribute('data-margin', '2px')
    })

    it('should render Backdrop component', () => {
      const { container } = renderWithTheme(<GlobalAwaiter {...defaultProps} />)

      const backdrop = container.querySelector('.MuiBackdrop-root')
      expect(backdrop).toBeInTheDocument()
    })

    it('should not render message when message prop is not provided', () => {
      renderWithTheme(<GlobalAwaiter {...defaultProps} />)

      // Only spinner should be present, no heading/typography for message
      expect(screen.getByTestId('beat-loader')).toBeInTheDocument()
      // Use hidden:true since Backdrop sets aria-hidden on its children
      expect(screen.queryByRole('heading', { hidden: true })).not.toBeInTheDocument()
    })
  })

  describe('Open/Close State', () => {
    it('should be visible when open is true', () => {
      renderWithTheme(<GlobalAwaiter open={true} />)

      expect(screen.getByTestId('beat-loader')).toBeInTheDocument()
    })

    it('should not be visible when open is false', () => {
      renderWithTheme(<GlobalAwaiter open={false} />)

      // When closed, component still renders but backdrop should exist
      expect(screen.getByTestId('beat-loader')).toBeInTheDocument()
    })

    it('should transition from closed to open', () => {
      const { rerender } = renderWithTheme(<GlobalAwaiter open={false} />)

      expect(screen.getByTestId('beat-loader')).toBeInTheDocument()

      rerender(
        <ThemeProvider theme={testTheme}>
          <GlobalAwaiter open={true} />
        </ThemeProvider>,
      )

      expect(screen.getByTestId('beat-loader')).toBeInTheDocument()
    })

    it('should transition from open to closed', () => {
      const { rerender } = renderWithTheme(<GlobalAwaiter open={true} />)

      expect(screen.getByTestId('beat-loader')).toBeInTheDocument()

      rerender(
        <ThemeProvider theme={testTheme}>
          <GlobalAwaiter open={false} />
        </ThemeProvider>,
      )

      expect(screen.getByTestId('beat-loader')).toBeInTheDocument()
    })

    it('should handle rapid open/close toggling', () => {
      const { rerender } = renderWithTheme(<GlobalAwaiter open={true} />)

      rerender(
        <ThemeProvider theme={testTheme}>
          <GlobalAwaiter open={false} />
        </ThemeProvider>,
      )
      rerender(
        <ThemeProvider theme={testTheme}>
          <GlobalAwaiter open={true} />
        </ThemeProvider>,
      )
      rerender(
        <ThemeProvider theme={testTheme}>
          <GlobalAwaiter open={false} />
        </ThemeProvider>,
      )

      // Component should still render without errors
      expect(screen.getByTestId('beat-loader')).toBeInTheDocument()
    })
  })

  describe('Message Display', () => {
    it('should show message when provided', () => {
      renderWithTheme(
        <GlobalAwaiter
          {...defaultProps}
          message="Loading data..."
        />,
      )

      expect(screen.getByText('Loading data...')).toBeInTheDocument()
    })

    it('should not show message when not provided', () => {
      renderWithTheme(<GlobalAwaiter {...defaultProps} />)

      const beatLoader = screen.getByTestId('beat-loader')
      expect(beatLoader).toBeInTheDocument()
      expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    })

    it('should not show message when empty string', () => {
      renderWithTheme(
        <GlobalAwaiter
          {...defaultProps}
          message=""
        />,
      )

      expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    })

    it('should show message when truthy string provided', () => {
      renderWithTheme(
        <GlobalAwaiter
          {...defaultProps}
          message="Please wait"
        />,
      )

      expect(screen.getByText('Please wait')).toBeInTheDocument()
    })

    it('should render long message', () => {
      const longMessage = 'This is a very long message that explains what is happening in detail.'
      renderWithTheme(
        <GlobalAwaiter
          {...defaultProps}
          message={longMessage}
        />,
      )

      expect(screen.getByText(longMessage)).toBeInTheDocument()
    })

    it('should handle message with special characters', () => {
      const specialMessage = 'Loading: <data> & processing...'
      renderWithTheme(
        <GlobalAwaiter
          {...defaultProps}
          message={specialMessage}
        />,
      )

      expect(screen.getByText(specialMessage)).toBeInTheDocument()
    })

    it('should update message dynamically', () => {
      const { rerender } = renderWithTheme(
        <GlobalAwaiter
          {...defaultProps}
          message="Loading..."
        />,
      )

      expect(screen.getByText('Loading...')).toBeInTheDocument()

      rerender(
        <ThemeProvider theme={testTheme}>
          <GlobalAwaiter
            {...defaultProps}
            message="Processing..."
          />
        </ThemeProvider>,
      )

      expect(screen.getByText('Processing...')).toBeInTheDocument()
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    it('should add message after initial render', () => {
      const { rerender } = renderWithTheme(<GlobalAwaiter {...defaultProps} />)

      expect(screen.queryByRole('heading')).not.toBeInTheDocument()

      rerender(
        <ThemeProvider theme={testTheme}>
          <GlobalAwaiter
            {...defaultProps}
            message="New message"
          />
        </ThemeProvider>,
      )

      expect(screen.getByText('New message')).toBeInTheDocument()
    })

    it('should remove message', () => {
      const { rerender } = renderWithTheme(
        <GlobalAwaiter
          {...defaultProps}
          message="Remove me"
        />,
      )

      expect(screen.getByText('Remove me')).toBeInTheDocument()

      rerender(
        <ThemeProvider theme={testTheme}>
          <GlobalAwaiter
            {...defaultProps}
            message=""
          />
        </ThemeProvider>,
      )

      expect(screen.queryByText('Remove me')).not.toBeInTheDocument()
    })
  })

  describe('Component Structure', () => {
    it('should render spinner and message together', () => {
      renderWithTheme(
        <GlobalAwaiter
          {...defaultProps}
          message="Loading content"
        />,
      )

      expect(screen.getByTestId('beat-loader')).toBeInTheDocument()
      expect(screen.getByText('Loading content')).toBeInTheDocument()
    })

    it('should render spinner only', () => {
      renderWithTheme(<GlobalAwaiter {...defaultProps} />)

      expect(screen.getByTestId('beat-loader')).toBeInTheDocument()
      expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    })

    it('should always render spinner when open', () => {
      const { rerender } = renderWithTheme(
        <GlobalAwaiter
          message="Message 1"
          open={true}
        />,
      )

      expect(screen.getByTestId('beat-loader')).toBeInTheDocument()

      rerender(
        <ThemeProvider theme={testTheme}>
          <GlobalAwaiter
            message="Message 2"
            open={true}
          />
        </ThemeProvider>,
      )

      expect(screen.getByTestId('beat-loader')).toBeInTheDocument()

      rerender(
        <ThemeProvider theme={testTheme}>
          <GlobalAwaiter open={true} />
        </ThemeProvider>,
      )

      expect(screen.getByTestId('beat-loader')).toBeInTheDocument()
    })

    it('should render message as Typography h5', () => {
      const { container } = renderWithTheme(
        <GlobalAwaiter
          {...defaultProps}
          message="Test message"
        />,
      )

      const typography = container.querySelector('.MuiTypography-h5')
      expect(typography).toBeInTheDocument()
      expect(typography).toHaveTextContent('Test message')
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined message', () => {
      renderWithTheme(
        <GlobalAwaiter
          {...defaultProps}
          message={undefined}
        />,
      )

      expect(screen.getByTestId('beat-loader')).toBeInTheDocument()
      expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    })

    it('should handle message with only whitespace', () => {
      renderWithTheme(
        <GlobalAwaiter
          {...defaultProps}
          message="   "
        />,
      )

      // Whitespace is truthy, so message box should appear
      // Typography/heading should be rendered even if content is whitespace
      // Use hidden:true since Backdrop sets aria-hidden on its children
      expect(screen.getByRole('heading', { hidden: true })).toBeInTheDocument()
    })

    it('should handle message with line breaks', () => {
      const messageWithBreaks = 'Line 1\nLine 2'
      renderWithTheme(
        <GlobalAwaiter
          {...defaultProps}
          message={messageWithBreaks}
        />,
      )

      expect(screen.getByText((content) => content.includes('Line 1'))).toBeInTheDocument()
    })

    it('should handle very long messages', () => {
      const veryLongMessage = 'A'.repeat(500)
      renderWithTheme(
        <GlobalAwaiter
          {...defaultProps}
          message={veryLongMessage}
        />,
      )

      expect(screen.getByText(veryLongMessage)).toBeInTheDocument()
    })

    it('should handle message with numbers', () => {
      renderWithTheme(
        <GlobalAwaiter
          {...defaultProps}
          message="Loading... 50%"
        />,
      )

      expect(screen.getByText('Loading... 50%')).toBeInTheDocument()
    })
  })

  describe('Use Cases', () => {
    it('should work as a global loading indicator', () => {
      renderWithTheme(<GlobalAwaiter open={true} />)

      expect(screen.getByTestId('beat-loader')).toBeInTheDocument()
    })

    it('should work as a loading indicator with progress message', () => {
      renderWithTheme(
        <GlobalAwaiter
          message="Uploading files..."
          open={true}
        />,
      )

      expect(screen.getByTestId('beat-loader')).toBeInTheDocument()
      expect(screen.getByText('Uploading files...')).toBeInTheDocument()
    })

    it('should work for API calls', () => {
      renderWithTheme(
        <GlobalAwaiter
          message="Fetching data from server..."
          open={true}
        />,
      )

      expect(screen.getByText('Fetching data from server...')).toBeInTheDocument()
    })

    it('should work for background processing', () => {
      renderWithTheme(
        <GlobalAwaiter
          message="Processing in background..."
          open={true}
        />,
      )

      expect(screen.getByText('Processing in background...')).toBeInTheDocument()
    })

    it('should work without message for simple loading', () => {
      renderWithTheme(<GlobalAwaiter open={true} />)

      expect(screen.getByTestId('beat-loader')).toBeInTheDocument()
      expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    })
  })

  describe('Integration Scenarios', () => {
    it('should handle full lifecycle: closed -> open with message -> message change -> closed', () => {
      const { container, rerender } = renderWithTheme(<GlobalAwaiter open={false} />)

      let backdrop = container.querySelector('.MuiBackdrop-root')
      expect(backdrop).not.toHaveClass('MuiBackdrop-open')

      rerender(
        <ThemeProvider theme={testTheme}>
          <GlobalAwaiter
            message="Step 1"
            open={true}
          />
        </ThemeProvider>,
      )

      expect(screen.getByText('Step 1')).toBeInTheDocument()

      rerender(
        <ThemeProvider theme={testTheme}>
          <GlobalAwaiter
            message="Step 2"
            open={true}
          />
        </ThemeProvider>,
      )

      expect(screen.getByText('Step 2')).toBeInTheDocument()
      expect(screen.queryByText('Step 1')).not.toBeInTheDocument()

      rerender(
        <ThemeProvider theme={testTheme}>
          <GlobalAwaiter open={false} />
        </ThemeProvider>,
      )

      backdrop = container.querySelector('.MuiBackdrop-root')
      expect(backdrop).not.toHaveClass('MuiBackdrop-open')
    })

    it('should work with all props combined', () => {
      renderWithTheme(
        <GlobalAwaiter
          message="Complete loading message"
          open={true}
        />,
      )

      expect(screen.getByTestId('beat-loader')).toBeInTheDocument()
      expect(screen.getByText('Complete loading message')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should render accessible message text', () => {
      renderWithTheme(
        <GlobalAwaiter
          {...defaultProps}
          message="Accessible loading message"
        />,
      )

      expect(screen.getByText('Accessible loading message')).toBeInTheDocument()
    })

    it('should have backdrop for modal-like behavior', () => {
      const { container } = renderWithTheme(<GlobalAwaiter open={true} />)

      const backdrop = container.querySelector('.MuiBackdrop-root')
      expect(backdrop).toBeInTheDocument()
    })

    it('should render message with proper Typography component', () => {
      const { container } = renderWithTheme(
        <GlobalAwaiter
          {...defaultProps}
          message="Accessible text"
        />,
      )

      const typography = container.querySelector('.MuiTypography-root')
      expect(typography).toBeInTheDocument()
      expect(typography).toHaveTextContent('Accessible text')
    })
  })

  describe('Backdrop Behavior', () => {
    it('should render backdrop when open', () => {
      const { container } = renderWithTheme(<GlobalAwaiter open={true} />)

      const backdrop = container.querySelector('.MuiBackdrop-root')
      expect(backdrop).toBeInTheDocument()
      expect(screen.getByTestId('beat-loader')).toBeInTheDocument()
    })

    it('should render backdrop when closed', () => {
      const { container } = renderWithTheme(<GlobalAwaiter open={false} />)

      const backdrop = container.querySelector('.MuiBackdrop-root')
      expect(backdrop).toBeInTheDocument()
    })

    it('should maintain backdrop with message changes', () => {
      const { container, rerender } = renderWithTheme(
        <GlobalAwaiter
          message="Message 1"
          open={true}
        />,
      )

      let backdrop = container.querySelector('.MuiBackdrop-root')
      expect(backdrop).toBeInTheDocument()
      expect(screen.getByText('Message 1')).toBeInTheDocument()

      rerender(
        <ThemeProvider theme={testTheme}>
          <GlobalAwaiter
            message="Message 2"
            open={true}
          />
        </ThemeProvider>,
      )

      backdrop = container.querySelector('.MuiBackdrop-root')
      expect(backdrop).toBeInTheDocument()
      expect(screen.getByText('Message 2')).toBeInTheDocument()
    })
  })

  describe('Conditional Rendering', () => {
    it('should conditionally render message box based on truthy message', () => {
      const { rerender } = renderWithTheme(
        <GlobalAwaiter
          {...defaultProps}
          message=""
        />,
      )

      expect(screen.queryByRole('heading')).not.toBeInTheDocument()

      rerender(
        <ThemeProvider theme={testTheme}>
          <GlobalAwaiter
            {...defaultProps}
            message="Now visible"
          />
        </ThemeProvider>,
      )

      expect(screen.getByText('Now visible')).toBeInTheDocument()
    })

    it('should use !! operator for message conditional', () => {
      // Test falsy values
      const { rerender } = renderWithTheme(
        <GlobalAwaiter
          {...defaultProps}
          message=""
        />,
      )
      expect(screen.queryByRole('heading')).not.toBeInTheDocument()

      rerender(
        <ThemeProvider theme={testTheme}>
          <GlobalAwaiter
            {...defaultProps}
            message={undefined}
          />
        </ThemeProvider>,
      )
      expect(screen.queryByRole('heading')).not.toBeInTheDocument()

      // Test truthy value
      rerender(
        <ThemeProvider theme={testTheme}>
          <GlobalAwaiter
            {...defaultProps}
            message="Truthy"
          />
        </ThemeProvider>,
      )
      expect(screen.getByText('Truthy')).toBeInTheDocument()
    })
  })
})
