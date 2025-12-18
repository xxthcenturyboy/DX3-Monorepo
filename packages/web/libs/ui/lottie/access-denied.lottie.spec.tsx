import { render } from '@testing-library/react'

import { AccessDeniedLottie } from './access-denied.lottie'

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

describe('AccessDeniedLottie', () => {
  it('should render without crashing', () => {
    const { container } = render(<AccessDeniedLottie />)
    expect(container.firstChild).not.toBeNull()
  })

  it('should render LottieWrapper with correct animation data', () => {
    const { getByTestId } = render(<AccessDeniedLottie />)
    const wrapper = getByTestId('lottie-wrapper')

    expect(wrapper).toHaveAttribute('data-animation-data', '/assets/animations/access-denied.json')
  })

  it('should use default loop value of true', () => {
    const { getByTestId } = render(<AccessDeniedLottie />)
    const wrapper = getByTestId('lottie-wrapper')

    expect(wrapper).toHaveAttribute('data-loop', 'true')
  })

  it('should allow custom loop value', () => {
    const { getByTestId } = render(<AccessDeniedLottie loop={false} />)
    const wrapper = getByTestId('lottie-wrapper')

    expect(wrapper).toHaveAttribute('data-loop', 'false')
  })

  it('should use speed of 0.5', () => {
    const { getByTestId } = render(<AccessDeniedLottie />)
    const wrapper = getByTestId('lottie-wrapper')

    expect(wrapper).toHaveAttribute('data-speed', '0.5')
  })

  it('should accept complete callback', () => {
    const mockComplete = jest.fn()
    render(<AccessDeniedLottie complete={mockComplete} />)

    // Component should render without errors
    expect(mockComplete).not.toHaveBeenCalled()
  })

  it('should accept both loop and complete props', () => {
    const mockComplete = jest.fn()
    const { getByTestId } = render(
      <AccessDeniedLottie
        complete={mockComplete}
        loop={false}
      />,
    )
    const wrapper = getByTestId('lottie-wrapper')

    expect(wrapper).toHaveAttribute('data-loop', 'false')
  })
})
