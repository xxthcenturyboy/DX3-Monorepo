import type React from 'react'
import type { ReactElement } from 'react'

import { LottieWrapper } from './LottieWrapper'
import type { LottiePropTypes } from './lottie.types'

export const AwaiterLottie: React.FC<LottiePropTypes> = ({ complete }): ReactElement => {
  return (
    <LottieWrapper
      animationData="/assets/animations/loading-orange-diffuse.json"
      complete={complete}
      loop={true}
      speed={2.5}
      style={{
        alignSelf: 'center',
        width: '300px',
      }}
    />
  )
}
