import { render } from '@testing-library/react'

import { blogMarkdownComponents } from './blog-markdown-components'

jest.mock('./blog-image-with-placeholder.component', () => ({
  BlogImageWithPlaceholder: ({ alt, src }: { alt: string; src: string }) => (
    <img
      alt={alt}
      data-testid="blog-image"
      src={src}
    />
  ),
}))

jest.mock('../config/config-web.service', () => ({
  WebConfigService: {
    getWebUrls: jest.fn().mockReturnValue({ API_URL: 'http://localhost:4000' }),
  },
}))

describe('blogMarkdownComponents', () => {
  describe('exports', () => {
    it('should export custom a and img components', () => {
      expect(blogMarkdownComponents.a).toBeDefined()
      expect(blogMarkdownComponents.img).toBeDefined()
    })
  })

  describe('BlogMarkdownLink (a)', () => {
    const LinkComponent = blogMarkdownComponents.a as React.ComponentType<
      React.AnchorHTMLAttributes<HTMLAnchorElement>
    >

    it('should render a plain relative link without target', () => {
      const { getByRole } = render(
        <LinkComponent href="/about">About</LinkComponent>,
      )
      const link = getByRole('link')
      expect(link).toBeTruthy()
      expect(link.getAttribute('target')).toBeNull()
    })

    it('should render external links with target="_blank"', () => {
      const { getByRole } = render(
        <LinkComponent href="https://example.com">External</LinkComponent>,
      )
      const link = getByRole('link')
      expect(link.getAttribute('target')).toBe('_blank')
      expect(link.getAttribute('rel')).toContain('noopener')
    })

    it('should resolve /api/ hrefs to absolute URL', () => {
      const { getByRole } = render(
        <LinkComponent href="/api/media/pub/123/ORIGINAL">Download</LinkComponent>,
      )
      const link = getByRole('link')
      expect(link.getAttribute('href')).toBe(
        'http://localhost:4000/api/media/pub/123/ORIGINAL',
      )
    })

    it('should render PDF links with target="_blank"', () => {
      const { getByRole } = render(
        <LinkComponent href="http://example.com/doc.pdf">PDF</LinkComponent>,
      )
      const link = getByRole('link')
      expect(link.getAttribute('target')).toBe('_blank')
    })

    it('should pass through mailto links unchanged', () => {
      const { getByRole } = render(
        <LinkComponent href="mailto:test@example.com">Email</LinkComponent>,
      )
      const link = getByRole('link')
      expect(link.getAttribute('href')).toBe('mailto:test@example.com')
    })
  })

  describe('BlogMarkdownImg (img)', () => {
    const ImgComponent = blogMarkdownComponents.img as React.ComponentType<
      React.ImgHTMLAttributes<HTMLImageElement>
    >

    it('should render image without alignment wrapper by default', () => {
      const { getByTestId, queryByRole } = render(
        <ImgComponent
          alt="test"
          src="http://example.com/img.jpg"
        />,
      )
      expect(getByTestId('blog-image')).toBeTruthy()
      expect(queryByRole('figure')).toBeNull()
    })

    it('should wrap image in center-aligned figure when title has align:center prefix', () => {
      const { container } = render(
        <ImgComponent
          alt="test"
          src="http://example.com/img.jpg"
          title="align:center|My Caption"
        />,
      )
      const figure = container.querySelector('figure')
      // MUI sx prop applies textAlign via generated CSS classes, not inline style
      expect(figure).toBeTruthy()
    })

    it('should wrap image in right-aligned figure when title has align:right prefix', () => {
      const { container } = render(
        <ImgComponent
          alt="test"
          src="http://example.com/img.jpg"
          title="align:right|Caption"
        />,
      )
      const figure = container.querySelector('figure')
      expect(figure).toBeTruthy()
    })

    it('should render without title', () => {
      const { getByTestId } = render(
        <ImgComponent
          alt="no title"
          src="http://example.com/img.jpg"
        />,
      )
      expect(getByTestId('blog-image')).toBeTruthy()
    })
  })
})
