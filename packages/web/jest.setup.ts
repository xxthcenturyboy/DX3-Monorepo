/**
 * Jest Setup File
 * This file runs before each test file and sets up the testing environment.
 * It mocks browser APIs that are not available in jsdom.
 */

import '@testing-library/jest-dom'

// Note: lottie-react mock is centralized in __mocks__/lottie-react.tsx
// and mapped via moduleNameMapper in jest.config.ts

// Mock HTMLCanvasElement.getContext to prevent other canvas-related errors
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

// Mock global fetch API for tests (jsdom doesn't include it by default)
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

// Suppress specific console errors that are expected during tests
const originalConsoleError = console.error
console.error = (...args: unknown[]) => {
  // Filter out expected warnings that are noisy but not actionable in tests
  const message = args[0]?.toString() || ''
  if (
    // Canvas API not available in jsdom
    message.includes('Not implemented: HTMLCanvasElement.prototype.getContext') ||
    message.includes('lottie-web') ||
    message.includes('Failed to load Lottie animation') ||
    message.includes('fetch is not defined') ||
    // React act() warnings from async state updates in LottieWrapper
    // These are expected since Lottie animations have async loading behavior
    message.includes('was not wrapped in act(...)') ||
    message.includes('An update to LottieWrapper inside a test')
  ) {
    return
  }
  originalConsoleError.apply(console, args)
}
