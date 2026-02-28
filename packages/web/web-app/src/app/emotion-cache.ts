import createCache from '@emotion/cache'

const EMOTION_CONTAINER_ID = 'emotion-insertion-point'

/**
 * Creates an Emotion cache instance for CSS-in-JS styling.
 * This factory is used on both server and client to ensure consistent styling.
 *
 * Server-side:
 * - Create a new cache per request to avoid cross-request pollution
 * - Extract critical CSS using @emotion/server
 *
 * Client-side:
 * - Uses container to avoid "insertBefore" DOM errors (MUI/Emotion issue)
 * - Creates container div if missing (e.g. index.html from different build)
 *
 * @returns Emotion cache instance
 */
export const createEmotionCache = () => {
  let container: HTMLElement | undefined

  if (typeof document !== 'undefined') {
    container = document.getElementById(EMOTION_CONTAINER_ID) ?? undefined
    if (!container) {
      container = document.createElement('div')
      container.id = EMOTION_CONTAINER_ID
      document.body.insertBefore(container, document.body.firstChild)
    }
  }

  return createCache({
    container: container ?? undefined,
    key: 'css',
  })
}
