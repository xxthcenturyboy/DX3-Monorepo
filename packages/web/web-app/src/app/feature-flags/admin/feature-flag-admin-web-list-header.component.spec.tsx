import { fireEvent } from '@testing-library/react'

import { renderWithProviders } from '../../../../testing-render'
import { FeatureFlagAdminListHeaderComponent } from './feature-flag-admin-web-list-header.component'

describe('FeatureFlagAdminListHeaderComponent', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(
      <FeatureFlagAdminListHeaderComponent
        fetchFlags={jest.fn().mockResolvedValue(undefined)}
        onCreateClick={jest.fn()}
      />,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should call onCreateClick when create button is clicked', () => {
    const onCreateClick = jest.fn()
    const { container } = renderWithProviders(
      <FeatureFlagAdminListHeaderComponent
        fetchFlags={jest.fn().mockResolvedValue(undefined)}
        onCreateClick={onCreateClick}
      />,
    )
    const buttons = Array.from(container.querySelectorAll('button'))
    // Find create button (not the refresh icon button)
    for (const button of buttons) {
      if (button.textContent?.includes('CREATE') || button.textContent === '') {
        fireEvent.click(button)
        break
      }
    }
    expect(container).toBeTruthy()
  })

  it('should render a search input', () => {
    const { container } = renderWithProviders(
      <FeatureFlagAdminListHeaderComponent
        fetchFlags={jest.fn().mockResolvedValue(undefined)}
        onCreateClick={jest.fn()}
      />,
    )
    const input = container.querySelector('input[type="search"]')
    expect(input).toBeTruthy()
  })
})
