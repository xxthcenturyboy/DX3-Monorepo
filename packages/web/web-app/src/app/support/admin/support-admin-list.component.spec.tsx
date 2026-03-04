jest.mock('../support-web.api', () => ({
  useBulkUpdateSupportStatusMutation: () => [jest.fn(), { error: undefined, isLoading: false, isUninitialized: true }],
  useGetSupportRequestListLazyQuery: () => [
    jest.fn().mockReturnValue(Promise.resolve()),
    { data: undefined, error: undefined, isFetching: false, isUninitialized: true },
  ],
  useLazyGetSupportRequestListQuery: () => [
    jest.fn().mockReturnValue(Promise.resolve()),
    { data: undefined, error: undefined, isFetching: false, isUninitialized: true },
  ],
  useLazyGetSupportUnviewedCountQuery: () => [
    jest.fn().mockReturnValue(Promise.resolve()),
    { data: undefined, error: undefined, isFetching: false, isUninitialized: true },
  ],
  useMarkAllSupportAsViewedMutation: () => [jest.fn(), { error: undefined, isLoading: false, isUninitialized: true }],
}))

import { MemoryRouter } from 'react-router'

import { renderWithProviders } from '../../../../testing-render'
import { supportAdminInitialState } from '../store/support-admin-web.reducer'
import { SupportAdminListComponent } from './support-admin-list.component'

describe('SupportAdminListComponent', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(
      <MemoryRouter>
        <SupportAdminListComponent />
      </MemoryRouter>,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render with support data in state', () => {
    const { baseElement } = renderWithProviders(
      <MemoryRouter>
        <SupportAdminListComponent />
      </MemoryRouter>,
      {
        preloadedState: {
          supportAdmin: {
            ...supportAdminInitialState,
            filterValue: '',
            limit: 25,
            offset: 0,
            supportRequestsWithUser: [],
          },
        },
      },
    )
    expect(baseElement).toBeTruthy()
  })
})
