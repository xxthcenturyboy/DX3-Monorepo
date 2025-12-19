import { BrowserRouter } from 'react-router'

import { APP_NAME } from '@dx3/models-shared'

import { renderWithProviders } from '../../testing-render'
import { Root } from './root-web.component'

jest.mock('./data/rtk-query')

describe('Root', () => {
  it('should render successfully', () => {
    // Arrange
    // Act
    const { baseElement, getByText } = renderWithProviders(
      <BrowserRouter>
        <Root />
      </BrowserRouter>,
    )
    // Assert
    expect(baseElement).toBeTruthy()
    expect(getByText(APP_NAME)).toBeTruthy()
    expect(getByText('Login')).toBeTruthy()
  })
})
