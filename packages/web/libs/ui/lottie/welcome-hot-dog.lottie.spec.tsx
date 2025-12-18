import { render } from '@testing-library/react'

import { WelcomeHotDogLottie } from './welcome-hot-dog.lottie'

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

describe('WelcomeHotDogLottie', () => {
  it('should render without crashing', () => {
    const { container } = render(<WelcomeHotDogLottie />)
    expect(container.firstChild).not.toBeNull()
  })

  it('should render LottieWrapper with correct animation data', () => {
    const { getByTestId } = render(<WelcomeHotDogLottie />)
    const wrapper = getByTestId('lottie-wrapper')

    expect(wrapper).toHaveAttribute('data-animation-data', '/assets/animations/hot-dog-man.json')
  })

  it('should use loop value of true', () => {
    const { getByTestId } = render(<WelcomeHotDogLottie />)
    const wrapper = getByTestId('lottie-wrapper')

    expect(wrapper).toHaveAttribute('data-loop', 'true')
  })

  it('should use speed of 1', () => {
    const { getByTestId } = render(<WelcomeHotDogLottie />)
    const wrapper = getByTestId('lottie-wrapper')

    expect(wrapper).toHaveAttribute('data-speed', '1')
  })

  it('should accept complete callback', () => {
    const mockComplete = jest.fn()
    render(<WelcomeHotDogLottie complete={mockComplete} />)

    // Component should render without errors
    expect(mockComplete).not.toHaveBeenCalled()
  })
})
