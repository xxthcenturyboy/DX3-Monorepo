import '@testing-library/jest-dom'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { act, render, screen, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { Provider } from 'react-redux'

import { setupStore } from '../store/testing/testing.store'
import { Dashboard } from './dashboard-web.component'

// Mock the production store module
jest.mock('../store')

// Mock RTK Query to prevent middleware from keeping event loop alive
jest.mock('../data/rtk-query')

// Mock useMediaQuery to avoid breakpoint detection issues
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useMediaQuery: jest.fn(() => false),
}))

// Create test theme wrapper with minimal store
const testTheme = createTheme()
const testStore = setupStore({})

const TestWrapper = ({ children }: PropsWithChildren) => (
  <Provider store={testStore}>
    <ThemeProvider theme={testTheme}>{children}</ThemeProvider>
  </Provider>
)

describe('Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('should render successfully', async () => {
    let baseElement: HTMLElement | undefined

    await act(async () => {
      const result = render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>,
      )
      baseElement = result.baseElement
      jest.runAllTimers()
    })

    expect(baseElement).toBeTruthy()
  })

  it('should render the welcome message', async () => {
    await act(async () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>,
      )
      jest.runAllTimers()
    })

    expect(screen.getByText('Have a look around.')).toBeInTheDocument()
  })

  it('should render the Dashboard header', async () => {
    await act(async () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>,
      )
      jest.runAllTimers()
    })

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('should render Lottie animation via centralized mock', async () => {
    await act(async () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>,
      )
      jest.runAllTimers()
    })

    // The lottie-react mock (from packages/web/__mocks__/lottie-react.tsx)
    // renders with data-testid="lottie" after LottieWrapper loads the animation
    await waitFor(() => {
      expect(screen.getByTestId('lottie')).toBeInTheDocument()
    })
  })

  it('should set the document title to Dashboard', async () => {
    await act(async () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>,
      )
      jest.runAllTimers()
    })

    expect(document.title).toContain('Dashboard')
  })
})
