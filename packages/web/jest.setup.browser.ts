/**
 * Shared browser-environment Jest setup.
 *
 * Imported by every jsdom-targeted setup file in this package:
 *   - packages/web/jest.setup.ts        (libs/ tests)
 *   - packages/web/web-app/jest.setup.ts (web-app tests)
 *
 * Add any stub here that must exist in ALL jsdom Jest workers under packages/web.
 */

import '@testing-library/jest-dom'
import { setGlobalDevModeChecks } from 'reselect'

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
