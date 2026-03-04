import { render } from '@testing-library/react'

import { StatCard } from './admin-metrics-web-stat-card.component'

describe('StatCard', () => {
  it('should render without crashing', () => {
    const { baseElement } = render(
      <StatCard
        icon={<span>📊</span>}
        label="Total Signups"
        value={42}
      />,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render the value', () => {
    const { getByText } = render(
      <StatCard
        icon={<span>📊</span>}
        label="Total Signups"
        value={42}
      />,
    )
    expect(getByText('42')).toBeTruthy()
  })

  it('should render the label', () => {
    const { getByText } = render(
      <StatCard
        icon={<span>📊</span>}
        label="Daily Active Users"
        value={100}
      />,
    )
    expect(getByText('Daily Active Users')).toBeTruthy()
  })

  it('should render a loading state when loading=true', () => {
    const { container } = render(
      <StatCard
        icon={<span>📊</span>}
        label="Loading Metric"
        loading={true}
        value={0}
      />,
    )
    // CircularProgress should be rendered in loading state
    expect(container.querySelector('.MuiCircularProgress-root')).toBeTruthy()
  })

  it('should render string values', () => {
    const { getByText } = render(
      <StatCard
        icon={<span>📊</span>}
        label="Status"
        value="Active"
      />,
    )
    expect(getByText('Active')).toBeTruthy()
  })
})
