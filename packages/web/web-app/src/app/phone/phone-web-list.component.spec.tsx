import { renderWithProviders } from '../../../testing-render'
import { Phonelist } from './phone-web-list.component'

const mockPhones = [
  { countryCode: '+1', default: true, id: 'p1', isDeleted: false, isSent: false, isVerified: true, label: '', phone: '+1234567890' },
  { countryCode: '+1', default: false, id: 'p2', isDeleted: false, isSent: false, isVerified: false, label: '', phone: '+0987654321' },
]

describe('Phonelist', () => {
  it('should render without crashing with no phones', () => {
    const { baseElement } = renderWithProviders(
      <Phonelist
        phoneDataCallback={jest.fn()}
        phoneDeleteCallback={jest.fn()}
        phones={[]}
        userId="u1"
      />,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render with phones', () => {
    const { baseElement } = renderWithProviders(
      <Phonelist
        phoneDataCallback={jest.fn()}
        phoneDeleteCallback={jest.fn()}
        phones={mockPhones}
        userId="u1"
      />,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should display phone numbers', () => {
    const { getByText } = renderWithProviders(
      <Phonelist
        phoneDataCallback={jest.fn()}
        phoneDeleteCallback={jest.fn()}
        phones={mockPhones}
        userId="u1"
      />,
    )
    expect(getByText('+1234567890')).toBeTruthy()
  })

  it('should render add phone button', () => {
    const { container } = renderWithProviders(
      <Phonelist
        phoneDataCallback={jest.fn()}
        phoneDeleteCallback={jest.fn()}
        phones={[]}
        userId="u1"
      />,
    )
    expect(container.querySelector('button')).toBeTruthy()
  })
})
