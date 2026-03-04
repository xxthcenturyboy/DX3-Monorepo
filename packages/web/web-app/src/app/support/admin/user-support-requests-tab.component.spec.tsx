jest.mock('../support-web.api', () => ({
  useLazyGetSupportRequestListQuery: () => [
    jest.fn().mockReturnValue(Promise.resolve()),
    { data: undefined, error: undefined, isFetching: false, isUninitialized: true },
  ],
}))

import { MemoryRouter } from 'react-router'

import { renderWithProviders } from '../../../../testing-render'
import { supportAdminInitialState } from '../store/support-admin-web.reducer'
import { UserSupportRequestsTabComponent } from './user-support-requests-tab.component'

describe('UserSupportRequestsTabComponent', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(
      <MemoryRouter>
        <UserSupportRequestsTabComponent userId="u1" />
      </MemoryRouter>,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render with no requests', () => {
    const { baseElement } = renderWithProviders(
      <MemoryRouter>
        <UserSupportRequestsTabComponent userId="u1" />
      </MemoryRouter>,
      {
        preloadedState: {
          supportAdmin: {
            ...supportAdminInitialState,
            userTab: {
              ...supportAdminInitialState.userTab,
              supportRequests: [],
            },
          },
        },
      },
    )
    expect(baseElement).toBeTruthy()
  })
})
