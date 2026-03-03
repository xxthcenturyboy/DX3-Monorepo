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
    message.includes('An update to LottieWrapper inside a test')
  ) {
    return
  }
  originalConsoleError.apply(console, args)
}
