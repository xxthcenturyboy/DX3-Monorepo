import Box from '@mui/material/Box'
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

/**
 * Parses title for alignment prefix: "align:center|rest" or "align:right|rest".
 * Returns { alignment, title } where title is the display value.
 */
function parseImageTitle(raw: string | undefined): {
  alignment: 'left' | 'center' | 'right'
  title: string
} {
  const alignMatch = raw?.match(/^align:(center|right)\|(.*)$/s)
  if (alignMatch) {
    return {
      alignment: alignMatch[1] as 'center' | 'right',
      title: alignMatch[2] ?? '',
    }
  }
  return { alignment: 'left', title: raw ?? '' }
}

/**
 * Custom img component: parses title for alignment (align:center| or align:right|),
 * applies wrapper for center/right. Images scale to viewport via parent CSS.
 */
const BlogMarkdownImg: Components['img'] = ({ src, alt, title, ...props }) => {
  const { alignment, title: displayTitle } = parseImageTitle(title)

  const imgEl = (
    <img
      {...props}
      alt={alt ?? ''}
      loading="lazy"
      src={src ?? ''}
      title={displayTitle || undefined}
    />
  )

  if (alignment === 'center') {
    return (
      <Box component="figure" sx={{ margin: 0, textAlign: 'center' }}>
        {imgEl}
      </Box>
    )
  }
  if (alignment === 'right') {
    return (
      <Box component="figure" sx={{ margin: 0, textAlign: 'right' }}>
        {imgEl}
      </Box>
    )
  }
  return imgEl
}

export const blogMarkdownComponents: Components = {
  a: BlogMarkdownLink,
  img: BlogMarkdownImg,
}
