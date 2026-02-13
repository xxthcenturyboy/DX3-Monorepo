import type { Components } from 'react-markdown'

/**
 * Custom link component: adds download attribute for PDF links
 * so the file downloads instead of opening in-browser.
 */
const BlogMarkdownLink: Components['a'] = ({ href, ...props }) => {
  const isPdf =
    href?.toLowerCase().endsWith('.pdf') ||
    (typeof href === 'string' && /\/api\/media\/pub\/[^/]+\/ORIGINAL/.test(href))

  return (
    <a
      {...props}
      download={isPdf}
      href={href}
      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      target={href?.startsWith('http') ? '_blank' : undefined}
    />
  )
}

export const blogMarkdownComponents: Components = {
  a: BlogMarkdownLink,
}
