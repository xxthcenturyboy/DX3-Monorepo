/**
 * Jest setup for packages/web/libs/ tests.
 *
 * All shared browser stubs (matchMedia, fetch, canvas, etc.) live in
 * jest.setup.browser.ts so they are available in both libs/ and web-app/.
 */

// Note: lottie-react mock is centralised in __mocks__/lottie-react.tsx
// and mapped via moduleNameMapper in jest.config.ts.
import './jest.setup.browser'
