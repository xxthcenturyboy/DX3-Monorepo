jest.mock('./notification-web.api', () => ({
  useMarkAsDismissedMutation: () => [
    jest.fn().mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) }),
    { error: undefined, isLoading: false, isUninitialized: true },
  ],
}))

import { NOTIFICATION_LEVELS } from '@dx3/models-shared'

import { renderWithProviders } from '../../../testing-render'
import { NotificationComponent } from './notification-web.component'

const baseNotification = {
  createdAt: new Date('2024-01-01'),
  id: 'n1',
  level: NOTIFICATION_LEVELS.INFO,
  message: 'Test notification message',
  title: 'Test Title',
  userId: 'user-1',
  viewed: false,
}

describe('NotificationComponent', () => {
  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(
      <NotificationComponent notification={baseNotification} />,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should display notification title', () => {
    const { getByText } = renderWithProviders(
      <NotificationComponent notification={baseNotification} />,
    )
    expect(getByText('Test Title')).toBeTruthy()
  })

  it('should display notification message', () => {
    const { getByText } = renderWithProviders(
      <NotificationComponent notification={baseNotification} />,
    )
    expect(getByText('Test notification message')).toBeTruthy()
  })

  it('should truncate long messages', () => {
    const longMessage = 'A'.repeat(200)
    const { queryByText } = renderWithProviders(
      <NotificationComponent notification={{ ...baseNotification, message: longMessage }} />,
    )
    expect(queryByText(longMessage)).toBeNull()
  })

  it('should render with DANGER level', () => {
    const { baseElement } = renderWithProviders(
      <NotificationComponent notification={{ ...baseNotification, level: NOTIFICATION_LEVELS.DANGER }} />,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render with WARNING level', () => {
    const { baseElement } = renderWithProviders(
      <NotificationComponent notification={{ ...baseNotification, level: NOTIFICATION_LEVELS.WARNING }} />,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render with SUCCESS level', () => {
    const { baseElement } = renderWithProviders(
      <NotificationComponent notification={{ ...baseNotification, level: NOTIFICATION_LEVELS.SUCCESS }} />,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render with PRIMARY level', () => {
    const { baseElement } = renderWithProviders(
      <NotificationComponent notification={{ ...baseNotification, level: NOTIFICATION_LEVELS.PRIMARY }} />,
    )
    expect(baseElement).toBeTruthy()
  })
})
