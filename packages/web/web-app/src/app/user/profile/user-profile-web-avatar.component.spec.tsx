import { renderWithProviders } from '../../../../testing-render'
import { UserProfileAvatar } from './user-profile-web-avatar.component'

describe('UserProfileAvatar', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(<UserProfileAvatar />)
    expect(baseElement).toBeTruthy()
  })

  it('should render an avatar element', () => {
    const { container } = renderWithProviders(<UserProfileAvatar />)
    expect(container.querySelector('.MuiAvatar-root')).toBeTruthy()
  })

  it('should render with custom size', () => {
    const { container } = renderWithProviders(
      <UserProfileAvatar size={{ height: 32, width: 32 }} />,
    )
    expect(container.querySelector('.MuiAvatar-root')).toBeTruthy()
  })

  it('should render camera badge when handleChangeImage is provided', () => {
    const handleChangeImage = jest.fn()
    const { container } = renderWithProviders(
      <UserProfileAvatar handleChangeImage={handleChangeImage} />,
    )
    expect(container.querySelector('.MuiBadge-root')).toBeTruthy()
  })

  it('should not render badge when handleChangeImage is not provided', () => {
    const { container } = renderWithProviders(<UserProfileAvatar />)
    expect(container.querySelector('.MuiBadge-root')).toBeNull()
  })
})
