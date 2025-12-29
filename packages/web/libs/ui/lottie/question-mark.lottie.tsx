import type React from 'react'
import type { ReactElement } from 'react'

import { LottieWrapper } from './LottieWrapper'
import type { LottiePropTypes } from './lottie.types'

export const QuestionMarkLottie: React.FC<LottiePropTypes> = ({ complete }): ReactElement => {
  return (
    <LottieWrapper
      animationData="/assets/animations/question-bubble.json"
      complete={complete}
      loop={false}
      restart={true}
      speed={2}
      style={{
        alignSelf: 'center',
        width: '300px',
      }}
    />
  )
}
