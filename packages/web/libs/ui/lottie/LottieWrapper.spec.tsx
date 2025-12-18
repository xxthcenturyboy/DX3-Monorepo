import { render, screen, waitFor } from '@testing-library/react'

import { LottieWrapper } from './LottieWrapper'

// Mock the Lottie component
jest.mock('lottie-react', () => ({
  __esModule: true,
  default: (props: any) => (
    <div
      data-autoplay={props.autoPlay}
      data-loop={props.loop}
      data-testid="lottie"
    >
      Lottie Animation
    </div>
  ),
}))

// Mock ScaleLoader
jest.mock('react-spinners', () => ({
  ScaleLoader: (props: any) => (
    <div
      data-color={props.color}
      data-testid="scale-loader"
    >
      Loading Spinner
    </div>
  ),
}))

// Mock themeColors
jest.mock('../system/mui-overrides/styles', () => ({
  themeColors: {
    primary: '#1976d2',
    secondary: '#dc004e',
  },
}))

describe('LottieWrapper', () => {
  const mockAnimationData = { fr: 30, h: 300, ip: 0, layers: [], op: 60, v: '5.5.7', w: 300 }
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
    // Suppress console.error in all tests to avoid noise
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
    consoleErrorSpy.mockRestore()
  })

  describe('Basic Rendering', () => {
    it('should render without crashing with object animation data', () => {
      const { container } = render(<LottieWrapper animationData={mockAnimationData} />)

      expect(container.firstChild).not.toBeNull()
    })

    it('should return null when animationData is not provided', () => {
      const { container } = render(<LottieWrapper animationData={null as any} />)

      expect(container.firstChild).toBeNull()
    })

    it('should return null when animationData is undefined', () => {
      const { container } = render(<LottieWrapper animationData={undefined as any} />)

      expect(container.firstChild).toBeNull()
    })
  })

  describe('Loading State with Object Data', () => {
    it('should render Lottie when animation data is an object', async () => {
      render(<LottieWrapper animationData={mockAnimationData} />)

      await waitFor(() => {
        expect(screen.getByTestId('lottie')).toBeInTheDocument()
      })
    })

    it('should not show ScaleLoader when object data loads immediately', async () => {
      render(<LottieWrapper animationData={mockAnimationData} />)

      await waitFor(() => {
        expect(screen.getByTestId('lottie')).toBeInTheDocument()
      })

      expect(screen.queryByTestId('scale-loader')).not.toBeInTheDocument()
    })
  })

  describe('Loading State with String Path', () => {
    it('should show ScaleLoader while fetching animation data from path', async () => {
      ;(global.fetch as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  json: async () => mockAnimationData,
                }),
              100,
            ),
          ),
      )

      render(<LottieWrapper animationData="/assets/animations/test.json" />)

      // Should show loader initially
      await waitFor(() => {
        expect(screen.getByTestId('scale-loader')).toBeInTheDocument()
      })
    })

    it('should render Lottie after successfully fetching animation data', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        json: async () => mockAnimationData,
      })

      render(<LottieWrapper animationData="/assets/animations/test.json" />)

      await waitFor(() => {
        expect(screen.getByTestId('lottie')).toBeInTheDocument()
      })

      expect(screen.queryByTestId('scale-loader')).not.toBeInTheDocument()
    })

    it('should call fetch with correct animation path', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        json: async () => mockAnimationData,
      })

      const animationPath = '/assets/animations/custom.json'
      render(<LottieWrapper animationData={animationPath} />)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(animationPath)
      })
    })

    it('should show ScaleLoader with primary theme color', async () => {
      ;(global.fetch as jest.Mock).mockImplementation(
        () => new Promise(() => {}), // Never resolves to keep loading state
      )

      render(<LottieWrapper animationData="/assets/animations/test.json" />)

      await waitFor(() => {
        const loader = screen.getByTestId('scale-loader')
        expect(loader).toHaveAttribute('data-color', '#1976d2')
      })
    })
  })

  describe('Error Handling', () => {
    it('should show ScaleLoader when fetch fails', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      render(<LottieWrapper animationData="/assets/animations/test.json" />)

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Failed to load Lottie animation:',
          expect.any(Error),
        )
      })

      // Should still show loader when data fails to load
      expect(screen.getByTestId('scale-loader')).toBeInTheDocument()
    })

    it('should handle JSON parsing errors', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        json: async () => {
          throw new Error('Invalid JSON')
        },
      })

      render(<LottieWrapper animationData="/assets/animations/test.json" />)

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled()
      })

      // Should still show loader when parsing fails
      expect(screen.getByTestId('scale-loader')).toBeInTheDocument()
    })
  })

  describe('Props Handling', () => {
    it('should pass autoPlay prop to Lottie', async () => {
      render(
        <LottieWrapper
          animationData={mockAnimationData}
          autoPlay={false}
        />,
      )

      await waitFor(() => {
        const lottie = screen.getByTestId('lottie')
        expect(lottie).toHaveAttribute('data-autoplay', 'false')
      })
    })

    it('should default autoPlay to true when not provided', async () => {
      render(<LottieWrapper animationData={mockAnimationData} />)

      await waitFor(() => {
        const lottie = screen.getByTestId('lottie')
        expect(lottie).toHaveAttribute('data-autoplay', 'true')
      })
    })

    it('should pass loop prop to Lottie', async () => {
      render(
        <LottieWrapper
          animationData={mockAnimationData}
          loop={false}
        />,
      )

      await waitFor(() => {
        const lottie = screen.getByTestId('lottie')
        expect(lottie).toHaveAttribute('data-loop', 'false')
      })
    })

    it('should default loop to true when not provided', async () => {
      render(<LottieWrapper animationData={mockAnimationData} />)

      await waitFor(() => {
        const lottie = screen.getByTestId('lottie')
        expect(lottie).toHaveAttribute('data-loop', 'true')
      })
    })

    it('should accept complete callback', async () => {
      const mockComplete = jest.fn()

      render(
        <LottieWrapper
          animationData={mockAnimationData}
          complete={mockComplete}
        />,
      )

      await waitFor(() => {
        expect(screen.getByTestId('lottie')).toBeInTheDocument()
      })

      // Callback should not be called immediately
      expect(mockComplete).not.toHaveBeenCalled()
    })

    it('should handle all props together', async () => {
      const mockComplete = jest.fn()
      const customStyle = { height: '400px', width: '400px' }

      render(
        <LottieWrapper
          animationData={mockAnimationData}
          autoPlay={false}
          complete={mockComplete}
          loop={false}
          speed={2}
          style={customStyle}
        />,
      )

      await waitFor(() => {
        expect(screen.getByTestId('lottie')).toBeInTheDocument()
      })
    })
  })

  describe('Speed Configuration', () => {
    it('should handle speed prop', async () => {
      render(
        <LottieWrapper
          animationData={mockAnimationData}
          speed={2}
        />,
      )

      await waitFor(() => {
        expect(screen.getByTestId('lottie')).toBeInTheDocument()
      })
    })

    it('should handle default speed when not provided', async () => {
      render(<LottieWrapper animationData={mockAnimationData} />)

      await waitFor(() => {
        expect(screen.getByTestId('lottie')).toBeInTheDocument()
      })
    })

    it('should handle various speed values', async () => {
      const speeds = [0.5, 1, 1.5, 2, 2.5]

      for (const speed of speeds) {
        const { unmount } = render(
          <LottieWrapper
            animationData={mockAnimationData}
            speed={speed}
          />,
        )

        await waitFor(() => {
          expect(screen.getByTestId('lottie')).toBeInTheDocument()
        })

        unmount()
      }
    })
  })

  describe('Style Prop', () => {
    it('should accept style prop', async () => {
      const customStyle = { height: '500px', width: '500px' }

      render(
        <LottieWrapper
          animationData={mockAnimationData}
          style={customStyle}
        />,
      )

      await waitFor(() => {
        expect(screen.getByTestId('lottie')).toBeInTheDocument()
      })
    })

    it('should handle empty style object', async () => {
      render(
        <LottieWrapper
          animationData={mockAnimationData}
          style={{}}
        />,
      )

      await waitFor(() => {
        expect(screen.getByTestId('lottie')).toBeInTheDocument()
      })
    })

    it('should handle undefined style', async () => {
      render(<LottieWrapper animationData={mockAnimationData} />)

      await waitFor(() => {
        expect(screen.getByTestId('lottie')).toBeInTheDocument()
      })
    })
  })

  describe('Animation Data Updates', () => {
    it('should re-fetch when animation path changes', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        json: async () => mockAnimationData,
      })

      const { rerender } = render(<LottieWrapper animationData="/assets/animations/first.json" />)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/assets/animations/first.json')
      })

      rerender(<LottieWrapper animationData="/assets/animations/second.json" />)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/assets/animations/second.json')
      })

      expect(global.fetch).toHaveBeenCalledTimes(2)
    })

    it('should reload when animation data object changes', async () => {
      const firstData = { ...mockAnimationData, v: '1.0.0' }
      const secondData = { ...mockAnimationData, v: '2.0.0' }

      const { rerender } = render(<LottieWrapper animationData={firstData} />)

      await waitFor(() => {
        expect(screen.getByTestId('lottie')).toBeInTheDocument()
      })

      rerender(<LottieWrapper animationData={secondData} />)

      await waitFor(() => {
        expect(screen.getByTestId('lottie')).toBeInTheDocument()
      })
    })
  })

  describe('Loading State Display', () => {
    it('should center the ScaleLoader', async () => {
      ;(global.fetch as jest.Mock).mockImplementation(
        () => new Promise(() => {}), // Never resolves
      )

      const { container } = render(<LottieWrapper animationData="/assets/animations/test.json" />)

      await waitFor(() => {
        const wrapper = container.querySelector('div')
        expect(wrapper).toBeInTheDocument()
        expect(screen.getByTestId('scale-loader')).toBeInTheDocument()
      })
    })

    it('should show loader immediately when loading starts', async () => {
      ;(global.fetch as jest.Mock).mockImplementation(
        () => new Promise(() => {}), // Never resolves
      )

      render(<LottieWrapper animationData="/assets/animations/test.json" />)

      // Loader should be visible immediately
      await waitFor(() => {
        expect(screen.getByTestId('scale-loader')).toBeInTheDocument()
        expect(screen.queryByTestId('lottie')).not.toBeInTheDocument()
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty string as animation path', () => {
      const { container } = render(<LottieWrapper animationData="" />)

      // Empty string is falsy, so component returns null
      expect(container.firstChild).toBeNull()
      expect(screen.queryByTestId('scale-loader')).not.toBeInTheDocument()
      expect(screen.queryByTestId('lottie')).not.toBeInTheDocument()
    })

    it('should handle very large animation data objects', async () => {
      const largeData = {
        ...mockAnimationData,
        layers: Array(1000).fill({ id: 'layer' }),
      }

      render(<LottieWrapper animationData={largeData} />)

      await waitFor(() => {
        expect(screen.getByTestId('lottie')).toBeInTheDocument()
      })
    })

    it('should handle rapid prop changes', async () => {
      const { rerender } = render(
        <LottieWrapper
          animationData={mockAnimationData}
          autoPlay={true}
        />,
      )

      rerender(
        <LottieWrapper
          animationData={mockAnimationData}
          autoPlay={false}
        />,
      )
      rerender(
        <LottieWrapper
          animationData={mockAnimationData}
          loop={false}
        />,
      )
      rerender(
        <LottieWrapper
          animationData={mockAnimationData}
          speed={2}
        />,
      )

      await waitFor(() => {
        expect(screen.getByTestId('lottie')).toBeInTheDocument()
      })
    })
  })

  describe('Fetch Behavior', () => {
    it('should only fetch when animation data is a string', async () => {
      render(<LottieWrapper animationData={mockAnimationData} />)

      await waitFor(() => {
        expect(screen.getByTestId('lottie')).toBeInTheDocument()
      })

      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('should fetch when animation data is a string path', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        json: async () => mockAnimationData,
      })

      render(<LottieWrapper animationData="/assets/animations/test.json" />)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('Component Lifecycle', () => {
    it('should clean up properly on unmount', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        json: async () => mockAnimationData,
      })

      const { unmount } = render(<LottieWrapper animationData="/assets/animations/test.json" />)

      await waitFor(() => {
        expect(screen.getByTestId('lottie')).toBeInTheDocument()
      })

      expect(() => unmount()).not.toThrow()
    })

    it('should handle unmount during loading', async () => {
      ;(global.fetch as jest.Mock).mockImplementation(
        () => new Promise(() => {}), // Never resolves
      )

      const { unmount } = render(<LottieWrapper animationData="/assets/animations/test.json" />)

      // Wait for loading state to be established
      await waitFor(() => {
        expect(screen.getByTestId('scale-loader')).toBeInTheDocument()
      })

      expect(() => unmount()).not.toThrow()
    })
  })

  describe('Return Types', () => {
    it('should return null for invalid animation data', () => {
      const { container } = render(<LottieWrapper animationData={null as any} />)

      expect(container.firstChild).toBeNull()
    })

    it('should return ReactElement when loading', async () => {
      ;(global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}))

      const { container } = render(<LottieWrapper animationData="/assets/animations/test.json" />)

      await waitFor(() => {
        expect(container.firstChild).not.toBeNull()
        expect(screen.getByTestId('scale-loader')).toBeInTheDocument()
      })
    })

    it('should return ReactElement when loaded', async () => {
      render(<LottieWrapper animationData={mockAnimationData} />)

      await waitFor(() => {
        expect(screen.getByTestId('lottie')).toBeInTheDocument()
      })
    })
  })
})
