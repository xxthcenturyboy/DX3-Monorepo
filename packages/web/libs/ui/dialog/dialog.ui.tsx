import Grow from '@mui/material/Grow'
import Slide from '@mui/material/Slide'
import type { TransitionProps } from '@mui/material/transitions'
import Zoom from '@mui/material/Zoom'
import React from 'react'

export const GrowTransition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown>
  },
  ref: React.Ref<unknown>,
) {
  return (
    <Grow
      ref={ref}
      {...props}
    />
  )
})

export const SlideTransition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown>
  },
  ref: React.Ref<unknown>,
) {
  return (
    <Slide
      direction="up"
      ref={ref}
      {...props}
    />
  )
})

export const ZoomTransition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown>
  },
  ref: React.Ref<unknown>,
) {
  return (
    <Zoom
      ref={ref}
      {...props}
    />
  )
})
