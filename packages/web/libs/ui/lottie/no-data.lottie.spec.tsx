import { render } from '@testing-library/react'

import { NoDataLottie } from './no-data.lottie'

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

describe('NoDataLottie', () => {
  it('should render without crashing', () => {
    const { container } = render(<NoDataLottie />)
    expect(container.firstChild).not.toBeNull()
  })

  it('should render LottieWrapper with correct animation data', () => {
    const { getByTestId } = render(<NoDataLottie />)
    const wrapper = getByTestId('lottie-wrapper')

    expect(wrapper).toHaveAttribute('data-animation-data', '/assets/animations/no-data.json')
  })

  it('should use loop value of true', () => {
    const { getByTestId } = render(<NoDataLottie />)
    const wrapper = getByTestId('lottie-wrapper')

    expect(wrapper).toHaveAttribute('data-loop', 'true')
  })

  it('should use speed of 0.5', () => {
    const { getByTestId } = render(<NoDataLottie />)
    const wrapper = getByTestId('lottie-wrapper')

    expect(wrapper).toHaveAttribute('data-speed', '0.5')
  })

  it('should accept complete callback', () => {
    const mockComplete = jest.fn()
    render(<NoDataLottie complete={mockComplete} />)

    // Component should render without errors
    expect(mockComplete).not.toHaveBeenCalled()
  })
})
