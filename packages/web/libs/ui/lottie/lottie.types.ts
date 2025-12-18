import type { CSSProperties } from 'react'

export type LottiePropTypes = {
  complete?: () => void
  loop?: boolean
}

export type LottieWrapperPropTypes = {
  animationData: object | string
  autoPlay?: boolean
  complete?: () => void
  loop?: boolean
  speed?: number
  style?: CSSProperties
}
