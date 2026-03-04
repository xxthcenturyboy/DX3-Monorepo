import { renderWithProviders } from '../../../testing-render'
import { WebLoginUserPass } from './auth-web-login-user-pass.component'

describe('WebLoginUserPass', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(
      <WebLoginUserPass
        changeLoginType={jest.fn()}
        isFetchingLogin={false}
        login={jest.fn().mockResolvedValue(undefined)}
      />,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render in loading state', () => {
    const { baseElement } = renderWithProviders(
      <WebLoginUserPass
        changeLoginType={jest.fn()}
        isFetchingLogin={true}
        login={jest.fn().mockResolvedValue(undefined)}
      />,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render username and password inputs', () => {
    const { container } = renderWithProviders(
      <WebLoginUserPass
        changeLoginType={jest.fn()}
        isFetchingLogin={false}
        login={jest.fn().mockResolvedValue(undefined)}
      />,
    )
    const inputs = container.querySelectorAll('input')
    expect(inputs.length).toBeGreaterThan(0)
  })

  it('should render a submit button', () => {
    const { container } = renderWithProviders(
      <WebLoginUserPass
        changeLoginType={jest.fn()}
        isFetchingLogin={false}
        login={jest.fn().mockResolvedValue(undefined)}
      />,
    )
    expect(container.querySelector('button')).toBeTruthy()
  })
})
