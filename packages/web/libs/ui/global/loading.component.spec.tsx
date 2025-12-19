import { createTheme, ThemeProvider } from '@mui/material/styles'
import { fireEvent, render, screen } from '@testing-library/react'
import type React from 'react'

import { UiLoadingComponent } from './loading.component'

// Mock the BeatLoader component
jest.mock('react-spinners', () => ({
  BeatLoader: (props: any) => (
    <div
      data-color={props.color}
      data-margin={props.margin}
      data-size={props.size}
      data-testid="beat-loader"
    >
      Loading Spinner
    </div>
  ),
}))

describe('UiLoadingComponent', () => {
  const testTheme = createTheme()

  const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider theme={testTheme}>{component}</ThemeProvider>)
  }

  describe('Default State', () => {
    it('should return null when no props are provided', () => {
      const { container } = renderWithTheme(<UiLoadingComponent />)

      expect(container.firstChild).toBeNull()
    })

    it('should return null when all boolean props are false', () => {
      const { container } = renderWithTheme(
        <UiLoadingComponent
          error={undefined}
          pastDelay={false}
          timedOut={false}
        />,
      )

      expect(container.firstChild).toBeNull()
    })

    it('should return null when only retry function is provided', () => {
      const mockRetry = jest.fn()
      const { container } = renderWithTheme(<UiLoadingComponent retry={mockRetry} />)

      expect(container.firstChild).toBeNull()
    })
  })

  describe('Error State', () => {
    it('should display error message when error prop is provided', () => {
      const testError = new Error('Network connection failed')
      renderWithTheme(<UiLoadingComponent error={testError} />)

      expect(screen.getByText('Network connection failed')).toBeInTheDocument()
    })

    it('should render retry button in error state', () => {
      const testError = new Error('Something went wrong')
      renderWithTheme(<UiLoadingComponent error={testError} />)

      const retryButton = screen.getByRole('button', { name: /retry/i })
      expect(retryButton).toBeInTheDocument()
    })

    it('should call retry function when retry button is clicked in error state', () => {
      const mockRetry = jest.fn()
      const testError = new Error('Error occurred')
      renderWithTheme(
        <UiLoadingComponent
          error={testError}
          retry={mockRetry}
        />,
      )

      const retryButton = screen.getByRole('button', { name: /retry/i })
      fireEvent.click(retryButton)

      expect(mockRetry).toHaveBeenCalledTimes(1)
    })

    it('should handle retry button click when retry is not provided', () => {
      const testError = new Error('Error occurred')
      renderWithTheme(<UiLoadingComponent error={testError} />)

      const retryButton = screen.getByRole('button', { name: /retry/i })

      // Should not throw error when clicked
      expect(() => fireEvent.click(retryButton)).not.toThrow()
    })

    it('should display different error messages correctly', () => {
      const error1 = new Error('Database connection lost')
      const { rerender } = renderWithTheme(<UiLoadingComponent error={error1} />)

      expect(screen.getByText('Database connection lost')).toBeInTheDocument()

      const error2 = new Error('Authentication failed')
      rerender(
        <ThemeProvider theme={testTheme}>
          <UiLoadingComponent error={error2} />
        </ThemeProvider>,
      )

      expect(screen.getByText('Authentication failed')).toBeInTheDocument()
      expect(screen.queryByText('Database connection lost')).not.toBeInTheDocument()
    })

    it('should handle error with empty message', () => {
      const emptyError = new Error('')
      renderWithTheme(<UiLoadingComponent error={emptyError} />)

      const retryButton = screen.getByRole('button', { name: /retry/i })
      expect(retryButton).toBeInTheDocument()
    })

    it('should prioritize error state over other states', () => {
      const testError = new Error('Priority error')
      renderWithTheme(
        <UiLoadingComponent
          error={testError}
          pastDelay={true}
          timedOut={true}
        />,
      )

      expect(screen.getByText('Priority error')).toBeInTheDocument()
      expect(screen.queryByText('timed out')).not.toBeInTheDocument()
      expect(screen.queryByTestId('beat-loader')).not.toBeInTheDocument()
    })

    it('should handle multiple retry button clicks in error state', () => {
      const mockRetry = jest.fn()
      const testError = new Error('Error')
      renderWithTheme(
        <UiLoadingComponent
          error={testError}
          retry={mockRetry}
        />,
      )

      const retryButton = screen.getByRole('button', { name: /retry/i })
      fireEvent.click(retryButton)
      fireEvent.click(retryButton)
      fireEvent.click(retryButton)

      expect(mockRetry).toHaveBeenCalledTimes(3)
    })
  })

  describe('Timed Out State', () => {
    it('should display "timed out" message when timedOut is true', () => {
      renderWithTheme(<UiLoadingComponent timedOut={true} />)

      expect(screen.getByText('timed out')).toBeInTheDocument()
    })

    it('should render retry button in timed out state', () => {
      renderWithTheme(<UiLoadingComponent timedOut={true} />)

      const retryButton = screen.getByRole('button', { name: /retry/i })
      expect(retryButton).toBeInTheDocument()
    })

    it('should call retry function when retry button is clicked in timed out state', () => {
      const mockRetry = jest.fn()
      renderWithTheme(
        <UiLoadingComponent
          retry={mockRetry}
          timedOut={true}
        />,
      )

      const retryButton = screen.getByRole('button', { name: /retry/i })
      fireEvent.click(retryButton)

      expect(mockRetry).toHaveBeenCalledTimes(1)
    })

    it('should handle retry button click when retry is not provided in timed out state', () => {
      renderWithTheme(<UiLoadingComponent timedOut={true} />)

      const retryButton = screen.getByRole('button', { name: /retry/i })

      // Should not throw error when clicked
      expect(() => fireEvent.click(retryButton)).not.toThrow()
    })

    it('should prioritize timed out state over pastDelay state', () => {
      renderWithTheme(
        <UiLoadingComponent
          pastDelay={true}
          timedOut={true}
        />,
      )

      expect(screen.getByText('timed out')).toBeInTheDocument()
      expect(screen.queryByTestId('beat-loader')).not.toBeInTheDocument()
    })

    it('should handle multiple retry clicks in timed out state', () => {
      const mockRetry = jest.fn()
      renderWithTheme(
        <UiLoadingComponent
          retry={mockRetry}
          timedOut={true}
        />,
      )

      const retryButton = screen.getByRole('button', { name: /retry/i })
      fireEvent.click(retryButton)
      fireEvent.click(retryButton)

      expect(mockRetry).toHaveBeenCalledTimes(2)
    })
  })

  describe('Past Delay State', () => {
    it('should display loading spinner when pastDelay is true', () => {
      renderWithTheme(<UiLoadingComponent pastDelay={true} />)

      expect(screen.getByTestId('beat-loader')).toBeInTheDocument()
    })

    it('should not display retry button in pastDelay state', () => {
      renderWithTheme(<UiLoadingComponent pastDelay={true} />)

      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('should not display error or timeout messages in pastDelay state', () => {
      renderWithTheme(<UiLoadingComponent pastDelay={true} />)

      // Should only have the loader, no error or timeout messages
      expect(screen.queryByText('timed out')).not.toBeInTheDocument()
      expect(screen.getByTestId('beat-loader')).toBeInTheDocument()
    })

    it('should render BeatLoader with correct props', () => {
      renderWithTheme(<UiLoadingComponent pastDelay={true} />)

      const loader = screen.getByTestId('beat-loader')
      expect(loader).toHaveAttribute('data-color')
      expect(loader).toHaveAttribute('data-size', '30')
      expect(loader).toHaveAttribute('data-margin', '2px')
    })
  })

  describe('State Transitions', () => {
    it('should transition from pastDelay to error state', () => {
      const { rerender } = renderWithTheme(<UiLoadingComponent pastDelay={true} />)

      expect(screen.getByTestId('beat-loader')).toBeInTheDocument()

      const testError = new Error('Loading failed')
      rerender(
        <ThemeProvider theme={testTheme}>
          <UiLoadingComponent error={testError} />
        </ThemeProvider>,
      )

      expect(screen.queryByTestId('beat-loader')).not.toBeInTheDocument()
      expect(screen.getByText('Loading failed')).toBeInTheDocument()
    })

    it('should transition from pastDelay to timedOut state', () => {
      const { rerender } = renderWithTheme(<UiLoadingComponent pastDelay={true} />)

      expect(screen.getByTestId('beat-loader')).toBeInTheDocument()

      rerender(
        <ThemeProvider theme={testTheme}>
          <UiLoadingComponent timedOut={true} />
        </ThemeProvider>,
      )

      expect(screen.queryByTestId('beat-loader')).not.toBeInTheDocument()
      expect(screen.getByText('timed out')).toBeInTheDocument()
    })

    it('should transition from null to pastDelay state', () => {
      const { container, rerender } = renderWithTheme(<UiLoadingComponent />)

      expect(container.firstChild).toBeNull()

      rerender(
        <ThemeProvider theme={testTheme}>
          <UiLoadingComponent pastDelay={true} />
        </ThemeProvider>,
      )

      expect(screen.getByTestId('beat-loader')).toBeInTheDocument()
    })

    it('should transition back to null state', () => {
      const { container, rerender } = renderWithTheme(<UiLoadingComponent pastDelay={true} />)

      expect(screen.getByTestId('beat-loader')).toBeInTheDocument()

      rerender(
        <ThemeProvider theme={testTheme}>
          <UiLoadingComponent pastDelay={false} />
        </ThemeProvider>,
      )

      expect(container.firstChild).toBeNull()
    })
  })

  describe('Retry Function Handling', () => {
    it('should only call retry when it is a function', () => {
      const mockRetry = jest.fn()
      const testError = new Error('Test error')
      renderWithTheme(
        <UiLoadingComponent
          error={testError}
          retry={mockRetry}
        />,
      )

      fireEvent.click(screen.getByRole('button', { name: /retry/i }))

      expect(mockRetry).toHaveBeenCalledTimes(1)
    })

    it('should not call retry when it is undefined', () => {
      const testError = new Error('Test error')
      renderWithTheme(
        <UiLoadingComponent
          error={testError}
          retry={undefined}
        />,
      )

      const retryButton = screen.getByRole('button', { name: /retry/i })

      // Should not throw when retry is undefined
      expect(() => fireEvent.click(retryButton)).not.toThrow()
    })

    it('should work with different retry functions', () => {
      const mockRetry1 = jest.fn()
      const mockRetry2 = jest.fn()
      const testError = new Error('Test error')

      const { rerender } = renderWithTheme(
        <UiLoadingComponent
          error={testError}
          retry={mockRetry1}
        />,
      )

      fireEvent.click(screen.getByRole('button', { name: /retry/i }))
      expect(mockRetry1).toHaveBeenCalledTimes(1)

      rerender(
        <ThemeProvider theme={testTheme}>
          <UiLoadingComponent
            error={testError}
            retry={mockRetry2}
          />
        </ThemeProvider>,
      )

      fireEvent.click(screen.getByRole('button', { name: /retry/i }))
      expect(mockRetry2).toHaveBeenCalledTimes(1)
      expect(mockRetry1).toHaveBeenCalledTimes(1) // Should not be called again
    })
  })

  describe('Component Structure', () => {
    it('should use StyledContentWrapper in error state', () => {
      const testError = new Error('Error')
      const { container } = renderWithTheme(<UiLoadingComponent error={testError} />)

      // StyledContentWrapper renders a Box
      expect(container.querySelector('.MuiBox-root')).toBeInTheDocument()
    })

    it('should use StyledContentWrapper in timed out state', () => {
      const { container } = renderWithTheme(<UiLoadingComponent timedOut={true} />)

      expect(container.querySelector('.MuiBox-root')).toBeInTheDocument()
    })

    it('should use StyledContentWrapper in pastDelay state', () => {
      const { container } = renderWithTheme(<UiLoadingComponent pastDelay={true} />)

      expect(container.querySelector('.MuiBox-root')).toBeInTheDocument()
    })

    it('should use Grid for layout in all states', () => {
      const testError = new Error('Error')
      const { container, rerender } = renderWithTheme(<UiLoadingComponent error={testError} />)

      expect(container.querySelector('.MuiGrid-root')).toBeInTheDocument()

      rerender(
        <ThemeProvider theme={testTheme}>
          <UiLoadingComponent timedOut={true} />
        </ThemeProvider>,
      )
      expect(container.querySelector('.MuiGrid-root')).toBeInTheDocument()

      rerender(
        <ThemeProvider theme={testTheme}>
          <UiLoadingComponent pastDelay={true} />
        </ThemeProvider>,
      )
      expect(container.querySelector('.MuiGrid-root')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have accessible retry button in error state', () => {
      const testError = new Error('Error')
      renderWithTheme(<UiLoadingComponent error={testError} />)

      const button = screen.getByRole('button', { name: /retry/i })
      expect(button).toBeEnabled()
    })

    it('should have accessible retry button in timed out state', () => {
      renderWithTheme(<UiLoadingComponent timedOut={true} />)

      const button = screen.getByRole('button', { name: /retry/i })
      expect(button).toBeEnabled()
    })

    it('should display error message in a readable format', () => {
      const testError = new Error('Connection timeout. Please check your internet.')
      renderWithTheme(<UiLoadingComponent error={testError} />)

      expect(
        screen.getByText('Connection timeout. Please check your internet.'),
      ).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle error with very long message', () => {
      const longMessage = 'A'.repeat(500)
      const testError = new Error(longMessage)
      renderWithTheme(<UiLoadingComponent error={testError} />)

      expect(screen.getByText(longMessage)).toBeInTheDocument()
    })

    it('should handle special characters in error message', () => {
      const specialError = new Error('Error: <script>alert("XSS")</script> & "quotes"')
      renderWithTheme(<UiLoadingComponent error={specialError} />)

      expect(
        screen.getByText('Error: <script>alert("XSS")</script> & "quotes"'),
      ).toBeInTheDocument()
    })

    it('should handle error with line breaks in message', () => {
      const multilineError = new Error('Line 1\nLine 2\nLine 3')
      renderWithTheme(<UiLoadingComponent error={multilineError} />)

      expect(screen.getByText(/Line 1/)).toBeInTheDocument()
    })

    it('should handle all props set to false/undefined', () => {
      const { container } = renderWithTheme(
        <UiLoadingComponent
          error={undefined}
          pastDelay={false}
          retry={undefined}
          timedOut={false}
        />,
      )

      expect(container.firstChild).toBeNull()
    })
  })
})
