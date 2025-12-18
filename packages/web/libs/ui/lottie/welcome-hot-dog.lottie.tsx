import type React from 'react'
import type { ReactElement } from 'react'

import { LottieWrapper } from './LottieWrapper'
import type { LottiePropTypes } from './lottie.types'

export const WelcomeHotDogLottie: React.FC<LottiePropTypes> = ({ complete }): ReactElement => {
  return (
    <LottieWrapper
      animationData="/assets/animations/hot-dog-man.json"
      complete={complete}
      loop={true}
      speed={1}
      style={{
        alignSelf: 'center',
        width: '200px',
      }}
    />
  )
}
