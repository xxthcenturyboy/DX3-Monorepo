import type React from 'react'
import type { ReactElement } from 'react'

import { LottieWrapper } from './LottieWrapper'
import type { LottiePropTypes } from './lottie.types'

export const ErrorLottie: React.FC<LottiePropTypes> = ({ complete }): ReactElement => {
  return (
    <LottieWrapper
      animationData="/assets/animations/grim-reaper.json"
      complete={complete}
      loop={true}
      speed={2}
      style={{
        alignSelf: 'center',
        width: '300px',
      }}
    />
  )
}
