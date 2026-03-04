import { MemoryRouter, Route, Routes } from 'react-router'

import { userAdminInitialState } from './user-admin-web.reducer'
import { renderWithProviders } from '../../../../testing-render'
import { UserAdminMain } from './user-admin-web.component'

describe('UserAdminMain', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(
      <MemoryRouter>
        <Routes>
          <Route
            element={<UserAdminMain />}
            path="/"
          />
        </Routes>
      </MemoryRouter>,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render and redirect to lastRoute if set', () => {
    const { baseElement } = renderWithProviders(
      <MemoryRouter>
        <Routes>
          <Route
            element={<UserAdminMain />}
            path="/"
          />
          <Route
            element={<div>User List</div>}
            path="/admin/users"
          />
        </Routes>
      </MemoryRouter>,
      {
        preloadedState: {
          userAdmin: {
            ...userAdminInitialState,
            lastRoute: '/admin/users',
          },
        },
      },
    )
    expect(baseElement).toBeTruthy()
  })
})
