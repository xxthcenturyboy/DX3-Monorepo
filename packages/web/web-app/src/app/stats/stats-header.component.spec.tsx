import { fireEvent } from '@testing-library/react'

import { renderWithProviders } from '../../../testing-render'
import { StatsHeaderComponent } from './stats-header.component'

describe('StatsHeaderComponent', () => {
  it('should render without crashing', () => {
    const fetchApiStats = jest.fn().mockReturnValue(Promise.resolve())
    const { baseElement } = renderWithProviders(
      <StatsHeaderComponent fetchApiStats={fetchApiStats} />,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should call fetchApiStats when refresh icon button is clicked', () => {
    const fetchApiStats = jest.fn().mockReturnValue(Promise.resolve())
    const { container } = renderWithProviders(
      <StatsHeaderComponent fetchApiStats={fetchApiStats} />,
    )
    const button = container.querySelector('button')
    if (button) {
      fireEvent.click(button)
      expect(fetchApiStats).toHaveBeenCalledTimes(1)
    }
  })
})
