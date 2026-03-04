jest.mock('./feature-flag-admin-web.api', () => ({
  useCreateFeatureFlagMutation: () => [
    jest.fn().mockReturnValue({ unwrap: jest.fn().mockResolvedValue({ id: 'ff1' }) }),
    { error: undefined, isLoading: false },
  ],
}))

import { renderWithProviders } from '../../../../testing-render'
import { FeatureFlagAdminCreateDialog } from './feature-flag-admin-web-create.dialog'

describe('FeatureFlagAdminCreateDialog', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(
      <FeatureFlagAdminCreateDialog
        closeDialog={jest.fn()}
        onSuccess={jest.fn()}
      />,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render form controls', () => {
    const { container } = renderWithProviders(
      <FeatureFlagAdminCreateDialog
        closeDialog={jest.fn()}
        onSuccess={jest.fn()}
      />,
    )
    expect(container.querySelector('button')).toBeTruthy()
  })
})
