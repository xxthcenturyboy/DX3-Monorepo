import { renderWithProviders } from '../../../testing-render'
import { ShortlinkComponent } from './shortlink-web.component'

jest.mock('../store')

const mockUseNavigate = jest.fn()
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: () => mockUseNavigate,
}))

describe('ShortlinkComponent', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<ShortlinkComponent />)
    expect(baseElement).toBeTruthy()
  })
})
