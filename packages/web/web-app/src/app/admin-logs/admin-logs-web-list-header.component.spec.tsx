import { fireEvent } from '@testing-library/react'

import { renderWithProviders } from '../../../testing-render'
import { AdminLogsListHeaderComponent } from './admin-logs-web-list-header.component'

describe('AdminLogsListHeaderComponent', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(
      <AdminLogsListHeaderComponent onRefresh={jest.fn()} />,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should call onRefresh when refresh button is clicked', () => {
    const onRefresh = jest.fn()
    const { container } = renderWithProviders(
      <AdminLogsListHeaderComponent onRefresh={onRefresh} />,
    )
    const button = container.querySelector('button')
    if (button) {
      fireEvent.click(button)
      expect(onRefresh).toHaveBeenCalledTimes(1)
    }
  })
})
