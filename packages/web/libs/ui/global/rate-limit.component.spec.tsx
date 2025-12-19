import { createTheme, ThemeProvider } from '@mui/material/styles'
import { render, screen } from '@testing-library/react'
import type React from 'react'

import { RateLimitComponent } from './rate-limit.component'

// Mock the StopwatchLottie component
jest.mock('../lottie/stopwatch.lottie', () => ({
  StopwatchLottie: () => <div data-testid="stopwatch-lottie">Stopwatch Animation</div>,
}))

describe('RateLimitComponent', () => {
  const testTheme = createTheme()

  const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider theme={testTheme}>{component}</ThemeProvider>)
  }

  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      renderWithTheme(<RateLimitComponent />)

      expect(screen.getByText('Timeout, Turbo')).toBeInTheDocument()
    })

    it('should render the stopwatch lottie animation', () => {
      renderWithTheme(<RateLimitComponent />)

      expect(screen.getByTestId('stopwatch-lottie')).toBeInTheDocument()
    })

    it('should display the main heading', () => {
      renderWithTheme(<RateLimitComponent />)

      const heading = screen.getByText('Timeout, Turbo')
      expect(heading).toBeInTheDocument()
      expect(heading.tagName).toBe('H1')
    })

    it('should display the rate limit message', () => {
      renderWithTheme(<RateLimitComponent />)

      const message = screen.getByText(
        /You have made too many requests\. Please wait several minutes before trying again\./,
      )
      expect(message).toBeInTheDocument()
    })

    it('should not render any buttons', () => {
      renderWithTheme(<RateLimitComponent />)

      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('should not render any input fields', () => {
      renderWithTheme(<RateLimitComponent />)

      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    })
  })

  describe('Static Content', () => {
    it('should always display "Timeout, Turbo" heading', () => {
      renderWithTheme(<RateLimitComponent />)

      const heading = screen.getByText('Timeout, Turbo')
      expect(heading).toBeInTheDocument()
      expect(heading.tagName).toBe('H1')
    })

    it('should always display the full rate limit message', () => {
      renderWithTheme(<RateLimitComponent />)

      expect(
        screen.getByText(
          'You have made too many requests. Please wait several minutes before trying again.',
        ),
      ).toBeInTheDocument()
    })

    it('should display animation regardless of renders', () => {
      const { rerender } = renderWithTheme(<RateLimitComponent />)

      expect(screen.getByTestId('stopwatch-lottie')).toBeInTheDocument()

      rerender(
        <ThemeProvider theme={testTheme}>
          <RateLimitComponent />
        </ThemeProvider>,
      )

      expect(screen.getByTestId('stopwatch-lottie')).toBeInTheDocument()
    })
  })

  describe('Component Structure', () => {
    it('should render all main elements in correct order', () => {
      renderWithTheme(<RateLimitComponent />)

      expect(screen.getByTestId('stopwatch-lottie')).toBeInTheDocument()
      expect(screen.getByText('Timeout, Turbo')).toBeInTheDocument()
      expect(
        screen.getByText(
          /You have made too many requests\. Please wait several minutes before trying again\./,
        ),
      ).toBeInTheDocument()
    })

    it('should wrap content in StyledContentWrapper', () => {
      const { container } = renderWithTheme(<RateLimitComponent />)

      // StyledContentWrapper renders a Box component
      const wrapper = container.querySelector('.MuiBox-root')
      expect(wrapper).toBeInTheDocument()
    })

    it('should use Grid for layout', () => {
      const { container } = renderWithTheme(<RateLimitComponent />)

      // Grid should be present for layout
      const grid = container.querySelector('.MuiGrid-root')
      expect(grid).toBeInTheDocument()
    })
  })

  describe('Typography Variants', () => {
    it('should use h1 variant for main heading', () => {
      renderWithTheme(<RateLimitComponent />)

      const heading = screen.getByText('Timeout, Turbo')
      expect(heading).toHaveClass('MuiTypography-h1')
    })

    it('should use h5 variant for message', () => {
      renderWithTheme(<RateLimitComponent />)

      const message = screen.getByText(
        /You have made too many requests\. Please wait several minutes before trying again\./,
      )
      expect(message).toHaveClass('MuiTypography-h5')
    })
  })

  describe('Accessibility', () => {
    it('should have descriptive message text', () => {
      renderWithTheme(<RateLimitComponent />)

      expect(
        screen.getByText(
          'You have made too many requests. Please wait several minutes before trying again.',
        ),
      ).toBeInTheDocument()
    })

    it('should have a clear heading structure', () => {
      renderWithTheme(<RateLimitComponent />)

      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveTextContent('Timeout, Turbo')
    })

    it('should provide clear instruction to users', () => {
      renderWithTheme(<RateLimitComponent />)

      const message = screen.getByText(/wait several minutes before trying again/i)
      expect(message).toBeInTheDocument()
    })
  })

  describe('Rendering Consistency', () => {
    it('should render the same content on multiple renders', () => {
      const { rerender } = renderWithTheme(<RateLimitComponent />)

      expect(screen.getByText('Timeout, Turbo')).toBeInTheDocument()

      rerender(
        <ThemeProvider theme={testTheme}>
          <RateLimitComponent />
        </ThemeProvider>,
      )

      expect(screen.getByText('Timeout, Turbo')).toBeInTheDocument()
      expect(
        screen.getByText(
          'You have made too many requests. Please wait several minutes before trying again.',
        ),
      ).toBeInTheDocument()
    })

    it('should maintain consistent structure across renders', () => {
      const { container, rerender } = renderWithTheme(<RateLimitComponent />)

      const firstRenderHTML = container.innerHTML

      rerender(
        <ThemeProvider theme={testTheme}>
          <RateLimitComponent />
        </ThemeProvider>,
      )

      const secondRenderHTML = container.innerHTML

      expect(firstRenderHTML).toBe(secondRenderHTML)
    })
  })

  describe('Component Identity', () => {
    it('should have distinct content for rate limiting scenario', () => {
      renderWithTheme(<RateLimitComponent />)

      // Should have "Timeout, Turbo" not other error messages
      expect(screen.getByText('Timeout, Turbo')).toBeInTheDocument()
      expect(screen.queryByText('Not Found')).not.toBeInTheDocument()
      expect(screen.queryByText('Ouch')).not.toBeInTheDocument()
    })

    it('should have appropriate message for rate limiting', () => {
      renderWithTheme(<RateLimitComponent />)

      const message = screen.getByText(
        'You have made too many requests. Please wait several minutes before trying again.',
      )
      expect(message).toBeInTheDocument()
    })

    it('should use stopwatch animation appropriate for timeout', () => {
      renderWithTheme(<RateLimitComponent />)

      expect(screen.getByTestId('stopwatch-lottie')).toBeInTheDocument()
    })
  })

  describe('Message Content', () => {
    it('should inform user about too many requests', () => {
      renderWithTheme(<RateLimitComponent />)

      const message = screen.getByText(/too many requests/i)
      expect(message).toBeInTheDocument()
    })

    it('should provide timeframe guidance', () => {
      renderWithTheme(<RateLimitComponent />)

      const message = screen.getByText(/several minutes/i)
      expect(message).toBeInTheDocument()
    })

    it('should instruct to try again later', () => {
      renderWithTheme(<RateLimitComponent />)

      const message = screen.getByText(/trying again/i)
      expect(message).toBeInTheDocument()
    })
  })

  describe('No Interactive Elements', () => {
    it('should not have any clickable elements', () => {
      const { container } = renderWithTheme(<RateLimitComponent />)

      const buttons = container.querySelectorAll('button')
      const links = container.querySelectorAll('a')

      expect(buttons.length).toBe(0)
      expect(links.length).toBe(0)
    })

    it('should be a purely informational component', () => {
      renderWithTheme(<RateLimitComponent />)

      // No buttons, inputs, or other interactive elements
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
      expect(screen.queryByRole('link')).not.toBeInTheDocument()
      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    })
  })

  describe('Theme Integration', () => {
    it('should render properly with light theme', () => {
      const lightTheme = createTheme({ palette: { mode: 'light' } })

      render(
        <ThemeProvider theme={lightTheme}>
          <RateLimitComponent />
        </ThemeProvider>,
      )

      expect(screen.getByText('Timeout, Turbo')).toBeInTheDocument()
    })

    it('should render properly with dark theme', () => {
      const darkTheme = createTheme({ palette: { mode: 'dark' } })

      render(
        <ThemeProvider theme={darkTheme}>
          <RateLimitComponent />
        </ThemeProvider>,
      )

      expect(screen.getByText('Timeout, Turbo')).toBeInTheDocument()
    })

    it('should render properly with custom theme', () => {
      const customTheme = createTheme({
        palette: {
          primary: { main: '#ff0000' },
          secondary: { main: '#00ff00' },
        },
      })

      render(
        <ThemeProvider theme={customTheme}>
          <RateLimitComponent />
        </ThemeProvider>,
      )

      expect(screen.getByText('Timeout, Turbo')).toBeInTheDocument()
      expect(
        screen.getByText(
          'You have made too many requests. Please wait several minutes before trying again.',
        ),
      ).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should render without errors when theme is provided', () => {
      expect(() => renderWithTheme(<RateLimitComponent />)).not.toThrow()
    })

    it('should have stable rendering', () => {
      const { container } = renderWithTheme(<RateLimitComponent />)

      // Should not be empty
      expect(container.firstChild).not.toBeNull()

      // Should contain expected elements
      expect(screen.getByTestId('stopwatch-lottie')).toBeInTheDocument()
      expect(screen.getByText('Timeout, Turbo')).toBeInTheDocument()
    })
  })

  describe('Snapshot Consistency', () => {
    it('should render consistently on mount', () => {
      const { container: container1 } = renderWithTheme(<RateLimitComponent />)
      const { container: container2 } = render(
        <ThemeProvider theme={testTheme}>
          <RateLimitComponent />
        </ThemeProvider>,
      )

      expect(container1.innerHTML).toBe(container2.innerHTML)
    })
  })

  describe('Heading Clarity', () => {
    it('should have "Timeout, Turbo" as the main message', () => {
      renderWithTheme(<RateLimitComponent />)

      const heading = screen.getByRole('heading', { level: 1, name: 'Timeout, Turbo' })
      expect(heading).toBeInTheDocument()
    })

    it('should only have one h1 heading', () => {
      const { container } = renderWithTheme(<RateLimitComponent />)

      const h1Elements = container.querySelectorAll('h1')
      expect(h1Elements.length).toBe(1)
    })
  })

  describe('Visual Hierarchy', () => {
    it('should have animation at the top', () => {
      renderWithTheme(<RateLimitComponent />)

      // Animation should be present
      expect(screen.getByTestId('stopwatch-lottie')).toBeInTheDocument()
    })

    it('should have heading after animation', () => {
      renderWithTheme(<RateLimitComponent />)

      // Both animation and heading should be present
      expect(screen.getByTestId('stopwatch-lottie')).toBeInTheDocument()
      expect(screen.getByText('Timeout, Turbo')).toBeInTheDocument()
    })

    it('should have descriptive message after heading', () => {
      renderWithTheme(<RateLimitComponent />)

      // All elements should be present in order
      expect(screen.getByTestId('stopwatch-lottie')).toBeInTheDocument()
      expect(screen.getByText('Timeout, Turbo')).toBeInTheDocument()
      expect(
        screen.getByText(
          'You have made too many requests. Please wait several minutes before trying again.',
        ),
      ).toBeInTheDocument()
    })
  })
})
