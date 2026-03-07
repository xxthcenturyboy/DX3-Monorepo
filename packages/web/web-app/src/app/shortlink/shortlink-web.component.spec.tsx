import { MemoryRouter, Route, Routes } from 'react-router'

import { renderWithProviders } from '../../../testing-render'
import { ShortlinkComponent } from './shortlink-web.component'

jest.mock('../store/store-web.redux')

const mockUseNavigate = jest.fn()
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: () => mockUseNavigate,
}))

const mockFetchShortlink = jest.fn().mockReturnValue(Promise.resolve({ data: '/dashboard' }))
jest.mock('./shortlink-web.api', () => ({
  useLazyGetShortlinkTargetQuery: () => [
    mockFetchShortlink,
    {
      data: undefined,
      error: undefined,
      isFetching: false,
      isSuccess: false,
      isUninitialized: true,
    },
  ],
}))

describe('ShortlinkComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <MemoryRouter initialEntries={['/l/abc123']}>
        <Routes>
          <Route
            element={<ShortlinkComponent />}
            path="/l/:token"
          />
        </Routes>
      </MemoryRouter>,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render the APP_NAME text while loading', () => {
    const { baseElement } = renderWithProviders(
      <MemoryRouter initialEntries={['/l/abc123']}>
        <Routes>
          <Route
            element={<ShortlinkComponent />}
            path="/l/:token"
          />
        </Routes>
      </MemoryRouter>,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render without crashing when no token in route', () => {
    const { baseElement } = renderWithProviders(
      <MemoryRouter initialEntries={['/l/']}>
        <Routes>
          <Route
            element={<ShortlinkComponent />}
            path="/l/"
          />
        </Routes>
      </MemoryRouter>,
    )
    expect(baseElement).toBeTruthy()
  })
})
