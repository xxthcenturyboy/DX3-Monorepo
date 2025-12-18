/** biome-ignore-all lint/suspicious/noExplicitAny: expected in this file */
export enum agents {
  ios = 'ios',
  android = 'android',
}

export function getUserAgent(): agents | null {
  let which: agents | null = null
  ;((a) => {
    if (/Android/i.test(a)) {
      which = agents.android
    } else if (/iPad|iPhone|iPod/i.test(a) && !(window as any).MSStream) {
      which = agents.ios
    }
  })(navigator.userAgent || navigator.vendor || (window as any).opera)
  return which
}
