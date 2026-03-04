import { renderWithProviders } from '../../../testing-render'
import { DashboardHeaderComponent } from './dashboard-header.component'

describe('DashboardHeaderComponent', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(<DashboardHeaderComponent />)
    expect(baseElement).toBeTruthy()
  })

  it('should render a header element', () => {
    const { container } = renderWithProviders(<DashboardHeaderComponent />)
    expect(container.firstChild).toBeTruthy()
  })
})
