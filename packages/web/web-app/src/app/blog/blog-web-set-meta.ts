/**
 * Sets SEO meta tags for blog post pages. Call when post data is available.
 * Updates document title, meta description, and Open Graph tags.
 */
export type BlogPostMetaInputType = {
  canonicalUrl: string | null
  content: string
  excerpt: string | null
  seoDescription: string | null
  seoTitle: string | null
  slug: string
  title: string
}

const META_DESCRIPTION_MAX_LENGTH = 160

const getOrCreateMeta = (attrs: {
  content?: string
  name?: string
  property?: string
}): HTMLMetaElement => {
  const selector = attrs.name
    ? `meta[name="${attrs.name}"]`
    : attrs.property
      ? `meta[property="${attrs.property}"]`
      : null
  if (!selector) {
    const el = document.createElement('meta')
    if (attrs.name) el.setAttribute('name', attrs.name)
    if (attrs.property) el.setAttribute('property', attrs.property)
    if (attrs.content) el.setAttribute('content', attrs.content)
    document.head.appendChild(el)
    return el
  }
  let el = document.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    if (attrs.name) el.setAttribute('name', attrs.name)
    if (attrs.property) el.setAttribute('property', attrs.property)
    document.head.appendChild(el)
  }
  if (attrs.content !== undefined) el.setAttribute('content', attrs.content)
  return el
}

const stripHtmlAndTruncate = (text: string, maxLen: number): string => {
  const stripped = text
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (stripped.length <= maxLen) return stripped
  return `${stripped.slice(0, maxLen - 3)}...`
}

export const setBlogPostMeta = (input: BlogPostMetaInputType, baseUrl: string): void => {
  if (typeof document === 'undefined') return

  const description =
    input.seoDescription ||
    input.excerpt ||
    stripHtmlAndTruncate(input.content, META_DESCRIPTION_MAX_LENGTH) ||
    input.title
  const ogTitle = input.seoTitle ?? input.title
  const ogUrl = input.canonicalUrl ?? `${baseUrl.replace(/\/$/, '')}/blog/${input.slug}`

  getOrCreateMeta({ content: description, name: 'description' })
  getOrCreateMeta({ content: ogTitle, property: 'og:title' })
  getOrCreateMeta({ content: description, property: 'og:description' })
  getOrCreateMeta({ content: 'article', property: 'og:type' })
  getOrCreateMeta({ content: ogUrl, property: 'og:url' })
}
