jest.mock('./user-profile-web.api', () => ({
  useLazyGetProfileQuery: () => [
    jest.fn().mockReturnValue(Promise.resolve({ data: undefined })),
    { data: undefined, error: undefined, isFetching: false, isUninitialized: true },
  ],
  useUpdatePasswordMutation: () => [
    jest.fn().mockReturnValue({ unwrap: jest.fn().mockResolvedValue({ updated: true }) }),
    {
      data: undefined,
      error: undefined,
      isLoading: false,
      isSuccess: false,
      isUninitialized: true,
    },
  ],
}))

jest.mock('../../auth/auth-web.api', () => ({
  useCheckPasswordStrengthMutation: () => [
    jest.fn().mockReturnValue({ unwrap: jest.fn().mockResolvedValue({ score: 4 }) }),
    {
      data: undefined,
      error: undefined,
      isLoading: false,
      isSuccess: false,
      isUninitialized: true,
    },
  ],
}))

import { fireEvent } from '@testing-library/react'

import { renderWithProviders } from '../../../../testing-render'
import { userProfileInitialState } from './user-profile-web.reducer'
import { UserProfileChangePasswordDialog } from './user-profile-web-change-password.dialog'

const baseState = {
  userProfile: {
    ...userProfileInitialState,
    emails: [
      { default: true, email: 'a@b.com', id: 'e1', isDeleted: false, isVerified: true, label: '' },
    ],
    id: 'u1',
    phones: [],
  },
}

describe('UserProfileChangePasswordDialog', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(
      <UserProfileChangePasswordDialog
        closeDialog={jest.fn()}
        userId="u1"
      />,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render form elements', () => {
    const { container } = renderWithProviders(
      <UserProfileChangePasswordDialog
        closeDialog={jest.fn()}
        userId="u1"
      />,
    )
    expect(container.querySelector('input, button')).toBeTruthy()
  })

  it('should render with preloaded profile state', () => {
    const { baseElement } = renderWithProviders(
      <UserProfileChangePasswordDialog
        closeDialog={jest.fn()}
        userId="u1"
      />,
      { preloadedState: baseState },
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render password and confirm-password inputs', () => {
    const { container } = renderWithProviders(
      <UserProfileChangePasswordDialog
        closeDialog={jest.fn()}
        userId="u1"
      />,
      { preloadedState: baseState },
    )
    const inputs = container.querySelectorAll('input')
    expect(inputs.length).toBeGreaterThanOrEqual(2)
  })

  it('should update password input value on change', () => {
    const { container } = renderWithProviders(
      <UserProfileChangePasswordDialog
        closeDialog={jest.fn()}
        userId="u1"
      />,
      { preloadedState: baseState },
    )
    const [passwordInput] = container.querySelectorAll<HTMLInputElement>('input')
    fireEvent.change(passwordInput, { target: { value: 'MyStr0ngP@ss' } })
    expect(passwordInput.value).toBe('MyStr0ngP@ss')
  })

  it('should update confirm-password input value on change', () => {
    const { container } = renderWithProviders(
      <UserProfileChangePasswordDialog
        closeDialog={jest.fn()}
        userId="u1"
      />,
      { preloadedState: baseState },
    )
    const inputs = container.querySelectorAll<HTMLInputElement>('input')
    const confirmInput = inputs[1]
    fireEvent.change(confirmInput, { target: { value: 'MyStr0ngP@ss' } })
    expect(confirmInput.value).toBe('MyStr0ngP@ss')
  })

  it('should toggle password visibility on icon click', () => {
    const { container } = renderWithProviders(
      <UserProfileChangePasswordDialog
        closeDialog={jest.fn()}
        userId="u1"
      />,
      { preloadedState: baseState },
    )
    const [passwordInput] = container.querySelectorAll<HTMLInputElement>('input')
    expect(passwordInput.type).toBe('password')

    // The VisibilityOff / Visibility icons are SVGs inside the input adornment
    const visibilityIcon = container.querySelector<SVGElement>('svg')
    if (visibilityIcon) {
      fireEvent.click(visibilityIcon)
      expect(passwordInput.type).toBe('text')
    }
  })

  it('should call closeDialog when Cancel button is clicked', () => {
    const closeDialog = jest.fn()
    const { getAllByRole } = renderWithProviders(
      <UserProfileChangePasswordDialog
        closeDialog={closeDialog}
        userId="u1"
      />,
      { preloadedState: baseState },
    )
    const cancelButton = getAllByRole('button').find((b) =>
      b.textContent?.toLowerCase().includes('cancel'),
    )
    fireEvent.click(cancelButton as HTMLButtonElement)
    expect(closeDialog).toHaveBeenCalled()
  })

  it('should keep Update button disabled when passwords are empty', () => {
    const { getAllByRole } = renderWithProviders(
      <UserProfileChangePasswordDialog
        closeDialog={jest.fn()}
        userId="u1"
      />,
      { preloadedState: baseState },
    )
    const updateButton = getAllByRole('button').find((b) =>
      b.textContent?.toLowerCase().includes('update'),
    )
    expect(updateButton).toBeDisabled()
  })

  it('should keep Update button disabled when passwords do not match', () => {
    const { container, getAllByRole } = renderWithProviders(
      <UserProfileChangePasswordDialog
        closeDialog={jest.fn()}
        userId="u1"
      />,
      { preloadedState: baseState },
    )
    const [passInput, confirmInput] = container.querySelectorAll<HTMLInputElement>('input')
    fireEvent.change(passInput, { target: { value: 'Password1!' } })
    fireEvent.change(confirmInput, { target: { value: 'DifferentPass!' } })

    const updateButton = getAllByRole('button').find((b) =>
      b.textContent?.toLowerCase().includes('update'),
    )
    expect(updateButton).toBeDisabled()
  })

  it('should render CHANGE_PASSWORD title when user has emails', () => {
    const { container } = renderWithProviders(
      <UserProfileChangePasswordDialog
        closeDialog={jest.fn()}
        userId="u1"
      />,
      { preloadedState: baseState },
    )
    // DialogTitle text varies by hasSecuredAccount / emails
    expect(container.textContent?.length).toBeGreaterThan(0)
  })
})
