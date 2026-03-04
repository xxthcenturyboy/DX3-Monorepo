jest.mock('./user-admin-web.api', () => ({
  useDeleteUserMutation: () => [
    jest.fn(),
    { data: undefined, error: undefined, isLoading: false, isUninitialized: true },
  ],
  useGetUsersListLazyQuery: () => [
    jest.fn().mockReturnValue(Promise.resolve({ data: undefined })),
    { data: undefined, error: undefined, isFetching: false, isUninitialized: true },
  ],
  useLazyGetUserAdminListQuery: () => [
    jest.fn().mockReturnValue(Promise.resolve({ data: undefined })),
    { data: undefined, error: undefined, isFetching: false, isUninitialized: true },
  ],
  useLazyGetUsersListQuery: () => [
    jest.fn().mockReturnValue(Promise.resolve({ data: undefined })),
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

import { MemoryRouter } from 'react-router'

import { renderWithProviders } from '../../../../testing-render'
import { userAdminInitialState } from './user-admin-web.reducer'
import { UserAdminList } from './user-admin-web-list.component'

describe('UserAdminListComponent', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(
      <MemoryRouter>
        <UserAdminList />
      </MemoryRouter>,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render with user data in state', () => {
    const { baseElement } = renderWithProviders(
      <MemoryRouter>
        <UserAdminList />
      </MemoryRouter>,
      {
        preloadedState: {
          userAdmin: {
            ...userAdminInitialState,
            filterValue: '',
            limit: 25,
            offset: 0,
            users: [],
            usersCount: 0,
          },
        },
      },
    )
    expect(baseElement).toBeTruthy()
  })
})
