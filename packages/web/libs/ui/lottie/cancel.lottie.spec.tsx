import { render } from '@testing-library/react'

import { CancelLottie } from './cancel.lottie'

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

describe('CancelLottie', () => {
  it('should render without crashing', () => {
    const { container } = render(<CancelLottie />)
    expect(container.firstChild).not.toBeNull()
  })

  it('should render LottieWrapper with correct animation data', () => {
    const { getByTestId } = render(<CancelLottie />)
    const wrapper = getByTestId('lottie-wrapper')

    expect(wrapper).toHaveAttribute('data-animation-data', '/assets/animations/cancel-icon.json')
  })

  it('should use loop value of false', () => {
    const { getByTestId } = render(<CancelLottie />)
    const wrapper = getByTestId('lottie-wrapper')

    expect(wrapper).toHaveAttribute('data-loop', 'false')
  })

  it('should use speed of 2', () => {
    const { getByTestId } = render(<CancelLottie />)
    const wrapper = getByTestId('lottie-wrapper')

    expect(wrapper).toHaveAttribute('data-speed', '2')
  })

  it('should accept complete callback', () => {
    const mockComplete = jest.fn()
    render(<CancelLottie complete={mockComplete} />)

    // Component should render without errors
    expect(mockComplete).not.toHaveBeenCalled()
  })
})
