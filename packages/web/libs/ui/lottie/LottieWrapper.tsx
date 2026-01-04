import { useTheme } from '@mui/material'
import Lottie, { type LottieRef } from 'lottie-react'
import React, { type ReactElement } from 'react'
import { ScaleLoader } from 'react-spinners'

import { sleep } from '@dx3/utils-shared'

import type { LottieWrapperPropTypes } from './lottie.types'

export const LottieWrapper: React.FC<LottieWrapperPropTypes> = (props): ReactElement | null => {
  const { animationData, autoPlay, complete, loop, restart, speed, style } = props
  const lottieRef = React.useRef(null) as LottieRef
  const [loadedAnimationData, setLoadedAnimationData] = React.useState<object | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const theme = useTheme()

  React.useEffect(() => {
    loadAnimationData()
  }, [animationData])

  React.useEffect(() => {
    if (loadedAnimationData) {
      loadSettings()
    }
  }, [loadedAnimationData])

  const loadSettings = (): void => {
    if (loadedAnimationData && lottieRef.current) {
      // This is necessary because the final render takes a millisecond to get the ref
      sleep(10).then(() => {
        lottieRef.current?.setSpeed(speed || 1)
        if (complete) {
          const lottieDuration = lottieRef.current?.getDuration() || 500
          const duration = lottieDuration === 500 ? 500 : (lottieDuration * 1000) / (speed || 1)
          sleep(duration).then(() => {
            complete()
          })
        }
      })
    }
  }

  const loadAnimationData = async (): Promise<void> => {
    const isPath = typeof animationData === 'string'

    if (isPath) {
      setIsLoading(true)
      try {
        const response = await fetch(animationData as string)
        const data = await response.json()
        setLoadedAnimationData(data)
      } catch (error) {
        console.error('Failed to load Lottie animation:', error)
        setLoadedAnimationData(null)
      } finally {
        setIsLoading(false)
      }
    } else {
      setLoadedAnimationData(animationData as object)
    }
  }

  if (!animationData) {
    return null
  }

  if (isLoading || !loadedAnimationData) {
    return (
      <div
        style={{ alignItems: 'center', display: 'flex', justifyContent: 'center', width: '100%' }}
      >
        <ScaleLoader color={theme.palette.primary.main} />
      </div>
    )
  }

  restart && lottieRef.current?.goToAndPlay(0, true)

  return (
    <Lottie
      animationData={loadedAnimationData}
      autoPlay={autoPlay !== undefined ? autoPlay : true}
      loop={loop !== undefined ? loop : true}
      lottieRef={lottieRef}
      style={style || {}}
    />
  )
}
