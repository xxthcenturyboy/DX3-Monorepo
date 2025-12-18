import { createTheme, ThemeProvider } from '@mui/material/styles'
import { render, screen } from '@testing-library/react'
import type React from 'react'

import { DialogWrapper } from './ui-wrapper.dialog'

// Create a test theme
const testTheme = createTheme()

// Helper function to render with theme provider
const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={testTheme}>{ui}</ThemeProvider>)
}

describe('DialogWrapper', () => {
  describe('Basic Rendering', () => {
    it('should render successfully', () => {
      const { container } = renderWithTheme(<DialogWrapper />)

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should render with children', () => {
      renderWithTheme(
        <DialogWrapper>
          <div>Test Content</div>
        </DialogWrapper>,
      )

      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('should render with multiple children', () => {
      renderWithTheme(
        <DialogWrapper>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </DialogWrapper>,
      )

      expect(screen.getByText('Child 1')).toBeInTheDocument()
      expect(screen.getByText('Child 2')).toBeInTheDocument()
      expect(screen.getByText('Child 3')).toBeInTheDocument()
    })

    it('should render without children', () => {
      const { container } = renderWithTheme(<DialogWrapper />)

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should render as a Box component', () => {
      const { container } = renderWithTheme(<DialogWrapper />)

      const box = container.querySelector('.MuiBox-root')
      expect(box).toBeInTheDocument()
    })
  })

  describe('MaxWidth Prop', () => {
    it('should apply maxWidth when provided', () => {
      const { container } = renderWithTheme(<DialogWrapper maxWidth={500} />)

      const box = container.firstChild as HTMLElement
      expect(box).toHaveStyle({ maxWidth: '500px' })
    })

    it('should not set maxWidth when not provided', () => {
      const { container } = renderWithTheme(<DialogWrapper />)

      const box = container.firstChild as HTMLElement
      expect(box).toHaveStyle({ maxWidth: '' })
    })

    it('should apply small maxWidth', () => {
      const { container } = renderWithTheme(<DialogWrapper maxWidth={200} />)

      const box = container.firstChild as HTMLElement
      expect(box).toHaveStyle({ maxWidth: '200px' })
    })

    it('should apply large maxWidth', () => {
      const { container } = renderWithTheme(<DialogWrapper maxWidth={1000} />)

      const box = container.firstChild as HTMLElement
      expect(box).toHaveStyle({ maxWidth: '1000px' })
    })

    it('should handle maxWidth of 0', () => {
      const { container } = renderWithTheme(<DialogWrapper maxWidth={0} />)

      const box = container.firstChild as HTMLElement
      // 0 is falsy, so it should be empty string
      expect(box).toHaveStyle({ maxWidth: '' })
    })

    it('should handle very large maxWidth', () => {
      const { container } = renderWithTheme(<DialogWrapper maxWidth={5000} />)

      const box = container.firstChild as HTMLElement
      expect(box).toHaveStyle({ maxWidth: '5000px' })
    })

    it('should update maxWidth dynamically', () => {
      const { container, rerender } = renderWithTheme(<DialogWrapper maxWidth={300} />)

      let box = container.firstChild as HTMLElement
      expect(box).toHaveStyle({ maxWidth: '300px' })

      rerender(
        <ThemeProvider theme={testTheme}>
          <DialogWrapper maxWidth={600} />
        </ThemeProvider>,
      )

      box = container.firstChild as HTMLElement
      expect(box).toHaveStyle({ maxWidth: '600px' })
    })
  })

  describe('Box Properties', () => {
    it('should apply flex display', () => {
      const { container } = renderWithTheme(<DialogWrapper />)

      const box = container.firstChild as HTMLElement
      expect(box).toHaveStyle({ display: 'flex' })
    })

    it('should apply column flex direction', () => {
      const { container } = renderWithTheme(<DialogWrapper />)

      const box = container.firstChild as HTMLElement
      expect(box).toHaveStyle({ flexDirection: 'column' })
    })

    it('should apply flex-start justification', () => {
      const { container } = renderWithTheme(<DialogWrapper />)

      const box = container.firstChild as HTMLElement
      expect(box).toHaveStyle({ justifyContent: 'flex-start' })
    })

    it('should apply center alignment', () => {
      const { container } = renderWithTheme(<DialogWrapper />)

      const box = container.firstChild as HTMLElement
      expect(box).toHaveStyle({ alignItems: 'center' })
    })

    it('should maintain all properties with maxWidth', () => {
      const { container } = renderWithTheme(<DialogWrapper maxWidth={400} />)

      const box = container.firstChild as HTMLElement
      expect(box).toHaveStyle({
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        maxWidth: '400px',
      })
    })
  })

  describe('Children Rendering', () => {
    it('should render text children', () => {
      renderWithTheme(<DialogWrapper>Plain text content</DialogWrapper>)

      expect(screen.getByText('Plain text content')).toBeInTheDocument()
    })

    it('should render React element children', () => {
      renderWithTheme(
        <DialogWrapper>
          <button type="button">Click me</button>
        </DialogWrapper>,
      )

      expect(screen.getByText('Click me')).toBeInTheDocument()
    })

    it('should render complex nested children', () => {
      renderWithTheme(
        <DialogWrapper>
          <div>
            <header>Header</header>
            <main>Content</main>
            <footer>Footer</footer>
          </div>
        </DialogWrapper>,
      )

      expect(screen.getByText('Header')).toBeInTheDocument()
      expect(screen.getByText('Content')).toBeInTheDocument()
      expect(screen.getByText('Footer')).toBeInTheDocument()
    })

    it('should render conditional children', () => {
      const showContent = true
      renderWithTheme(
        <DialogWrapper>
          {showContent && <div>Conditional Content</div>}
          {!showContent && <div>Hidden Content</div>}
        </DialogWrapper>,
      )

      expect(screen.getByText('Conditional Content')).toBeInTheDocument()
      expect(screen.queryByText('Hidden Content')).not.toBeInTheDocument()
    })

    it('should render null children gracefully', () => {
      const { container } = renderWithTheme(<DialogWrapper>{null}</DialogWrapper>)

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should render undefined children gracefully', () => {
      const { container } = renderWithTheme(<DialogWrapper>{undefined}</DialogWrapper>)

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should render empty fragment children', () => {
      const { container } = renderWithTheme(<DialogWrapper></DialogWrapper>)

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should update children dynamically', () => {
      const { rerender } = renderWithTheme(
        <DialogWrapper>
          <div>Initial Content</div>
        </DialogWrapper>,
      )

      expect(screen.getByText('Initial Content')).toBeInTheDocument()

      rerender(
        <ThemeProvider theme={testTheme}>
          <DialogWrapper>
            <div>Updated Content</div>
          </DialogWrapper>
        </ThemeProvider>,
      )

      expect(screen.getByText('Updated Content')).toBeInTheDocument()
      expect(screen.queryByText('Initial Content')).not.toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle negative maxWidth', () => {
      const { container } = renderWithTheme(<DialogWrapper maxWidth={-100} />)

      const box = container.firstChild as HTMLElement
      expect(box).toHaveStyle({ maxWidth: '-100px' })
    })

    it('should handle undefined maxWidth', () => {
      const { container } = renderWithTheme(<DialogWrapper maxWidth={undefined} />)

      const box = container.firstChild as HTMLElement
      expect(box).toHaveStyle({ maxWidth: '' })
    })

    it('should handle children with special characters', () => {
      const specialText = 'Special: <>&"\''
      renderWithTheme(
        <DialogWrapper>
          <div>{specialText}</div>
        </DialogWrapper>,
      )

      expect(screen.getByText(specialText)).toBeInTheDocument()
    })

    it('should handle very long content', () => {
      const longContent = 'A'.repeat(1000)
      renderWithTheme(
        <DialogWrapper>
          <div>{longContent}</div>
        </DialogWrapper>,
      )

      expect(screen.getByText(longContent)).toBeInTheDocument()
    })

    it('should handle many children', () => {
      renderWithTheme(
        <DialogWrapper>
          {Array.from({ length: 50 }, (_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: it's just a test
            <div key={i}>Item {i}</div>
          ))}
        </DialogWrapper>,
      )

      expect(screen.getByText('Item 0')).toBeInTheDocument()
      expect(screen.getByText('Item 25')).toBeInTheDocument()
      expect(screen.getByText('Item 49')).toBeInTheDocument()
    })
  })

  describe('Integration Scenarios', () => {
    it('should work with typical dialog content', () => {
      renderWithTheme(
        <DialogWrapper maxWidth={600}>
          <h1>Dialog Title</h1>
          <p>Dialog message</p>
          <button type="button">OK</button>
        </DialogWrapper>,
      )

      expect(screen.getByText('Dialog Title')).toBeInTheDocument()
      expect(screen.getByText('Dialog message')).toBeInTheDocument()
      expect(screen.getByText('OK')).toBeInTheDocument()
    })

    it('should work with form content', () => {
      renderWithTheme(
        <DialogWrapper maxWidth={500}>
          <form>
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
            />
            <button type="submit">Submit</button>
          </form>
        </DialogWrapper>,
      )

      expect(screen.getByLabelText('Name')).toBeInTheDocument()
      expect(screen.getByText('Submit')).toBeInTheDocument()
    })

    it('should work with image content', () => {
      renderWithTheme(
        <DialogWrapper maxWidth={400}>
          <img
            alt="Test"
            src="test.jpg"
          />
          <p>Image caption</p>
        </DialogWrapper>,
      )

      expect(screen.getByAltText('Test')).toBeInTheDocument()
      expect(screen.getByText('Image caption')).toBeInTheDocument()
    })

    it('should work with list content', () => {
      renderWithTheme(
        <DialogWrapper maxWidth={500}>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
            <li>Item 3</li>
          </ul>
        </DialogWrapper>,
      )

      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
      expect(screen.getByText('Item 3')).toBeInTheDocument()
    })
  })

  describe('Composition', () => {
    it('should allow nested DialogWrappers', () => {
      renderWithTheme(
        <DialogWrapper maxWidth={800}>
          <DialogWrapper maxWidth={400}>
            <div>Nested Content</div>
          </DialogWrapper>
        </DialogWrapper>,
      )

      expect(screen.getByText('Nested Content')).toBeInTheDocument()
    })

    it('should work with other MUI components', () => {
      renderWithTheme(
        <DialogWrapper maxWidth={600}>
          <div>Content with MUI components</div>
        </DialogWrapper>,
      )

      expect(screen.getByText('Content with MUI components')).toBeInTheDocument()
    })
  })

  describe('Use Cases', () => {
    it('should work as a confirmation dialog wrapper', () => {
      renderWithTheme(
        <DialogWrapper maxWidth={400}>
          <h2>Confirm Action</h2>
          <p>Are you sure?</p>
          <div>
            <button type="button">Cancel</button>
            <button type="button">Confirm</button>
          </div>
        </DialogWrapper>,
      )

      expect(screen.getByText('Confirm Action')).toBeInTheDocument()
      expect(screen.getByText('Are you sure?')).toBeInTheDocument()
    })

    it('should work as an alert dialog wrapper', () => {
      renderWithTheme(
        <DialogWrapper maxWidth={350}>
          <h2>Alert</h2>
          <p>Important message</p>
          <button type="button">OK</button>
        </DialogWrapper>,
      )

      expect(screen.getByText('Alert')).toBeInTheDocument()
      expect(screen.getByText('Important message')).toBeInTheDocument()
    })

    it('should work as a loading dialog wrapper', () => {
      renderWithTheme(
        <DialogWrapper maxWidth={300}>
          <div>Loading...</div>
          <div>Please wait</div>
        </DialogWrapper>,
      )

      expect(screen.getByText('Loading...')).toBeInTheDocument()
      expect(screen.getByText('Please wait')).toBeInTheDocument()
    })

    it('should work without maxWidth constraint', () => {
      renderWithTheme(
        <DialogWrapper>
          <div>Unrestricted width content</div>
        </DialogWrapper>,
      )

      expect(screen.getByText('Unrestricted width content')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should render accessible content', () => {
      renderWithTheme(
        <DialogWrapper>
          <div role="alert">Accessible alert</div>
        </DialogWrapper>,
      )

      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('should support ARIA attributes in children', () => {
      renderWithTheme(
        <DialogWrapper>
          <section aria-label="Dialog content">Content</section>
        </DialogWrapper>,
      )

      expect(screen.getByLabelText('Dialog content')).toBeInTheDocument()
    })

    it('should maintain semantic structure', () => {
      renderWithTheme(
        <DialogWrapper>
          <header>Header</header>
          <main>Main</main>
          <footer>Footer</footer>
        </DialogWrapper>,
      )

      expect(screen.getByText('Header')).toBeInTheDocument()
      expect(screen.getByText('Main')).toBeInTheDocument()
      expect(screen.getByText('Footer')).toBeInTheDocument()
    })
  })

  describe('Props Combination', () => {
    it('should work with both props provided', () => {
      renderWithTheme(
        <DialogWrapper maxWidth={500}>
          <div>Complete content</div>
        </DialogWrapper>,
      )

      expect(screen.getByText('Complete content')).toBeInTheDocument()

      const { container } = renderWithTheme(
        <DialogWrapper maxWidth={500}>
          <div>Complete content</div>
        </DialogWrapper>,
      )

      const box = container.firstChild as HTMLElement
      expect(box).toHaveStyle({ maxWidth: '500px' })
    })

    it('should work with only children', () => {
      renderWithTheme(
        <DialogWrapper>
          <div>Just children</div>
        </DialogWrapper>,
      )

      expect(screen.getByText('Just children')).toBeInTheDocument()
    })

    it('should work with only maxWidth', () => {
      const { container } = renderWithTheme(<DialogWrapper maxWidth={400} />)

      const box = container.firstChild as HTMLElement
      expect(box).toHaveStyle({ maxWidth: '400px' })
    })

    it('should work with no props', () => {
      const { container } = renderWithTheme(<DialogWrapper />)

      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('State Management', () => {
    it('should handle dynamic content changes', () => {
      const { rerender } = renderWithTheme(
        <DialogWrapper maxWidth={400}>
          <div>State 1</div>
        </DialogWrapper>,
      )

      expect(screen.getByText('State 1')).toBeInTheDocument()

      rerender(
        <ThemeProvider theme={testTheme}>
          <DialogWrapper maxWidth={500}>
            <div>State 2</div>
          </DialogWrapper>
        </ThemeProvider>,
      )

      expect(screen.getByText('State 2')).toBeInTheDocument()
      expect(screen.queryByText('State 1')).not.toBeInTheDocument()
    })

    it('should handle removing maxWidth', () => {
      const { container, rerender } = renderWithTheme(
        <DialogWrapper maxWidth={400}>
          <div>Content</div>
        </DialogWrapper>,
      )

      let box = container.firstChild as HTMLElement
      expect(box).toHaveStyle({ maxWidth: '400px' })

      rerender(
        <ThemeProvider theme={testTheme}>
          <DialogWrapper>
            <div>Content</div>
          </DialogWrapper>
        </ThemeProvider>,
      )

      box = container.firstChild as HTMLElement
      expect(box).toHaveStyle({ maxWidth: '' })
    })

    it('should handle adding maxWidth', () => {
      const { container, rerender } = renderWithTheme(
        <DialogWrapper>
          <div>Content</div>
        </DialogWrapper>,
      )

      let box = container.firstChild as HTMLElement
      expect(box).toHaveStyle({ maxWidth: '' })

      rerender(
        <ThemeProvider theme={testTheme}>
          <DialogWrapper maxWidth={400}>
            <div>Content</div>
          </DialogWrapper>
        </ThemeProvider>,
      )

      box = container.firstChild as HTMLElement
      expect(box).toHaveStyle({ maxWidth: '400px' })
    })
  })
})
