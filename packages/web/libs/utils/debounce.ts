// biome-ignore lint/suspicious/noExplicitAny: any expected here
type Procedure = (...args: any[]) => void

type Options = {
  isImmediate: boolean
}

export interface DebouncedFunction<F extends Procedure> {
  (this: ThisParameterType<F>, ...args: Parameters<F>): void
  cancel: () => void
}

export function debounce<F extends Procedure>(
  func: F,
  waitMilliseconds = 50,
  options: Options = {
    isImmediate: false,
  },
): DebouncedFunction<F> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  const debouncedFunction = function (this: ThisParameterType<F>, ...args: Parameters<F>) {
    const doLater = () => {
      timeoutId = undefined
      if (!options.isImmediate) {
        func.apply(this, args)
      }
    }

    const shouldCallNow = options.isImmediate && timeoutId === undefined

    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(doLater, waitMilliseconds)

    if (shouldCallNow) {
      func.apply(this, args)
    }
  }

  debouncedFunction.cancel = () => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
    }
  }

  return debouncedFunction
}
