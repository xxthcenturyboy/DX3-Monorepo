import { render } from '@testing-library/react'

import { AlertLottie } from './alert.lottie'

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

describe('AlertLottie', () => {
  it('should render without crashing', () => {
    const { container } = render(<AlertLottie />)
    expect(container.firstChild).not.toBeNull()
  })

  it('should render LottieWrapper with correct animation data', () => {
    const { getByTestId } = render(<AlertLottie />)
    const wrapper = getByTestId('lottie-wrapper')

    expect(wrapper).toHaveAttribute(
      'data-animation-data',
      '/assets/animations/error-exclamation-point.json',
    )
  })

  it('should use loop value of true', () => {
    const { getByTestId } = render(<AlertLottie />)
    const wrapper = getByTestId('lottie-wrapper')

    expect(wrapper).toHaveAttribute('data-loop', 'true')
  })

  it('should use speed of 1.5', () => {
    const { getByTestId } = render(<AlertLottie />)
    const wrapper = getByTestId('lottie-wrapper')

    expect(wrapper).toHaveAttribute('data-speed', '1.5')
  })

  it('should accept complete callback', () => {
    const mockComplete = jest.fn()
    render(<AlertLottie complete={mockComplete} />)

    // Component should render without errors
    expect(mockComplete).not.toHaveBeenCalled()
  })
})
