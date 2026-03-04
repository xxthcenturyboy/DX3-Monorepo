jest.mock('react-avatar-editor', () => {
  const React = require('react')
  const MockAvatarEditor = React.forwardRef(
    (_props: Record<string, unknown>, _ref: unknown) => (
      <canvas
        data-testid="avatar-editor"
        height="200"
        width="200"
      />
    ),
  )
  MockAvatarEditor.displayName = 'MockAvatarEditor'
  return MockAvatarEditor
})

jest.mock('../../media/media-web.api', () => ({
  useUploadAvatarMutation: () => [
    jest.fn().mockReturnValue({ unwrap: jest.fn().mockResolvedValue({ id: 'media-1' }) }),
    { data: undefined, error: undefined, isLoading: false, isUninitialized: true },
  ],
}))

import { renderWithProviders } from '../../../../testing-render'
import { UserProfileWebAvatarDialog } from './user-profile-web-avatar.dialog'

describe('UserProfileWebAvatarDialog', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(
      <UserProfileWebAvatarDialog
        avatarDataCallback={jest.fn()}
        closeDialog={jest.fn()}
      />,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render action buttons', () => {
    const { container } = renderWithProviders(
      <UserProfileWebAvatarDialog
        avatarDataCallback={jest.fn()}
        closeDialog={jest.fn()}
      />,
    )
    expect(container.querySelector('button')).toBeTruthy()
  })
})
