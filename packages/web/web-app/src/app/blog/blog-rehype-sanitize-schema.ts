import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'

/**
 * Extended schema that allows relative URLs for img src
 * (e.g. /api/media/pub/xxx) so images load when using same-origin proxy.
 */
export const blogRehypeSanitize = rehypeSanitize({
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    img: [
      ...(defaultSchema.attributes?.img ?? []),
      'alt',
      'height',
      'title',
      'width',
    ],
  },
  protocols: {
    ...defaultSchema.protocols,
    src: ['http', 'https', ''],
  },
})

/** rehype-raw must run before sanitize: parse HTML strings into nodes, then sanitize */
export const blogRehypePlugins = [rehypeRaw, blogRehypeSanitize]
