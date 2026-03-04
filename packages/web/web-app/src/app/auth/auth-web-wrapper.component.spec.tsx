jest.mock('./auth-web-login.component', () => ({
  WebLogin: () => <div data-testid="web-login">Login Form</div>,
}))

jest.mock('./auth-web-signup.component', () => ({
  WebSignup: () => <div data-testid="web-signup">Signup Form</div>,
}))

jest.mock('./auth-web-login.ui', () => ({
  Logo: ({ src }: { src: string }) => <img alt="logo" src={src} />,
}))

import { renderWithProviders } from '../../../testing-render'
import { WebAuthWrapper } from './auth-web-wrapper.component'

describe('WebAuthWrapper', () => {
  it('should render without crashing in login mode', () => {
    const { baseElement } = renderWithProviders(<WebAuthWrapper route="login" />)
    expect(baseElement).toBeTruthy()
  })

  it('should render login form when route is "login"', () => {
    const { getByTestId } = renderWithProviders(<WebAuthWrapper route="login" />)
    expect(getByTestId('web-login')).toBeTruthy()
  })

  it('should render signup form when route is "signup"', () => {
    const { getByTestId } = renderWithProviders(<WebAuthWrapper route="signup" />)
    expect(getByTestId('web-signup')).toBeTruthy()
  })

  it('should not render signup form when route is "login"', () => {
    const { queryByTestId } = renderWithProviders(<WebAuthWrapper route="login" />)
    expect(queryByTestId('web-signup')).toBeNull()
  })
})
