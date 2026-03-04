/**
 * Jest setup for packages/web/web-app/ tests.
 *
 * Shared browser stubs (matchMedia, fetch, canvas, console.error suppression)
 * are pulled in from the parent package's jest.setup.browser.ts so any future
 * stub only needs to be added in one place.
 */

// Polyfill TextEncoder/TextDecoder for React Router v7 compatibility.
import { TextDecoder, TextEncoder } from 'node:util'

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as typeof global.TextDecoder


// Polyfill DOMRect for jsdom (used by MUI Popper/BlogLinkEditDialog).
if (typeof global.DOMRect === 'undefined') {
  global.DOMRect = class DOMRect {
    x: number
    y: number
    width: number
    height: number
    top: number
    right: number
    bottom: number
    left: number

    constructor(x = 0, y = 0, width = 0, height = 0) {
      this.x = x
      this.y = y
      this.width = width
      this.height = height
      this.top = y
      this.right = x + width
      this.bottom = y + height
      this.left = x
    }

    static fromRect(other?: DOMRectInit) {
      return new (global.DOMRect as typeof DOMRect)(
        other?.x ?? 0,
        other?.y ?? 0,
        other?.width ?? 0,
        other?.height ?? 0,
      )
    }
  } as unknown as typeof DOMRect
}

// Note: lottie-react mock is centralised in packages/web/__mocks__/lottie-react.tsx
// and mapped via moduleNameMapper in jest.config.ts.
import '../jest.setup.browser'

// Ensure modal-root exists for components that render dialogs/portals (MUI Modal, createPortal).
beforeEach(() => {
  if (typeof document !== 'undefined' && !document.getElementById('modal-root')) {
    const div = document.createElement('div')
    div.id = 'modal-root'
    document.body.appendChild(div)
  }
})
