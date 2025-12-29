import type React from 'react'
import type { ReactElement } from 'react'

import { LottieWrapper } from './LottieWrapper'
import type { LottiePropTypes } from './lottie.types'

export const SuccessLottie: React.FC<LottiePropTypes> = ({ complete }): ReactElement => {
  return (
    <LottieWrapper
      animationData="/assets/animations/check-mark-success.json"
      complete={complete}
      loop={false}
      speed={1}
      style={{
        alignSelf: 'center',
        width: '200px',
      }}
    />
  )
}
