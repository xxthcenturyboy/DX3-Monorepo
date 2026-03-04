import { render } from '@testing-library/react'

import { UploadProgressComponent } from './media-web-upload-progress.component'

describe('UploadProgressComponent', () => {
  it('should render without crashing', () => {
    const { baseElement } = render(<UploadProgressComponent value={0} />)
    expect(baseElement).toBeTruthy()
  })

  it('should display the progress percentage', () => {
    const { getByText } = render(<UploadProgressComponent value={42} />)
    expect(getByText('42%')).toBeTruthy()
  })

  it('should round decimal values', () => {
    const { getByText } = render(<UploadProgressComponent value={42.7} />)
    expect(getByText('43%')).toBeTruthy()
  })

  it('should render at 0%', () => {
    const { getByText } = render(<UploadProgressComponent value={0} />)
    expect(getByText('0%')).toBeTruthy()
  })

  it('should render at 100%', () => {
    const { getByText } = render(<UploadProgressComponent value={100} />)
    expect(getByText('100%')).toBeTruthy()
  })

  it('should render the LinearProgress component', () => {
    const { container } = render(<UploadProgressComponent value={50} />)
    expect(container.querySelector('.MuiLinearProgress-root')).toBeTruthy()
  })
})
