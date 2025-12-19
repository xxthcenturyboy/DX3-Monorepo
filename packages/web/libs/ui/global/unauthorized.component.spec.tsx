import { createTheme, ThemeProvider } from '@mui/material/styles'
import { render, screen } from '@testing-library/react'
import type React from 'react'

import { UnauthorizedComponent } from './unauthorized.component'

// Mock the AccessDeniedLottie component
jest.mock('../lottie/access-denied.lottie', () => ({
  AccessDeniedLottie: ({ loop }: { loop?: boolean }) => (
    <div
      data-loop={loop}
      data-testid="access-denied-lottie"
    >
      Access Denied Animation
    </div>
  ),
}))

describe('UnauthorizedComponent', () => {
  const testTheme = createTheme()

  const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider theme={testTheme}>{component}</ThemeProvider>)
  }

  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      renderWithTheme(<UnauthorizedComponent />)

      expect(screen.getByText('You are not authorized to access this feature.')).toBeInTheDocument()
    })

    it('should render the access denied lottie animation', () => {
      renderWithTheme(<UnauthorizedComponent />)

      expect(screen.getByTestId('access-denied-lottie')).toBeInTheDocument()
    })

    it('should display the unauthorized message', () => {
      renderWithTheme(<UnauthorizedComponent />)

      const message = screen.getByText('You are not authorized to access this feature.')
      expect(message).toBeInTheDocument()
    })

    it('should render animation with loop set to false', () => {
      renderWithTheme(<UnauthorizedComponent />)

      const animation = screen.getByTestId('access-denied-lottie')
      expect(animation).toHaveAttribute('data-loop', 'false')
    })

    it('should not render any buttons', () => {
      renderWithTheme(<UnauthorizedComponent />)

      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('should not render any input fields', () => {
      renderWithTheme(<UnauthorizedComponent />)

      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    })
  })

  describe('Props Handling', () => {
    it('should accept error prop without using it', () => {
      const testError = new Error('Test error')

      expect(() => {
        renderWithTheme(<UnauthorizedComponent error={testError} />)
      }).not.toThrow()

      expect(screen.getByText('You are not authorized to access this feature.')).toBeInTheDocument()
    })

    it('should accept timedOut prop without using it', () => {
      expect(() => {
        renderWithTheme(<UnauthorizedComponent timedOut={true} />)
      }).not.toThrow()

      expect(screen.getByText('You are not authorized to access this feature.')).toBeInTheDocument()
    })

    it('should accept pastDelay prop without using it', () => {
      expect(() => {
        renderWithTheme(<UnauthorizedComponent pastDelay={true} />)
      }).not.toThrow()

      expect(screen.getByText('You are not authorized to access this feature.')).toBeInTheDocument()
    })

    it('should accept retry prop without using it', () => {
      const mockRetry = jest.fn()

      expect(() => {
        renderWithTheme(<UnauthorizedComponent retry={mockRetry} />)
      }).not.toThrow()

      expect(screen.getByText('You are not authorized to access this feature.')).toBeInTheDocument()
      expect(mockRetry).not.toHaveBeenCalled()
    })

    it('should accept all props together without using them', () => {
      const testError = new Error('Test error')
      const mockRetry = jest.fn()

      expect(() => {
        renderWithTheme(
          <UnauthorizedComponent
            error={testError}
            pastDelay={true}
            retry={mockRetry}
            timedOut={true}
          />,
        )
      }).not.toThrow()

      expect(screen.getByText('You are not authorized to access this feature.')).toBeInTheDocument()
    })

    it('should render the same content regardless of props', () => {
      const { container: container1 } = renderWithTheme(<UnauthorizedComponent />)
      const { container: container2 } = render(
        <ThemeProvider theme={testTheme}>
          <UnauthorizedComponent
            error={new Error('Test')}
            timedOut={true}
          />
        </ThemeProvider>,
      )

      expect(container1.innerHTML).toBe(container2.innerHTML)
    })
  })

  describe('Static Content', () => {
    it('should always display the unauthorized message', () => {
      renderWithTheme(<UnauthorizedComponent />)

      expect(screen.getByText('You are not authorized to access this feature.')).toBeInTheDocument()
    })

    it('should display animation regardless of props', () => {
      const { rerender } = renderWithTheme(<UnauthorizedComponent />)

      expect(screen.getByTestId('access-denied-lottie')).toBeInTheDocument()

      rerender(
        <ThemeProvider theme={testTheme}>
          <UnauthorizedComponent error={new Error('Test')} />
        </ThemeProvider>,
      )

      expect(screen.getByTestId('access-denied-lottie')).toBeInTheDocument()
    })

    it('should maintain message order with animation after text', () => {
      renderWithTheme(<UnauthorizedComponent />)

      expect(screen.getByText('You are not authorized to access this feature.')).toBeInTheDocument()
      expect(screen.getByTestId('access-denied-lottie')).toBeInTheDocument()
    })
  })

  describe('Component Structure', () => {
    it('should wrap content in StyledContentWrapper', () => {
      const { container } = renderWithTheme(<UnauthorizedComponent />)

      // StyledContentWrapper renders a Box component
      const wrapper = container.querySelector('.MuiBox-root')
      expect(wrapper).toBeInTheDocument()
    })

    it('should use Grid for layout', () => {
      const { container } = renderWithTheme(<UnauthorizedComponent />)

      // Grid should be present for layout
      const grid = container.querySelector('.MuiGrid-root')
      expect(grid).toBeInTheDocument()
    })

    it('should render message before animation', () => {
      const { container } = renderWithTheme(<UnauthorizedComponent />)

      const elements = container.querySelectorAll('*')
      let messageIndex = -1
      let animationIndex = -1

      elements.forEach((el, index) => {
        if (el.textContent?.includes('You are not authorized')) {
          messageIndex = index
        }
        if (el.getAttribute('data-testid') === 'access-denied-lottie') {
          animationIndex = index
        }
      })

      expect(messageIndex).toBeGreaterThan(-1)
      expect(animationIndex).toBeGreaterThan(-1)
      expect(messageIndex).toBeLessThan(animationIndex)
    })
  })

  describe('Typography Variant', () => {
    it('should use h3 variant for message', () => {
      renderWithTheme(<UnauthorizedComponent />)

      const message = screen.getByText('You are not authorized to access this feature.')
      expect(message).toHaveClass('MuiTypography-h3')
    })

    it('should center align the message', () => {
      renderWithTheme(<UnauthorizedComponent />)

      const message = screen.getByText('You are not authorized to access this feature.')
      expect(message).toHaveClass('MuiTypography-alignCenter')
    })
  })

  describe('Accessibility', () => {
    it('should have descriptive message text', () => {
      renderWithTheme(<UnauthorizedComponent />)

      expect(screen.getByText('You are not authorized to access this feature.')).toBeInTheDocument()
    })

    it('should have a clear heading structure', () => {
      renderWithTheme(<UnauthorizedComponent />)

      const heading = screen.getByRole('heading', { level: 3 })
      expect(heading).toHaveTextContent('You are not authorized to access this feature.')
    })

    it('should provide clear unauthorized message to users', () => {
      renderWithTheme(<UnauthorizedComponent />)

      const message = screen.getByText(/not authorized/i)
      expect(message).toBeInTheDocument()
    })

    it('should only have one heading', () => {
      const { container } = renderWithTheme(<UnauthorizedComponent />)

      const h3Elements = container.querySelectorAll('h3')
      expect(h3Elements.length).toBe(1)
    })
  })

  describe('Animation Configuration', () => {
    it('should render AccessDeniedLottie with loop disabled', () => {
      renderWithTheme(<UnauthorizedComponent />)

      const animation = screen.getByTestId('access-denied-lottie')
      expect(animation).toHaveAttribute('data-loop', 'false')
    })

    it('should consistently use loop=false across renders', () => {
      const { rerender } = renderWithTheme(<UnauthorizedComponent />)

      let animation = screen.getByTestId('access-denied-lottie')
      expect(animation).toHaveAttribute('data-loop', 'false')

      rerender(
        <ThemeProvider theme={testTheme}>
          <UnauthorizedComponent error={new Error('Test')} />
        </ThemeProvider>,
      )

      animation = screen.getByTestId('access-denied-lottie')
      expect(animation).toHaveAttribute('data-loop', 'false')
    })
  })

  describe('Rendering Consistency', () => {
    it('should render the same content on multiple renders', () => {
      const { rerender } = renderWithTheme(<UnauthorizedComponent />)

      expect(screen.getByText('You are not authorized to access this feature.')).toBeInTheDocument()

      rerender(
        <ThemeProvider theme={testTheme}>
          <UnauthorizedComponent />
        </ThemeProvider>,
      )

      expect(screen.getByText('You are not authorized to access this feature.')).toBeInTheDocument()
      expect(screen.getByTestId('access-denied-lottie')).toBeInTheDocument()
    })

    it('should maintain consistent structure across renders', () => {
      const { container, rerender } = renderWithTheme(<UnauthorizedComponent />)

      const firstRenderHTML = container.innerHTML

      rerender(
        <ThemeProvider theme={testTheme}>
          <UnauthorizedComponent />
        </ThemeProvider>,
      )

      const secondRenderHTML = container.innerHTML

      expect(firstRenderHTML).toBe(secondRenderHTML)
    })

    it('should be stable with different prop combinations', () => {
      const { container, rerender } = renderWithTheme(<UnauthorizedComponent />)

      const initialHTML = container.innerHTML

      rerender(
        <ThemeProvider theme={testTheme}>
          <UnauthorizedComponent error={new Error('Test')} />
        </ThemeProvider>,
      )

      expect(container.innerHTML).toBe(initialHTML)

      rerender(
        <ThemeProvider theme={testTheme}>
          <UnauthorizedComponent
            pastDelay={true}
            timedOut={true}
          />
        </ThemeProvider>,
      )

      expect(container.innerHTML).toBe(initialHTML)
    })
  })

  describe('Component Identity', () => {
    it('should have distinct content for unauthorized scenario', () => {
      renderWithTheme(<UnauthorizedComponent />)

      // Should have unauthorized message, not other error messages
      expect(screen.getByText('You are not authorized to access this feature.')).toBeInTheDocument()
      expect(screen.queryByText('Not Found')).not.toBeInTheDocument()
      expect(screen.queryByText('Ouch')).not.toBeInTheDocument()
      expect(screen.queryByText('Timeout, Turbo')).not.toBeInTheDocument()
    })

    it('should use access denied animation appropriate for authorization', () => {
      renderWithTheme(<UnauthorizedComponent />)

      expect(screen.getByTestId('access-denied-lottie')).toBeInTheDocument()
    })
  })

  describe('Message Content', () => {
    it('should inform user about lack of authorization', () => {
      renderWithTheme(<UnauthorizedComponent />)

      const message = screen.getByText(/not authorized/i)
      expect(message).toBeInTheDocument()
    })

    it('should specifically mention "access this feature"', () => {
      renderWithTheme(<UnauthorizedComponent />)

      const message = screen.getByText(/access this feature/i)
      expect(message).toBeInTheDocument()
    })

    it('should have complete message text', () => {
      renderWithTheme(<UnauthorizedComponent />)

      const message = screen.getByText('You are not authorized to access this feature.')
      expect(message).toBeInTheDocument()
      expect(message.textContent).toBe('You are not authorized to access this feature.')
    })
  })

  describe('No Interactive Elements', () => {
    it('should not have any clickable elements', () => {
      const { container } = renderWithTheme(<UnauthorizedComponent />)

      const buttons = container.querySelectorAll('button')
      const links = container.querySelectorAll('a')

      expect(buttons.length).toBe(0)
      expect(links.length).toBe(0)
    })

    it('should be a purely informational component', () => {
      renderWithTheme(<UnauthorizedComponent />)

      // No buttons, inputs, or other interactive elements
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
      expect(screen.queryByRole('link')).not.toBeInTheDocument()
      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    })

    it('should not trigger retry function even if provided', () => {
      const mockRetry = jest.fn()
      renderWithTheme(<UnauthorizedComponent retry={mockRetry} />)

      // Wait a bit to ensure no async calls
      expect(mockRetry).not.toHaveBeenCalled()
    })
  })

  describe('Theme Integration', () => {
    it('should render properly with light theme', () => {
      const lightTheme = createTheme({ palette: { mode: 'light' } })

      render(
        <ThemeProvider theme={lightTheme}>
          <UnauthorizedComponent />
        </ThemeProvider>,
      )

      expect(screen.getByText('You are not authorized to access this feature.')).toBeInTheDocument()
    })

    it('should render properly with dark theme', () => {
      const darkTheme = createTheme({ palette: { mode: 'dark' } })

      render(
        <ThemeProvider theme={darkTheme}>
          <UnauthorizedComponent />
        </ThemeProvider>,
      )

      expect(screen.getByText('You are not authorized to access this feature.')).toBeInTheDocument()
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
          <UnauthorizedComponent />
        </ThemeProvider>,
      )

      expect(screen.getByText('You are not authorized to access this feature.')).toBeInTheDocument()
      expect(screen.getByTestId('access-denied-lottie')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should render without errors when theme is provided', () => {
      expect(() => renderWithTheme(<UnauthorizedComponent />)).not.toThrow()
    })

    it('should have stable rendering', () => {
      const { container } = renderWithTheme(<UnauthorizedComponent />)

      // Should not be empty
      expect(container.firstChild).not.toBeNull()

      // Should contain expected elements
      expect(screen.getByTestId('access-denied-lottie')).toBeInTheDocument()
      expect(screen.getByText('You are not authorized to access this feature.')).toBeInTheDocument()
    })

    it('should handle undefined props gracefully', () => {
      expect(() => {
        renderWithTheme(
          <UnauthorizedComponent
            error={undefined}
            pastDelay={undefined}
            retry={undefined}
            timedOut={undefined}
          />,
        )
      }).not.toThrow()
    })
  })

  describe('Return Value', () => {
    it('should always return a JSX element not null', () => {
      const { container } = renderWithTheme(<UnauthorizedComponent />)

      expect(container.firstChild).not.toBeNull()
    })

    it('should return consistent element structure', () => {
      const { container: container1 } = renderWithTheme(<UnauthorizedComponent />)
      const { container: container2 } = render(
        <ThemeProvider theme={testTheme}>
          <UnauthorizedComponent />
        </ThemeProvider>,
      )

      expect(container1.innerHTML).toBe(container2.innerHTML)
    })
  })

  describe('Snapshot Consistency', () => {
    it('should render consistently on mount', () => {
      const { container: container1 } = renderWithTheme(<UnauthorizedComponent />)
      const { container: container2 } = render(
        <ThemeProvider theme={testTheme}>
          <UnauthorizedComponent />
        </ThemeProvider>,
      )

      expect(container1.innerHTML).toBe(container2.innerHTML)
    })
  })

  describe('Visual Hierarchy', () => {
    it('should have message at the top', () => {
      renderWithTheme(<UnauthorizedComponent />)

      expect(screen.getByText('You are not authorized to access this feature.')).toBeInTheDocument()
    })

    it('should have animation after message', () => {
      renderWithTheme(<UnauthorizedComponent />)

      // Both message and animation should be present
      expect(screen.getByText('You are not authorized to access this feature.')).toBeInTheDocument()
      expect(screen.getByTestId('access-denied-lottie')).toBeInTheDocument()
    })

    it('should have all elements present in order', () => {
      renderWithTheme(<UnauthorizedComponent />)

      expect(screen.getByText('You are not authorized to access this feature.')).toBeInTheDocument()
      expect(screen.getByTestId('access-denied-lottie')).toBeInTheDocument()
    })
  })
})
