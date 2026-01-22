import createCache from '@emotion/cache'

/**
 * Creates an Emotion cache instance for CSS-in-JS styling.
 * This factory is used on both server and client to ensure consistent styling.
 *
 * Server-side:
 * - Create a new cache per request to avoid cross-request pollution
 * - Extract critical CSS using @emotion/server
 *
 * Client-side:
 * - Create cache once and reuse for hydration
 * - Must use same cache key as server for proper hydration
 *
 * @returns Emotion cache instance
 */
export const createEmotionCache = () => {
  return createCache({ key: 'css' })
}
