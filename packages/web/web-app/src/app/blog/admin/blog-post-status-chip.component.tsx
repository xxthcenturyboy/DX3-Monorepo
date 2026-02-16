import { Chip } from '@mui/material'
import type * as React from 'react'

import { BLOG_POST_STATUS } from '@dx3/models-shared'

import { useStrings } from '../../i18n'

export type BlogPostStatusChipPropsType = {
  listView?: boolean
  status: string
}

const STATUS_COLOR_MAP: Record<
  string,
  'default' | 'error' | 'info' | 'primary' | 'secondary' | 'success' | 'warning'
> = {
  [BLOG_POST_STATUS.ARCHIVED]: 'default',
  [BLOG_POST_STATUS.DRAFT]: 'info',
  [BLOG_POST_STATUS.PUBLISHED]: 'success',
  [BLOG_POST_STATUS.SCHEDULED]: 'warning',
  [BLOG_POST_STATUS.UNPUBLISHED]: 'error',
}

const STATUS_STRING_KEYS: Record<string, string> = {
  [BLOG_POST_STATUS.ARCHIVED]: 'BLOG_STATUS_ARCHIVED',
  [BLOG_POST_STATUS.DRAFT]: 'BLOG_STATUS_DRAFT',
  [BLOG_POST_STATUS.PUBLISHED]: 'BLOG_STATUS_PUBLISHED',
  [BLOG_POST_STATUS.SCHEDULED]: 'BLOG_STATUS_SCHEDULED',
  [BLOG_POST_STATUS.UNPUBLISHED]: 'BLOG_STATUS_UNPUBLISHED',
}

/**
 * Renders a colored status chip for blog posts.
 * Draft = info, Scheduled = warning, Published = success, Unpublished = error (danger)
 */
export const BlogPostStatusChipComponent: React.FC<BlogPostStatusChipPropsType> = ({
  listView = false,
  status,
}) => {
  const strings = useStrings([
    'BLOG_STATUS_ARCHIVED',
    'BLOG_STATUS_DRAFT',
    'BLOG_STATUS_PUBLISHED',
    'BLOG_STATUS_SCHEDULED',
    'BLOG_STATUS_UNPUBLISHED',
  ])

  const label = STATUS_STRING_KEYS[status]
    ? (strings as Record<string, string>)[STATUS_STRING_KEYS[status]]
    : status
  const color = STATUS_COLOR_MAP[status] ?? 'default'

  return (
    <Chip
      color={color}
      label={label}
      size="small"
      sx={{
        '& .MuiChip-label': {
          color: 'white',
        },
        borderRadius: '6px',
        justifyContent: 'center',
        textAlign: 'center',
        width: listView ? 80 : undefined,
      }}
      variant="filled"
    />
  )
}
