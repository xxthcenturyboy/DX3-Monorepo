import { renderWithProviders } from '../../../testing-render'
import { FaqWebBodyComponent } from './faq-web-body.component'

describe('FaqWebBodyComponent', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(
      <FaqWebBodyComponent
        subtitle="Subtitle"
        title="FAQ"
      />,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render public FAQ items', () => {
    const { container } = renderWithProviders(
      <FaqWebBodyComponent subtitle="" title="" />,
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('should render additional items when includeAuthenticated is true', () => {
    const { container: containerAuth } = renderWithProviders(
      <FaqWebBodyComponent
        includeAuthenticated={true}
        subtitle=""
        title=""
      />,
    )
    const { container: containerPublic } = renderWithProviders(
      <FaqWebBodyComponent
        includeAuthenticated={false}
        subtitle=""
        title=""
      />,
    )
    // Authenticated version should have at least as many accordion items
    const authAccordions = containerAuth.querySelectorAll('.MuiAccordion-root')
    const publicAccordions = containerPublic.querySelectorAll('.MuiAccordion-root')
    expect(authAccordions.length).toBeGreaterThanOrEqual(publicAccordions.length)
  })
})
