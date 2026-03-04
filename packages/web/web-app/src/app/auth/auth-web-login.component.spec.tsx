jest.mock('./auth-web.api', () => ({
  useLoginMutation: () => [
    jest.fn().mockReturnValue({ unwrap: jest.fn().mockResolvedValue({ token: 'jwt.token' }) }),
    { error: undefined, isLoading: false },
  ],
}))

jest.mock('../config/bootstrap/login-bootstrap', () => ({
  loginBootstrap: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('./auth-web-login-user-pass.component', () => ({
  WebLoginUserPass: React.forwardRef(() => (
    <div data-testid="user-pass-form">User Pass Form</div>
  )),
}))

jest.mock('./auth-web-request-otp.component', () => ({
  AuthWebRequestOtp: React.forwardRef(() => (
    <div data-testid="request-otp">Request OTP</div>
  )),
}))

import React from 'react'
import { MemoryRouter } from 'react-router'

import { renderWithProviders } from '../../../testing-render'
import { WebLogin } from './auth-web-login.component'

describe('WebLogin', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(
      <MemoryRouter>
        <WebLogin />
      </MemoryRouter>,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render user-pass login form by default', () => {
    const { getByTestId } = renderWithProviders(
      <MemoryRouter>
        <WebLogin />
      </MemoryRouter>,
    )
    expect(getByTestId('user-pass-form')).toBeTruthy()
  })
})
