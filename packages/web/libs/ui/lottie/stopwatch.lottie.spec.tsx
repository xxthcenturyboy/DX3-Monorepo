import { render } from '@testing-library/react'

import { StopwatchLottie } from './stopwatch.lottie'

// Mock the LottieWrapper component
jest.mock('./LottieWrapper', () => ({
  LottieWrapper: (props: any) => (
    <div
      data-animation-data={props.animationData}
      data-loop={props.loop}
      data-speed={props.speed}
      data-testid="lottie-wrapper"
    >
      Lottie Animation
    </div>
  ),
}))

describe('StopwatchLottie', () => {
  it('should render without crashing', () => {
    const { container } = render(<StopwatchLottie />)
    expect(container.firstChild).not.toBeNull()
  })

  it('should render LottieWrapper with correct animation data', () => {
    const { getByTestId } = render(<StopwatchLottie />)
    const wrapper = getByTestId('lottie-wrapper')

    expect(wrapper).toHaveAttribute('data-animation-data', '/assets/animations/stopwatch.json')
  })

  it('should use loop value of true', () => {
    const { getByTestId } = render(<StopwatchLottie />)
    const wrapper = getByTestId('lottie-wrapper')

    expect(wrapper).toHaveAttribute('data-loop', 'true')
  })

  it('should use speed of 1', () => {
    const { getByTestId } = render(<StopwatchLottie />)
    const wrapper = getByTestId('lottie-wrapper')

    expect(wrapper).toHaveAttribute('data-speed', '1')
  })

  it('should accept complete callback', () => {
    const mockComplete = jest.fn()
    render(<StopwatchLottie complete={mockComplete} />)

    // Component should render without errors
    expect(mockComplete).not.toHaveBeenCalled()
  })
})
