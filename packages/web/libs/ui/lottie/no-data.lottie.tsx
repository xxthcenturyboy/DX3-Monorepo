import type React from 'react'
import type { ReactElement } from 'react'

import { LottieWrapper } from './LottieWrapper'
import type { LottiePropTypes } from './lottie.types'

export const NoDataLottie: React.FC<LottiePropTypes> = ({ complete }): ReactElement => {
  return (
    <LottieWrapper
      animationData="/assets/animations/not-found.json"
      complete={complete}
      loop={true}
      speed={0.5}
      style={{
        alignSelf: 'center',
        width: '100px',
      }}
    />
  )
}
