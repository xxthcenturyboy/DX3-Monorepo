import { renderWithProviders } from '../../../testing-render'
import { FaqComponent } from './faq-web.component'

describe('FaqComponent', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(<FaqComponent />)
    expect(baseElement).toBeTruthy()
  })

  it('should render the FAQ content', () => {
    const { container } = renderWithProviders(<FaqComponent />)
    expect(container.firstChild).toBeTruthy()
  })
})
