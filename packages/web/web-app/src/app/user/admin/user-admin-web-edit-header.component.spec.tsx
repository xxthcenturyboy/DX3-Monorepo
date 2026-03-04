import { MemoryRouter } from 'react-router'

import { renderWithProviders } from '../../../../testing-render'
import { userAdminInitialState } from './user-admin-web.reducer'
import { UserAdminEditHeaderComponent } from './user-admin-web-edit-header.component'

describe('UserAdminEditHeaderComponent', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(
      <MemoryRouter>
        <UserAdminEditHeaderComponent />
      </MemoryRouter>,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render with a user name', () => {
    const { container } = renderWithProviders(
      <MemoryRouter>
        <UserAdminEditHeaderComponent />
      </MemoryRouter>,
      {
        preloadedState: {
          userAdmin: {
            ...userAdminInitialState,
            user: {
              emails: [],
              fullName: 'John Doe',
              id: 'u1',
              phones: [],
            } as never,
          },
        },
      },
    )
    expect(container).toBeTruthy()
  })
})
