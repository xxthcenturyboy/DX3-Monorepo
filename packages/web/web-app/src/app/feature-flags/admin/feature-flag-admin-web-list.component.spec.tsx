jest.mock('./feature-flag-admin-web.api', () => ({
  useCreateFeatureFlagMutation: () => [
    jest.fn().mockReturnValue({ unwrap: jest.fn().mockResolvedValue({ id: 'ff1' }) }),
    {
      data: undefined,
      error: undefined,
      isLoading: false,
      isUninitialized: true,
      reset: jest.fn(),
    },
  ],
  useDeleteFeatureFlagMutation: () => [
    jest.fn().mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) }),
    { data: undefined, error: undefined, isLoading: false, isUninitialized: true },
  ],
  useLazyGetAdminFeatureFlagsQuery: () => [
    jest.fn().mockReturnValue(Promise.resolve()),
    { data: undefined, error: undefined, isFetching: false, isUninitialized: true },
  ],
  useUpdateFeatureFlagMutation: () => [
    jest.fn().mockReturnValue({ unwrap: jest.fn().mockResolvedValue({ id: 'ff1' }) }),
    {
      data: undefined,
      error: undefined,
      isLoading: false,
      isUninitialized: true,
      reset: jest.fn(),
    },
  ],
}))

import { MemoryRouter } from 'react-router'

import { renderWithProviders } from '../../../../testing-render'
import { featureFlagAdminInitialState } from './feature-flag-admin-web.reducer'
import { FeatureFlagAdminList } from './feature-flag-admin-web-list.component'

describe('FeatureFlagAdminListComponent', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(
      <MemoryRouter>
        <FeatureFlagAdminList />
      </MemoryRouter>,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render with flags in state', () => {
    const { baseElement } = renderWithProviders(
      <MemoryRouter>
        <FeatureFlagAdminList />
      </MemoryRouter>,
      {
        preloadedState: {
          featureFlagsAdmin: {
            ...featureFlagAdminInitialState,
            filterValue: '',
            flags: [],
            limit: 25,
            offset: 0,
          },
        },
      },
    )
    expect(baseElement).toBeTruthy()
  })
})
