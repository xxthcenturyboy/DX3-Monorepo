jest.mock('../support-web.api', () => ({
  useGetSupportRequestByIdQuery: () => ({
    data: undefined,
    error: undefined,
    isLoading: false,
    refetch: jest.fn(),
  }),
  useMarkSupportAsViewedMutation: () => [jest.fn(), { data: undefined, error: undefined, isLoading: false, isUninitialized: true }],
  useUpdateSupportRequestStatusMutation: () => [jest.fn(), { data: undefined, error: undefined, isLoading: false, isUninitialized: true }],
}))

import { MemoryRouter, Route, Routes } from 'react-router'

import { renderWithProviders } from '../../../../testing-render'
import { SupportAdminDetailComponent } from './support-admin-detail.component'

describe('SupportAdminDetailComponent', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(
      <MemoryRouter initialEntries={['/admin/support/req-1']}>
        <Routes>
          <Route
            element={<SupportAdminDetailComponent />}
            path="/admin/support/:requestId"
          />
        </Routes>
      </MemoryRouter>,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render loading state', () => {
    const { baseElement } = renderWithProviders(
      <MemoryRouter initialEntries={['/admin/support/req-1']}>
        <Routes>
          <Route
            element={<SupportAdminDetailComponent />}
            path="/admin/support/:requestId"
          />
        </Routes>
      </MemoryRouter>,
    )
    expect(baseElement).toBeTruthy()
  })
})
