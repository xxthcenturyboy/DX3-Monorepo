import { createHash } from 'node:crypto'

// biome-ignore lint/suspicious/noExplicitAny: Any is the name of the function
export const dxHashAnyToString = (data: any): string => {
  const hash = createHash('sha1')
  return hash.update(JSON.stringify(data)).digest('base64')
}
