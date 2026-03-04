import { userProfileInitialState } from './user-profile-web.reducer'
import { renderWithProviders } from '../../../../testing-render'
import { UserProfile } from './user-profile-web.component'

describe('UserProfile', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(<UserProfile />)
    expect(baseElement).toBeTruthy()
  })

  it('should render with a full profile', () => {
    const { baseElement } = renderWithProviders(<UserProfile />, {
      preloadedState: {
        userProfile: {
          ...userProfileInitialState,
          emails: [{ default: true, email: 'test@example.com', id: 'e1', isDeleted: false, isVerified: true, label: '' }],
          firstName: 'John',
          hasSecuredAccount: true,
          id: 'u1',
          lastName: 'Doe',
          phones: [],
          username: 'johndoe',
        },
      },
    })
    expect(baseElement).toBeTruthy()
  })
})
