/** biome-ignore-all lint/suspicious/noExplicitAny: accept any */
import type React from 'react'
import { useRef } from 'react'

export const useFocus = (): [React.RefObject<any>, () => void] => {
  const htmlElRef = useRef<any>(null)
  const setFocus = () => {
    htmlElRef?.current?.focus()
  }

  return [htmlElRef, setFocus]
}
