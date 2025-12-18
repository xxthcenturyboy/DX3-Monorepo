import type React from 'react'
import type { ReactElement } from 'react'

import { LottieWrapper } from './LottieWrapper'
import type { LottiePropTypes } from './lottie.types'

export const BetaBadgeLottie: React.FC<LottiePropTypes> = ({ complete }): ReactElement => {
  return (
    <LottieWrapper
      animationData="/assets/animations/beta-badge.json"
      complete={complete}
      loop={false}
      speed={1}
      style={{
        alignSelf: 'center',
        width: '300px',
      }}
    />
  )
}
