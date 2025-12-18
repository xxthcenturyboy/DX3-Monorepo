import { renderWithProviders } from '../../../testing-render'
import { ShortlinkComponent } from './shortlink-web.component'

jest.mock('../store')

const mockUseNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockUseNavigate,
}))

describe('ShortlinkComponent', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<ShortlinkComponent />)
    expect(baseElement).toBeTruthy()
  })
})
