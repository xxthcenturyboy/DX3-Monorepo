import { renderWithProviders } from '../../../testing-render'
import { EmailList } from './email-web-list.component'

const mockEmails = [
  {
    default: true,
    email: 'test@example.com',
    id: 'e1',
    isDeleted: false,
    isVerified: true,
    label: '',
  },
  {
    default: false,
    email: 'other@example.com',
    id: 'e2',
    isDeleted: false,
    isVerified: false,
    label: '',
  },
]

describe('EmailList', () => {
  it('should render without crashing with no emails', () => {
    const { baseElement } = renderWithProviders(
      <EmailList
        emailDataCallback={jest.fn()}
        emailDeleteCallback={jest.fn()}
        emails={[]}
        userId="u1"
      />,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render with emails', () => {
    const { baseElement } = renderWithProviders(
      <EmailList
        emailDataCallback={jest.fn()}
        emailDeleteCallback={jest.fn()}
        emails={mockEmails}
        userId="u1"
      />,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should display email addresses', () => {
    const { getByText } = renderWithProviders(
      <EmailList
        emailDataCallback={jest.fn()}
        emailDeleteCallback={jest.fn()}
        emails={mockEmails}
        userId="u1"
      />,
    )
    expect(getByText('test@example.com')).toBeTruthy()
  })

  it('should render add email button', () => {
    const { container } = renderWithProviders(
      <EmailList
        emailDataCallback={jest.fn()}
        emailDeleteCallback={jest.fn()}
        emails={[]}
        userId="u1"
      />,
    )
    expect(container.querySelector('button')).toBeTruthy()
  })
})
