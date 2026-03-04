jest.mock('./feature-flag-admin-web.api', () => ({
  useUpdateFeatureFlagMutation: () => [
    jest.fn().mockReturnValue({ unwrap: jest.fn().mockResolvedValue({ id: 'ff1' }) }),
    { error: undefined, isLoading: false },
  ],
}))

import { renderWithProviders } from '../../../../testing-render'
import { FeatureFlagAdminEditDialog } from './feature-flag-admin-web-edit.dialog'

const mockFlag = {
  enabled: true,
  id: 'ff1',
  name: 'FEATURE_X',
  status: 'ACTIVE',
  target: 'ALL',
}

describe('FeatureFlagAdminEditDialog', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(
      <FeatureFlagAdminEditDialog
        closeDialog={jest.fn()}
        flag={mockFlag as never}
        onSuccess={jest.fn()}
      />,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render without flag (null)', () => {
    const { baseElement } = renderWithProviders(
      <FeatureFlagAdminEditDialog
        closeDialog={jest.fn()}
        flag={null}
        onSuccess={jest.fn()}
      />,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render form controls', () => {
    const { container } = renderWithProviders(
      <FeatureFlagAdminEditDialog
        closeDialog={jest.fn()}
        flag={mockFlag as never}
        onSuccess={jest.fn()}
      />,
    )
    expect(container.querySelector('button')).toBeTruthy()
  })
})
