/**
 * Mock implementation for lottie-react
 * This mock provides a lightweight replacement for Lottie animations in Jest tests
 * to avoid canvas/animation rendering issues and improve test performance.
 *
 * Centralized mock for all web packages (libs and web-app)
 */
import React, { forwardRef } from 'react'

// Type definitions for LottieRef
interface LottieRefMethods {
  play: () => void
  pause: () => void
  stop: () => void
  setSpeed: (speed: number) => void
  goToAndPlay: (value: number, isFrame?: boolean) => void
  goToAndStop: (value: number, isFrame?: boolean) => void
  setDirection: (direction: 1 | -1) => void
  playSegments: (segments: [number, number] | [number, number][], forceFlag?: boolean) => void
  setSubframe: (useSubFrames: boolean) => void
  getDuration: (inFrames?: boolean) => number
  destroy: () => void
}

interface LottieRefObject {
  current: LottieRefMethods | null
}

export type LottieRef = React.MutableRefObject<LottieRefMethods | null>

// Props interface matching lottie-react component
interface LottieProps {
  animationData?: object
  loop?: boolean
  autoplay?: boolean
  autoPlay?: boolean
  initialSegment?: [number, number]
  path?: string
  rendererSettings?: object
  onComplete?: () => void
  onLoopComplete?: () => void
  onEnterFrame?: (event: { currentTime: number; totalTime: number }) => void
  onSegmentStart?: () => void
  onConfigReady?: () => void
  onDataReady?: () => void
  onDOMLoaded?: () => void
  onDestroy?: () => void
  lottieRef?: LottieRefObject
  style?: React.CSSProperties
  className?: string
  'data-testid'?: string
}

// Mock Lottie component
const Lottie = forwardRef<HTMLDivElement, LottieProps>((props, ref) => {
  const {
    animationData,
    autoplay,
    autoPlay,
    loop,
    // Destructure event handlers to prevent them from being passed to the div
    onComplete: _onComplete,
    onLoopComplete: _onLoopComplete,
    onEnterFrame: _onEnterFrame,
    onSegmentStart: _onSegmentStart,
    onConfigReady: _onConfigReady,
    onDataReady: _onDataReady,
    onDOMLoaded: _onDOMLoaded,
    onDestroy: _onDestroy,
    // Destructure other non-DOM props
    initialSegment: _initialSegment,
    path: _path,
    rendererSettings: _rendererSettings,
    lottieRef,
    style,
    className,
    'data-testid': dataTestId,
    ...restProps
  } = props

  // Set up lottieRef mock methods if provided
  React.useEffect(() => {
    if (lottieRef) {
      lottieRef.current = {
        destroy: jest.fn(),
        getDuration: jest.fn(() => 1000),
        goToAndPlay: jest.fn(),
        goToAndStop: jest.fn(),
        pause: jest.fn(),
        play: jest.fn(),
        playSegments: jest.fn(),
        setDirection: jest.fn(),
        setSpeed: jest.fn(),
        setSubframe: jest.fn(),
        stop: jest.fn(),
      }
    }

    return () => {
      if (lottieRef) {
        lottieRef.current = null
      }
    }
  }, [lottieRef])

  // Determine autoplay value (support both naming conventions)
  const isAutoPlay = autoPlay ?? autoplay ?? true

  return (
    <div
      className={className}
      data-autoplay={isAutoPlay}
      data-has-animation-data={!!animationData}
      data-loop={loop ?? true}
      data-testid={dataTestId ?? 'lottie'}
      ref={ref}
      style={style}
      {...restProps}
    >
      Lottie Animation
    </div>
  )
})

Lottie.displayName = 'Lottie'

// Hook mock for useLottie
export const useLottie = (options: LottieProps) => {
  const containerRef = React.useRef<HTMLDivElement>(null)

  const lottieInstance: LottieRefMethods = {
    destroy: jest.fn(),
    getDuration: jest.fn(() => 1000),
    goToAndPlay: jest.fn(),
    goToAndStop: jest.fn(),
    pause: jest.fn(),
    play: jest.fn(),
    playSegments: jest.fn(),
    setDirection: jest.fn(),
    setSpeed: jest.fn(),
    setSubframe: jest.fn(),
    stop: jest.fn(),
  }

  const View = (
    <div
      data-autoplay={options.autoplay ?? options.autoPlay ?? true}
      data-loop={options.loop ?? true}
      data-testid="lottie-hook"
      ref={containerRef}
    >
      Lottie Animation (Hook)
    </div>
  )

  return {
    View,
    ...lottieInstance,
    animationContainerRef: containerRef,
    animationItem: lottieInstance,
    animationLoaded: true,
  }
}

// Hook mock for useLottieInteractivity
export const useLottieInteractivity = (options: {
  lottieObj: ReturnType<typeof useLottie>
  mode: string
  actions: unknown[]
}) => {
  return options.lottieObj.View
}

export default Lottie
