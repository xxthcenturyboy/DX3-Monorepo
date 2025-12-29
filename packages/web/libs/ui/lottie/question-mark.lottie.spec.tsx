import { render } from '@testing-library/react'

import { QuestionMarkLottie } from './question-mark.lottie'

// Mock the LottieWrapper component
jest.mock('./LottieWrapper', () => ({
  LottieWrapper: (props: any) => (
    <div
      data-animation-data={props.animationData}
      data-loop={props.loop}
      data-restart={props.restart}
      data-speed={props.speed}
      data-testid="lottie-wrapper"
    >
      Lottie Animation
    </div>
  ),
}))

describe('QuestionMarkLottie', () => {
  it('should render without crashing', () => {
    const { container } = render(<QuestionMarkLottie />)
    expect(container.firstChild).not.toBeNull()
  })

  it('should render LottieWrapper with correct animation data', () => {
    const { getByTestId } = render(<QuestionMarkLottie />)
    const wrapper = getByTestId('lottie-wrapper')

    expect(wrapper).toHaveAttribute(
      'data-animation-data',
      '/assets/animations/question-bubble.json',
    )
  })

  it('should use loop value of false', () => {
    const { getByTestId } = render(<QuestionMarkLottie />)
    const wrapper = getByTestId('lottie-wrapper')

    expect(wrapper).toHaveAttribute('data-loop', 'false')
  })

  it('should use speed of 2', () => {
    const { getByTestId } = render(<QuestionMarkLottie />)
    const wrapper = getByTestId('lottie-wrapper')

    expect(wrapper).toHaveAttribute('data-speed', '2')
  })

  it('should accept complete callback', () => {
    const mockComplete = jest.fn()
    render(<QuestionMarkLottie complete={mockComplete} />)

    // Component should render without errors
    expect(mockComplete).not.toHaveBeenCalled()
  })
})
