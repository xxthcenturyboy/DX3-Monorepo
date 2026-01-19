declare module 'fingerprintjs' {
  export type FingerprintJSOptions = Record<string, boolean | number | string>

  export default class FingerprintJS {
    constructor(options?: FingerprintJSOptions)
    get(): string
  }
}
