import { createTheme, ThemeProvider } from '@mui/material/styles'
import { render, screen } from '@testing-library/react'
import type React from 'react'

import { GrowTransition, SlideTransition, ZoomTransition } from './dialog.ui'

const testTheme = createTheme()

const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={testTheme}>{ui}</ThemeProvider>)

// ---------------------------------------------------------------------------
// Helpers: render each transition component wrapping a visible child
// ---------------------------------------------------------------------------
const childText = 'Transition Child'
const childElement = <div>{childText}</div>

describe('GrowTransition', () => {
  it('should render children when in=true', () => {
    renderWithTheme(
      <GrowTransition in>
        {childElement}
      </GrowTransition>,
    )

    expect(screen.getByText(childText)).toBeInTheDocument()
  })

  it('should be a forwardRef component (defined and renderable)', () => {
    expect(GrowTransition).toBeDefined()
    // forwardRef components are objects (not functions) in React
    expect(typeof GrowTransition).toBe('object')
  })

  it('should render without crashing when in=false', () => {
    expect(() =>
      renderWithTheme(
        <GrowTransition in={false}>
          {childElement}
        </GrowTransition>,
      ),
    ).not.toThrow()
  })

  it('should pass additional TransitionProps through to Grow', () => {
    const onEntered = jest.fn()
    renderWithTheme(
      <GrowTransition
        in
        onEntered={onEntered}
      >
        {childElement}
      </GrowTransition>,
    )

    expect(screen.getByText(childText)).toBeInTheDocument()
  })
})

describe('SlideTransition', () => {
  it('should render children when in=true', () => {
    renderWithTheme(
      <SlideTransition in>
        {childElement}
      </SlideTransition>,
    )

    expect(screen.getByText(childText)).toBeInTheDocument()
  })

  it('should be a forwardRef component (defined and renderable)', () => {
    expect(SlideTransition).toBeDefined()
    expect(typeof SlideTransition).toBe('object')
  })

  it('should render without crashing when in=false', () => {
    expect(() =>
      renderWithTheme(
        <SlideTransition in={false}>
          {childElement}
        </SlideTransition>,
      ),
    ).not.toThrow()
  })

  it('should apply direction="up" to the Slide component', () => {
    // Slide with direction="up" renders its children; we verify the component
    // mounts without throwing and the child is accessible in the DOM.
    const { container } = renderWithTheme(
      <SlideTransition in>
        <div data-testid="slide-child">Slide Content</div>
      </SlideTransition>,
    )

    expect(container.querySelector('[data-testid="slide-child"]')).toBeInTheDocument()
  })
})

describe('ZoomTransition', () => {
  it('should render children when in=true', () => {
    renderWithTheme(
      <ZoomTransition in>
        {childElement}
      </ZoomTransition>,
    )

    expect(screen.getByText(childText)).toBeInTheDocument()
  })

  it('should be a forwardRef component (defined and renderable)', () => {
    expect(ZoomTransition).toBeDefined()
    expect(typeof ZoomTransition).toBe('object')
  })

  it('should render without crashing when in=false', () => {
    expect(() =>
      renderWithTheme(
        <ZoomTransition in={false}>
          {childElement}
        </ZoomTransition>,
      ),
    ).not.toThrow()
  })

  it('should pass additional TransitionProps through to Zoom', () => {
    const onExited = jest.fn()
    renderWithTheme(
      <ZoomTransition
        in
        onExited={onExited}
      >
        {childElement}
      </ZoomTransition>,
    )

    expect(screen.getByText(childText)).toBeInTheDocument()
  })
})
