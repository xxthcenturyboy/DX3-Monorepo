import Box from '@mui/material/Box'
import type { Components } from 'react-markdown'

import { WebConfigService } from '../config/config-web.service'

import { BlogImageWithPlaceholder } from './blog-image-with-placeholder.component'

/**
 * Resolves relative /api/ URLs to absolute so they work in SSR (no same-origin proxy).
 * Links go directly to API; target="_blank" ensures Content-Disposition triggers download.
 */
const resolveHref = (href: string | undefined): string | undefined => {
  if (!href) return href
  if (href.startsWith('http') || href.startsWith('//') || href.startsWith('mailto:')) {
    return href
  }
  if (href.startsWith('/api/')) {
    const apiBase = WebConfigService.getWebUrls().API_URL?.replace(/\/$/, '')
    return apiBase ? `${apiBase}${href}` : href
  }
  return href
}

/**
 * Custom link component: PDF/media links use absolute API URL + target="_blank"
 * so Content-Disposition triggers download (avoids proxy returning HTML).
 */
const BlogMarkdownLink: Components['a'] = ({ href, ...props }) => {
  const resolvedHref = resolveHref(href)
  const isMediaOrPdf =
    resolvedHref?.toLowerCase().endsWith('.pdf') ||
    (typeof resolvedHref === 'string' && /\/api\/media\/pub\/[^/]+\/ORIGINAL/.test(resolvedHref))

  return (
    <a
      {...props}
      href={resolvedHref}
      rel={resolvedHref?.startsWith('http') ? 'noopener noreferrer' : undefined}
      target={isMediaOrPdf || resolvedHref?.startsWith('http') ? '_blank' : undefined}
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
  const alignMatch = raw?.match(/^align:(center|right)\|([\s\S]*)$/)
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
 * applies wrapper for center/right. Uses BlogImageWithPlaceholder for loading state.
 */
const BlogMarkdownImg: Components['img'] = ({ alt, height, src, title, width }) => {
  const { alignment, title: displayTitle } = parseImageTitle(title)

  const imgEl = (
    <BlogImageWithPlaceholder
      alt={alt ?? ''}
      height={height}
      src={src ?? ''}
      title={displayTitle || undefined}
      width={width}
    />
  )

  if (alignment === 'center') {
    return (
      <Box
        component="figure"
        sx={{ margin: 0, textAlign: 'center' }}
      >
        {imgEl}
      </Box>
    )
  }
  if (alignment === 'right') {
    return (
      <Box
        component="figure"
        sx={{ margin: 0, textAlign: 'right' }}
      >
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
