jest.mock('./user-profile-web.api', () => ({
  useUpdateUserMutation: () => [
    jest.fn().mockReturnValue({ unwrap: jest.fn().mockResolvedValue({ id: 'u1' }) }),
    {
      data: undefined,
      error: undefined,
      isLoading: false,
      isSuccess: false,
      isUninitialized: true,
      reset: jest.fn(),
    },
  ],
}))

import { fireEvent, waitFor } from '@testing-library/react'

import { renderWithProviders } from '../../../../testing-render'
import { UserProfileEditNames } from './user-profile-names-edit.component'
import { userProfileInitialState } from './user-profile-web.reducer'

const baseState = {
  userProfile: {
    ...userProfileInitialState,
    emails: [],
    firstName: 'Jane',
    id: 'u1',
    lastName: 'Smith',
    phones: [],
    username: 'jsmith',
  },
}

describe('UserProfileEditNames', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(<UserProfileEditNames />)
    expect(baseElement).toBeTruthy()
  })

  it('should render with profile data', () => {
    const { container } = renderWithProviders(<UserProfileEditNames />, {
      preloadedState: baseState,
    })
    expect(container).toBeTruthy()
  })

  it('should render an edit icon button', () => {
    const { container } = renderWithProviders(<UserProfileEditNames />, {
      preloadedState: baseState,
    })
    expect(container.querySelector('button')).toBeTruthy()
  })

  it('should show edit form when edit button is clicked', async () => {
    const { container } = renderWithProviders(<UserProfileEditNames />, {
      preloadedState: baseState,
    })
    const editButton = container.querySelector('button') as HTMLButtonElement
    fireEvent.click(editButton)

    await waitFor(() => {
      // Form inputs for first name and last name should now be visible
      const inputs = container.querySelectorAll('input')
      expect(inputs.length).toBeGreaterThanOrEqual(2)
    })
  })

  it('should populate inputs with current profile values on edit', async () => {
    const { container } = renderWithProviders(<UserProfileEditNames />, {
      preloadedState: baseState,
    })
    fireEvent.click(container.querySelector('button') as HTMLButtonElement)

    await waitFor(() => {
      const inputs = container.querySelectorAll<HTMLInputElement>('input')
      const firstInput = inputs[0]
      expect(firstInput.value).toBe('Jane')
    })
  })

  it('should update first name input value on change', async () => {
    const { container } = renderWithProviders(<UserProfileEditNames />, {
      preloadedState: baseState,
    })
    fireEvent.click(container.querySelector('button') as HTMLButtonElement)

    await waitFor(() =>
      expect(container.querySelectorAll('input').length).toBeGreaterThanOrEqual(2),
    )

    const [firstInput] = container.querySelectorAll<HTMLInputElement>('input')
    fireEvent.change(firstInput, { target: { value: 'NewFirst' } })
    expect(firstInput.value).toBe('NewFirst')
  })

  it('should keep Save disabled when inputs are unchanged', async () => {
    const { container } = renderWithProviders(<UserProfileEditNames />, {
      preloadedState: baseState,
    })
    fireEvent.click(container.querySelector('button') as HTMLButtonElement)

    await waitFor(() =>
      expect(container.querySelectorAll('input').length).toBeGreaterThanOrEqual(2),
    )

    // Inputs are populated with existing values — Save should still be disabled
    const buttons = container.querySelectorAll('button')
    const saveButton = Array.from(buttons).find((b) =>
      b.textContent?.toLowerCase().includes('save'),
    )
    expect(saveButton).toBeDisabled()
  })

  it('should enable Save after changing both first and last name', async () => {
    const { container } = renderWithProviders(<UserProfileEditNames />, {
      preloadedState: baseState,
    })
    fireEvent.click(container.querySelector('button') as HTMLButtonElement)

    await waitFor(() =>
      expect(container.querySelectorAll('input').length).toBeGreaterThanOrEqual(2),
    )

    const inputs = container.querySelectorAll<HTMLInputElement>('input')
    fireEvent.change(inputs[0], { target: { value: 'Updated' } })
    fireEvent.change(inputs[1], { target: { value: 'Name' } })

    const saveButton = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.toLowerCase().includes('save'),
    )
    expect(saveButton).not.toBeDisabled()
  })

  it('should hide edit form and show display mode when Cancel is clicked', async () => {
    const { container } = renderWithProviders(<UserProfileEditNames />, {
      preloadedState: baseState,
    })
    fireEvent.click(container.querySelector('button') as HTMLButtonElement)

    await waitFor(() =>
      expect(container.querySelectorAll('input').length).toBeGreaterThanOrEqual(2),
    )

    const cancelButton = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.toLowerCase().includes('cancel'),
    )
    fireEvent.click(cancelButton as HTMLButtonElement)

    await waitFor(() => {
      expect(container.querySelectorAll<HTMLInputElement>('input').length).toBe(0)
    })
  })
})
