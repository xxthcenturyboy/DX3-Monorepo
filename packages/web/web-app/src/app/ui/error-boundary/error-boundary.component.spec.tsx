import { render } from '@testing-library/react'

import { ErrorBoundary } from './error-boundary.component'

const ThrowingComponent = () => {
  throw new Error('Test error')
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress the expected console.error output from React's error boundary
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should render successfully with no children', () => {
    const { baseElement } = render(<ErrorBoundary fallback={<p>Something went wrong.</p>} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render children when no error is thrown', () => {
    const { getByText } = render(
      <ErrorBoundary fallback={<p>Error occurred</p>}>
        <span>Normal content</span>
      </ErrorBoundary>,
    )
    expect(getByText('Normal content')).toBeTruthy()
  })

  it('should render fallback when a child throws an error', () => {
    const { getByText } = render(
      <ErrorBoundary fallback={<p>Something went wrong.</p>}>
        <ThrowingComponent />
      </ErrorBoundary>,
    )
    expect(getByText('Something went wrong.')).toBeTruthy()
  })

  it('should not render children after an error is thrown', () => {
    const { queryByText } = render(
      <ErrorBoundary fallback={<p>Fallback UI</p>}>
        <ThrowingComponent />
      </ErrorBoundary>,
    )
    expect(queryByText('Normal content')).toBeNull()
  })
})
