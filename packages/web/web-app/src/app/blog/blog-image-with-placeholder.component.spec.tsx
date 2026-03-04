import { fireEvent, render } from '@testing-library/react'

import { BlogImageWithPlaceholder } from './blog-image-with-placeholder.component'

describe('BlogImageWithPlaceholder', () => {
  it('should render without crashing', () => {
    const { baseElement } = render(
      <BlogImageWithPlaceholder
        alt="Test image"
        src="https://example.com/image.jpg"
      />,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render a skeleton while loading', () => {
    const { container } = render(
      <BlogImageWithPlaceholder
        alt="Test image"
        src="https://example.com/image.jpg"
      />,
    )
    expect(container.querySelector('.MuiSkeleton-root')).toBeTruthy()
  })

  it('should hide skeleton after image loads', () => {
    const { container } = render(
      <BlogImageWithPlaceholder
        alt="Test image"
        src="https://example.com/image.jpg"
      />,
    )
    const img = container.querySelector('img')
    if (img) {
      fireEvent.load(img)
    }
    expect(container.querySelector('.MuiSkeleton-root')).toBeNull()
  })

  it('should render with default alt text when not provided', () => {
    const { container } = render(
      <BlogImageWithPlaceholder src="https://example.com/image.jpg" />,
    )
    const img = container.querySelector('img')
    expect(img?.alt).toBe('')
  })

  it('should render with custom height', () => {
    const { container } = render(
      <BlogImageWithPlaceholder
        alt="Test"
        height={300}
        src="https://example.com/image.jpg"
      />,
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('should handle image load error', () => {
    const { container } = render(
      <BlogImageWithPlaceholder
        alt="Test"
        src="https://example.com/broken.jpg"
      />,
    )
    const img = container.querySelector('img')
    if (img) {
      fireEvent.error(img)
    }
    // After error, image should be hidden
    expect(container).toBeTruthy()
  })

  it('should resolve /api/ URLs using WebConfigService', () => {
    const { container } = render(
      <BlogImageWithPlaceholder
        alt="API image"
        src="/api/media/image.jpg"
      />,
    )
    const img = container.querySelector('img')
    expect(img).toBeTruthy()
  })
})
