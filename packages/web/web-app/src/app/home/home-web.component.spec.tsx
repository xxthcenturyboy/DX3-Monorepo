import { MemoryRouter } from 'react-router'

import { APP_DESCRIPTION, APP_NAME } from '@dx3/models-shared'

import { renderWithProviders } from '../../../testing-render'
import { HomeComponent } from './home-web.component'

jest.mock('../store')

const mockUseNavigate = jest.fn()
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: () => mockUseNavigate,
}))

describe('HomeComponent', () => {
  it('should render successfully', () => {
    const { baseElement, getByText } = renderWithProviders(
      <MemoryRouter>
        <HomeComponent />
      </MemoryRouter>,
    )
    expect(baseElement).toBeTruthy()
    expect(getByText(APP_DESCRIPTION)).toBeTruthy()
    expect(getByText(APP_NAME)).toBeTruthy()
  })
})
