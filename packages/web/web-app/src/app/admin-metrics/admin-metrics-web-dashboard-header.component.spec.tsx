import { fireEvent } from '@testing-library/react'

import { renderWithProviders } from '../../../testing-render'
import { AdminMetricsDashboardHeaderComponent } from './admin-metrics-web-dashboard-header.component'

describe('AdminMetricsDashboardHeaderComponent', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(
      <AdminMetricsDashboardHeaderComponent onRefresh={jest.fn()} />,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should call onRefresh when refresh button is clicked', () => {
    const onRefresh = jest.fn()
    const { container } = renderWithProviders(
      <AdminMetricsDashboardHeaderComponent onRefresh={onRefresh} />,
    )
    const button = container.querySelector('button')
    if (button) {
      fireEvent.click(button)
      expect(onRefresh).toHaveBeenCalledTimes(1)
    }
  })
})
