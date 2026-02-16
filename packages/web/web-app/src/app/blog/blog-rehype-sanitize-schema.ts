import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'

/**
 * Extended schema that allows:
 * - Relative URLs for img src (e.g. /api/media/pub/xxx)
 * - remark-align output: div with class for alignment (align-left, align-center, align-right)
 * - p align for backward compatibility with existing <p align="..."> content
 */
export const blogRehypeSanitize = rehypeSanitize({
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    div: [
      ...(defaultSchema.attributes?.div ?? []),
      'className',
      'class',
    ],
    img: [
      ...(defaultSchema.attributes?.img ?? []),
      'alt',
      'height',
      'title',
      'width',
    ],
    p: [...(defaultSchema.attributes?.p ?? []), 'align'],
  },
  protocols: {
    ...defaultSchema.protocols,
    src: ['http', 'https', ''],
  },
})

/** rehype-raw must run before sanitize: parse HTML strings into nodes, then sanitize */
export const blogRehypePlugins = [rehypeRaw, blogRehypeSanitize]
