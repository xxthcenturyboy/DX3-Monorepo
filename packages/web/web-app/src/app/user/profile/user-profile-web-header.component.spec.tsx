import { userProfileInitialState } from './user-profile-web.reducer'
import { renderWithProviders } from '../../../../testing-render'
import { UserProfileHeaderComponent } from './user-profile-web-header.component'

describe('UserProfileHeaderComponent', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(<UserProfileHeaderComponent />)
    expect(baseElement).toBeTruthy()
  })

  it('should render a change password button', () => {
    const { container } = renderWithProviders(<UserProfileHeaderComponent />)
    const button = container.querySelector('button')
    expect(button).toBeTruthy()
  })

  it('should render with a profile that has a username', () => {
    const { container } = renderWithProviders(<UserProfileHeaderComponent />, {
      preloadedState: {
        userProfile: {
          ...userProfileInitialState,
          emails: [{ default: true, email: 'test@example.com', id: 'e1', isDeleted: false, isVerified: true, label: '' }],
          firstName: 'Test',
          id: 'u1',
          lastName: 'User',
          username: 'testuser',
        },
      },
    })
    expect(container).toBeTruthy()
  })
})
