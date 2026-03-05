/**
 * Shared browser-environment Jest setup.
 *
 * Imported by every jsdom-targeted setup file in this package:
 *   - packages/web/jest.setup.ts        (libs/ tests)
 *   - packages/web/web-app/jest.setup.ts (web-app tests)
 *
 * Add any stub here that must exist in ALL jsdom Jest workers under packages/web.
 */

// react-router v7 uses TextEncoder/TextDecoder at module-load time via
// @remix-run/router. jsdom does not polyfill these globals, so they must be
// injected before any test file imports react-router.
import { TextDecoder, TextEncoder } from 'util'
Object.defineProperty(globalThis, 'TextDecoder', { value: TextDecoder, writable: true })
Object.defineProperty(globalThis, 'TextEncoder', { value: TextEncoder, writable: true })

// jsdom does not implement DOMRect. Components that delegate getBoundingClientRect
// to Popper.js (e.g. MUI Tooltip, Popover, rich-text link dialogs) call new DOMRect()
// during passive-effect commit. This lightweight polyfill satisfies those call sites.
class DOMRectPolyfill implements DOMRect {
  readonly bottom: number
  readonly height: number
  readonly left: number
  readonly right: number
  readonly top: number
  readonly width: number
  readonly x: number
  readonly y: number

  constructor(x = 0, y = 0, width = 0, height = 0) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.top = y
    this.left = x
    this.bottom = y + height
    this.right = x + width
  }

  static fromRect(other?: DOMRectInit): DOMRectPolyfill {
    return new DOMRectPolyfill(other?.x, other?.y, other?.width, other?.height)
  }

  toJSON() {
    const { bottom, height, left, right, top, width, x, y } = this
    return { bottom, height, left, right, top, width, x, y }
  }
}

if (typeof globalThis.DOMRect === 'undefined') {
  globalThis.DOMRect = DOMRectPolyfill as unknown as typeof DOMRect
}

import '@testing-library/jest-dom'
import { setGlobalDevModeChecks } from 'reselect'

// Components that render modals via createPortal target document.getElementById('modal-root').
// jsdom starts with an empty document, so the element must be created before each test file runs.
// Using beforeEach ensures it survives any afterEach cleanup that empties document.body.
beforeEach(() => {
  if (!document.getElementById('modal-root')) {
    const modalRoot = document.createElement('div')
    modalRoot.id = 'modal-root'
    document.body.appendChild(modalRoot)
  }
})

// Standard jsdom stub for window.matchMedia.
// MUI's useMediaQuery relies on this; without it the hook throws in tests.
// All queries default to non-matching (false) — equivalent to a desktop viewport.
Object.defineProperty(window, 'matchMedia', {
  value: jest.fn().mockImplementation((query: string) => ({
    addEventListener: jest.fn(),
    addListener: jest.fn(),
    dispatchEvent: jest.fn(),
    matches: false,
    media: query,
    onchange: null,
    removeEventListener: jest.fn(),
    removeListener: jest.fn(),
  })),
  writable: true,
})

// Mock HTMLCanvasElement.getContext to prevent canvas-related errors in jsdom.
const mockGetContext = jest.fn(() => ({
  arc: jest.fn(),
  beginPath: jest.fn(),
  clearRect: jest.fn(),
  clip: jest.fn(),
  closePath: jest.fn(),
  createImageData: jest.fn(() => ({})),
  drawImage: jest.fn(),
  fill: jest.fn(),
  fillRect: jest.fn(),
  fillStyle: '',
  getImageData: jest.fn(() => ({ data: [] })),
  lineTo: jest.fn(),
  measureText: jest.fn(() => ({ width: 0 })),
  moveTo: jest.fn(),
  putImageData: jest.fn(),
  rect: jest.fn(),
  restore: jest.fn(),
  rotate: jest.fn(),
  save: jest.fn(),
  scale: jest.fn(),
  setTransform: jest.fn(),
  stroke: jest.fn(),
  transform: jest.fn(),
  translate: jest.fn(),
}))

HTMLCanvasElement.prototype.getContext =
  mockGetContext as unknown as typeof HTMLCanvasElement.prototype.getContext

// Mock global fetch API (jsdom does not include it by default).
global.fetch = jest.fn(() =>
  Promise.resolve({
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    blob: () => Promise.resolve(new Blob()),
    headers: new Headers(),
    json: () => Promise.resolve({}),
    ok: true,
    status: 200,
    statusText: 'OK',
    text: () => Promise.resolve(''),
  }),
) as jest.Mock

// Disable reselect's dev-mode identity-function check globally for all tests.
// The check fires whenever a createSelector result function returns its input
// unmodified (e.g. `palette => palette || 'light'` when palette is already set)
// and emits a verbose multi-line stack trace that adds no actionable value in the
// test environment.  Type safety and selector correctness are verified by tsc and
// dedicated selector specs — not by this runtime heuristic.
setGlobalDevModeChecks({ identityFunctionCheck: 'never', inputStabilityCheck: 'never' })

// Suppress console.warn noise that is expected and not actionable in tests.
const originalConsoleWarn = console.warn
console.warn = (...args: unknown[]) => {
  const message = args[0]?.toString() ?? ''
  if (
    // React Router emits this when renderWithProviders uses a MemoryRouter whose
    // initial path ('/') does not match the route being tested.  The component
    // still renders correctly — the warning is a false positive in unit tests.
    message.includes('No routes matched location')
  ) {
    return
  }
  originalConsoleWarn.apply(console, args)
}

// Suppress console.error noise that is expected and not actionable in tests.
const originalConsoleError = console.error
console.error = (...args: unknown[]) => {
  const message = args[0]?.toString() ?? ''
  if (
    message.includes('Not implemented: HTMLCanvasElement.prototype.getContext') ||
    message.includes('lottie-web') ||
    message.includes('Failed to load Lottie animation') ||
    message.includes('fetch is not defined') ||
    message.includes('was not wrapped in act(...)') ||
    message.includes('An update to LottieWrapper inside a test') ||
    // axiosBaseQuery logs this when the Redux auth token is absent in unit tests.
    // The error path itself is covered by axios-web.api.spec.ts; the log is noise.
    message.includes('Error in axiosBaseQuery') ||
    message.includes("Cannot read properties of undefined (reading 'token')") ||
    // Socket classes are not real constructors in the jsdom environment; the
    // bootstrap module catches and logs these errors.  Covered by bootstrap specs.
    message.includes('is not a constructor') ||
    // i18n fetches translation JSON over HTTP which always fails in unit tests.
    // Bootstrap specs verify the error-handling path; this log is noise.
    message.includes('i18n initialization error')
  ) {
    return
  }
  originalConsoleError.apply(console, args)
}

// Suppress console.log output from SsrMetrics.logSummary().
// The summary table is exercised by ssr/metrics.spec.ts; the raw log lines add
// no value in the test console and obscure actual failures.
const originalConsoleLog = console.log
console.log = (...args: unknown[]) => {
  const message = args[0]?.toString() ?? ''
  if (
    // Blank separator lines emitted between sections in SsrMetrics.logSummary().
    message.trim() === '' ||
    message.includes('SSR METRICS SUMMARY') ||
    message.includes('============================================================') ||
    message.startsWith('Uptime:') ||
    message.startsWith('Memory:') ||
    message.startsWith('Route:') ||
    message.startsWith('Cache:') ||
    message.startsWith('Errors:')
  ) {
    return
  }
  originalConsoleLog.apply(console, args)
}
