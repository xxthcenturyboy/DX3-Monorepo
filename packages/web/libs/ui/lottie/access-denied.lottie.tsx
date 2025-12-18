import type React from 'react'
import type { ReactElement } from 'react'

import { LottieWrapper } from './LottieWrapper'
import type { LottiePropTypes } from './lottie.types'

export const AccessDeniedLottie: React.FC<LottiePropTypes> = ({
  complete,
  loop = true,
}): ReactElement => {
  return (
    <LottieWrapper
      animationData="/assets/animations/access-denied.json"
      complete={complete}
      loop={loop}
      speed={0.5}
      style={{
        alignSelf: 'center',
        width: '200px',
      }}
    />
  )
}
