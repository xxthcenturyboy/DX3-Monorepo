import type React from 'react'
import type { ReactElement } from 'react'

import { LottieWrapper } from './LottieWrapper'
import type { LottiePropTypes } from './lottie.types'

export const WelcomeRobotLottie: React.FC<LottiePropTypes> = ({ complete }): ReactElement => {
  return (
    <LottieWrapper
      animationData="/assets/animations/welcome-robot.json"
      complete={complete}
      loop={true}
      speed={1}
      style={{
        alignSelf: 'center',
        width: '360px',
      }}
    />
  )
}
