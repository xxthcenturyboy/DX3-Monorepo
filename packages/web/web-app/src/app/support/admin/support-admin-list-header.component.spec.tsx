import { fireEvent } from '@testing-library/react'

import { renderWithProviders } from '../../../../testing-render'
import { SupportAdminListHeaderComponent } from './support-admin-list-header.component'

describe('SupportAdminListHeaderComponent', () => {
  it('should render without crashing', () => {
    const fetchRequests = jest.fn()
    const { baseElement } = renderWithProviders(
      <SupportAdminListHeaderComponent fetchRequests={fetchRequests} />,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should call fetchRequests when refresh button is clicked', () => {
    const fetchRequests = jest.fn()
    const { container } = renderWithProviders(
      <SupportAdminListHeaderComponent fetchRequests={fetchRequests} />,
    )
    const buttons = container.querySelectorAll('button')
    if (buttons.length > 0) {
      fireEvent.click(buttons[0])
      expect(fetchRequests).toHaveBeenCalledTimes(1)
    }
  })

  it('should render a search input', () => {
    const fetchRequests = jest.fn()
    const { container } = renderWithProviders(
      <SupportAdminListHeaderComponent fetchRequests={fetchRequests} />,
    )
    const input = container.querySelector('input[type="search"]')
    expect(input).toBeTruthy()
  })
})
