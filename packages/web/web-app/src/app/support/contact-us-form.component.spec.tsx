jest.mock('./support-web.api', () => ({
  useCreateSupportRequestMutation: () => [
    jest.fn().mockReturnValue({ unwrap: jest.fn().mockResolvedValue({ id: '1' }) }),
    { error: undefined, isLoading: false },
  ],
}))

import { renderWithProviders } from '../../../testing-render'
import { ContactUsFormComponent } from './contact-us-form.component'

describe('ContactUsFormComponent', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(<ContactUsFormComponent />)
    expect(baseElement).toBeTruthy()
  })

  it('should render a submit button', () => {
    const { container } = renderWithProviders(<ContactUsFormComponent />)
    const buttons = container.querySelectorAll('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('should render form fields', () => {
    const { container } = renderWithProviders(<ContactUsFormComponent />)
    const inputs = container.querySelectorAll('input, textarea')
    expect(inputs.length).toBeGreaterThan(0)
  })
})
