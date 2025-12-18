import type React from 'react'
import type { ReactElement } from 'react'

import { LottieWrapper } from './LottieWrapper'
import type { LottiePropTypes } from './lottie.types'

export const CancelLottie: React.FC<LottiePropTypes> = ({ complete }): ReactElement => {
  return (
    <LottieWrapper
      animationData="/assets/animations/cancel-icon.json"
      complete={complete}
      loop={false}
      speed={2}
      style={{
        alignSelf: 'center',
        width: '200px',
      }}
    />
  )
}
