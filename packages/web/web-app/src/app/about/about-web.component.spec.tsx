jest.mock('../store', () => ({
  store: { getState: jest.fn().mockReturnValue({ i18n: { translations: {} } }) },
}))

jest.mock('../config/config-web.service', () => ({
  WebConfigService: {
    getWebRoutes: jest.fn().mockReturnValue({ FAQ: '/faq' }),
    getWebUrls: jest.fn().mockReturnValue({ API_URL: 'http://localhost:4000' }),
  },
}))

import { renderWithProviders } from '../../../testing-render'
import { AboutComponent } from './about-web.component'

describe('AboutComponent', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(<AboutComponent />)
    expect(baseElement).toBeTruthy()
  })

  it('should render section content', () => {
    const { container } = renderWithProviders(<AboutComponent />)
    expect(container.firstChild).toBeTruthy()
  })
})
