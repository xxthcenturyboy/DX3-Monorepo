jest.mock('./user-admin-web.api', () => ({
  useDeleteUserMutation: () => [
    jest.fn(),
    { data: undefined, error: undefined, isLoading: false, isUninitialized: true },
  ],
  useGetUserByIdQuery: () => ({
    data: undefined,
    error: undefined,
    isLoading: false,
    refetch: jest.fn(),
  }),
  useLazyGetUserAdminQuery: () => [
    jest.fn().mockReturnValue(Promise.resolve({ data: undefined })),
    { data: undefined, error: undefined, isFetching: false, isUninitialized: true },
  ],
  useToggleAccountRestrictionMutation: () => [
    jest.fn(),
    { data: undefined, error: undefined, isLoading: false, isUninitialized: true },
  ],
  useUpdateUserRolesMutation: () => [
    jest.fn(),
    { data: undefined, error: undefined, isLoading: false, isUninitialized: true },
  ],
  useUpdateUserRolesRestrictionsMutation: () => [
    jest.fn(),
    { data: undefined, error: undefined, isLoading: false, isUninitialized: true },
  ],
}))

jest.mock('../../user-privilege/user-privilege-web.api', () => ({
  useGetPrivilegesForUserQuery: () => ({
    data: undefined,
    error: undefined,
    isLoading: false,
  }),
  useLazyGetPrivilegeSetsQuery: () => [
    jest.fn().mockReturnValue(Promise.resolve()),
    { data: undefined, error: undefined, isFetching: false, isUninitialized: true },
  ],
}))

jest.mock('../../notifications/notification-web.api', () => ({
  useSendNotificationAppUpdateMutation: () => [
    jest.fn(),
    { data: undefined, error: undefined, isLoading: false, isUninitialized: true },
  ],
  useSendNotificationToAllMutation: () => [
    jest.fn(),
    { data: undefined, error: undefined, isLoading: false, isUninitialized: true },
  ],
  useSendNotificationToUserMutation: () => [
    jest.fn(),
    { data: undefined, error: undefined, isLoading: false, isUninitialized: true },
  ],
}))

import { MemoryRouter, Route, Routes } from 'react-router'

import { renderWithProviders } from '../../../../testing-render'
import { UserAdminEdit } from './user-admin-web-edit.component'

describe('UserAdminEdit', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(
      <MemoryRouter initialEntries={['/admin/user/u1/overview']}>
        <Routes>
          <Route
            element={<UserAdminEdit />}
            path="/admin/user/:id/*"
          />
        </Routes>
      </MemoryRouter>,
    )
    expect(baseElement).toBeTruthy()
  })
})
