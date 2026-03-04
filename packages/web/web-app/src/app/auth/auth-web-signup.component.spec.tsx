jest.mock('./auth-web.api', () => ({
  useCreateAccountMutation: () => [
    jest.fn().mockReturnValue({ unwrap: jest.fn().mockResolvedValue({ token: 'new.jwt.token' }) }),
    { error: undefined, isLoading: false },
  ],
}))

jest.mock('../config/bootstrap/login-bootstrap', () => ({
  loginBootstrap: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('./auth-web-request-otp.component', () => ({
  AuthWebRequestOtp: React.forwardRef(() => (
    <div data-testid="request-otp">Request OTP Component</div>
  )),
}))

import React from 'react'
import { MemoryRouter } from 'react-router'

import { renderWithProviders } from '../../../testing-render'
import { WebSignup } from './auth-web-signup.component'

describe('WebSignup', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(
      <MemoryRouter>
        <WebSignup />
      </MemoryRouter>,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render the OTP request component', () => {
    const { getByTestId } = renderWithProviders(
      <MemoryRouter>
        <WebSignup />
      </MemoryRouter>,
    )
    expect(getByTestId('request-otp')).toBeTruthy()
  })
})
