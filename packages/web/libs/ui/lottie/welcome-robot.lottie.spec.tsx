import { render } from '@testing-library/react'

import { WelcomeRobotLottie } from './welcome-robot.lottie'

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

describe('WelcomeRobotLottie', () => {
  it('should render without crashing', () => {
    const { container } = render(<WelcomeRobotLottie />)
    expect(container.firstChild).not.toBeNull()
  })

  it('should render LottieWrapper with correct animation data', () => {
    const { getByTestId } = render(<WelcomeRobotLottie />)
    const wrapper = getByTestId('lottie-wrapper')

    expect(wrapper).toHaveAttribute('data-animation-data', '/assets/animations/welcome-robot.json')
  })

  it('should use loop value of true', () => {
    const { getByTestId } = render(<WelcomeRobotLottie />)
    const wrapper = getByTestId('lottie-wrapper')

    expect(wrapper).toHaveAttribute('data-loop', 'true')
  })

  it('should use speed of 1', () => {
    const { getByTestId } = render(<WelcomeRobotLottie />)
    const wrapper = getByTestId('lottie-wrapper')

    expect(wrapper).toHaveAttribute('data-speed', '1')
  })

  it('should accept complete callback', () => {
    const mockComplete = jest.fn()
    render(<WelcomeRobotLottie complete={mockComplete} />)

    // Component should render without errors
    expect(mockComplete).not.toHaveBeenCalled()
  })
})
