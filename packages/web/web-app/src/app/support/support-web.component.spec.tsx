import { renderWithProviders } from '../../../testing-render'
import { SupportComponent } from './support-web.component'

describe('SupportComponent', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(<SupportComponent />)
    expect(baseElement).toBeTruthy()
  })

  it('should render the support content', () => {
    const { container } = renderWithProviders(<SupportComponent />)
    expect(container.firstChild).toBeTruthy()
  })
})
