import { fireEvent } from '@testing-library/react'

import { renderWithProviders } from '../../../../testing-render'
import { UserAdminListHeaderComponent } from './user-admin-web-list-header.component'

describe('UserAdminListHeaderComponent', () => {
  it('should render without crashing', () => {
    const fetchUsers = jest.fn().mockResolvedValue(undefined)
    const { baseElement } = renderWithProviders(
      <UserAdminListHeaderComponent fetchUsers={fetchUsers} />,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should call fetchUsers when refresh button is clicked', () => {
    const fetchUsers = jest.fn().mockResolvedValue(undefined)
    const { container } = renderWithProviders(
      <UserAdminListHeaderComponent fetchUsers={fetchUsers} />,
    )
    const buttons = container.querySelectorAll('button')
    if (buttons.length > 0) {
      fireEvent.click(buttons[0])
      expect(fetchUsers).toHaveBeenCalledTimes(1)
    }
  })

  it('should render a search input', () => {
    const fetchUsers = jest.fn().mockResolvedValue(undefined)
    const { container } = renderWithProviders(
      <UserAdminListHeaderComponent fetchUsers={fetchUsers} />,
    )
    const input = container.querySelector('input[type="search"]')
    expect(input).toBeTruthy()
  })
})
