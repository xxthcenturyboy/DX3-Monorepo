/**
 * Image component with skeleton placeholder and loading state.
 * Shows a Skeleton until the image loads, then fades in the image.
 * Used for blog markdown images and featured images.
 */

import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import * as React from 'react'

import { WebConfigService } from '../config/config-web.service'

/**
 * Resolves relative /api/ URLs to absolute for SSR (no same-origin proxy).
 */
const resolveImgSrc = (src: string | undefined): string => {
  if (!src) return ''
  if (src.startsWith('http') || src.startsWith('//') || src.startsWith('data:')) {
    return src
  }
  if (src.startsWith('/api/')) {
    const apiBase = WebConfigService.getWebUrls().API_URL?.replace(/\/$/, '')
    return apiBase ? `${apiBase}${src}` : src
  }
  return src
}

type BlogImageWithPlaceholderProps = React.ComponentPropsWithoutRef<'img'> & {
  imgSx?: React.ComponentProps<typeof Box>['sx']
  sx?: React.ComponentProps<typeof Box>['sx']
}

export const BlogImageWithPlaceholder: React.FC<BlogImageWithPlaceholderProps> = ({
  alt = '',
  className,
  height,
  imgSx = {},
  src,
  sx = {},
  title,
  width,
  ...rest
}) => {
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [hasError, setHasError] = React.useState(false)
  const resolvedSrc = resolveImgSrc(src)

  const handleLoad = React.useCallback(() => {
    setIsLoaded(true)
  }, [])

  const handleError = React.useCallback(() => {
    setHasError(true)
    setIsLoaded(true)
  }, [])

  const skeletonHeight = height ?? 240

  return (
    <Box
      className={className}
      sx={{
        minHeight: skeletonHeight,
        overflow: 'hidden',
        position: 'relative',
        ...sx,
      }}
    >
      {!isLoaded && (
        <Skeleton
          animation="wave"
          height={skeletonHeight}
          sx={{
            left: 0,
            position: 'absolute',
            top: 0,
            width: '100%',
            zIndex: 1,
          }}
          variant="rectangular"
        />
      )}
      <Box
        {...rest}
        alt={alt}
        component="img"
        loading="lazy"
        onError={handleError}
        onLoad={handleLoad}
        src={resolvedSrc}
        sx={{
          display: hasError ? 'none' : 'block',
          height: 'auto',
          maxWidth: '100%',
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
          width: width ?? '100%',
          ...imgSx,
        }}
        title={title}
      />
      {hasError && (
        <Box
          sx={{
            alignItems: 'center',
            backgroundColor: 'action.hover',
            display: 'flex',
            height: skeletonHeight,
            justifyContent: 'center',
          }}
        >
          {/* Placeholder for broken image - could add i18n "Image failed to load" */}
        </Box>
      )}
    </Box>
  )
}
