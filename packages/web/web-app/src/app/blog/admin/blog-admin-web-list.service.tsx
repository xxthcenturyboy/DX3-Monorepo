import Publish from '@mui/icons-material/Publish'
import Schedule from '@mui/icons-material/Schedule'
import Unpublished from '@mui/icons-material/Unpublished'
import { Box, IconButton, Tooltip } from '@mui/material'
import dayjs from 'dayjs'
import * as React from 'react'

import { BLOG_POST_STATUS, type BlogPostType } from '@dx3/models-shared'
import type { TableHeaderItem, TableMeta, TableRowType } from '@dx3/web-libs/ui/table/types'

import { DEFAULT_STRINGS } from '../../i18n/i18n.consts'
import { store } from '../../store/store-web.redux'

export type BlogListActionsType = {
  onPublish: (id: string) => void
  onScheduleClick: (id: string) => void
  onUnschedule: (id: string) => void
}

export class BlogAdminWebListService {
  public static STRINGS = store.getState()?.i18n?.translations || DEFAULT_STRINGS

  public static BLOG_ADMIN_LIST_META: TableMeta<unknown>[] = [
    {
      align: 'left',
      componentType: 'text',
      fieldName: 'title',
      fieldType: 'string',
      headerAlign: 'left',
      sortable: true,
      title: BlogAdminWebListService.STRINGS.TITLE,
      width: '22%',
    },
    {
      align: 'left',
      componentType: 'text',
      fieldName: 'slug',
      fieldType: 'string',
      headerAlign: 'left',
      sortable: false,
      title: BlogAdminWebListService.STRINGS.SLUG,
      width: '18%',
    },
    {
      align: 'left',
      componentType: 'text',
      fieldName: 'status',
      fieldType: 'string',
      headerAlign: 'left',
      sortable: true,
      title: BlogAdminWebListService.STRINGS.STATUS,
      width: '15%',
    },
    {
      align: 'left',
      componentType: 'text',
      fieldName: 'createdAt',
      fieldType: 'string',
      headerAlign: 'left',
      sortable: true,
      title: BlogAdminWebListService.STRINGS.BLOG_DATE_CREATED,
      width: '15%',
    },
    {
      align: 'left',
      componentType: 'text',
      fieldName: 'publishedAt',
      fieldType: 'string',
      headerAlign: 'left',
      sortable: true,
      title: BlogAdminWebListService.STRINGS.BLOG_DATE_PUBLISHED,
      width: '15%',
    },
    {
      align: 'right',
      componentType: 'component',
      fieldName: 'actions',
      fieldType: null,
      headerAlign: 'right',
      sortable: false,
      title: '',
      width: '12%',
    },
  ]

  public static getListHeaders(): TableHeaderItem[] {
    const data: TableHeaderItem[] = []

    for (const meta of BlogAdminWebListService.BLOG_ADMIN_LIST_META) {
      data.push({
        align: meta.headerAlign,
        fieldName: meta.fieldName,
        sortable: meta.sortable,
        title: meta.title,
        width: meta.width,
      })
    }

    return data
  }

  private static formatStatus(status: string): string {
    switch (status) {
      case BLOG_POST_STATUS.DRAFT:
        return BlogAdminWebListService.STRINGS.BLOG_STATUS_DRAFT
      case BLOG_POST_STATUS.PUBLISHED:
        return BlogAdminWebListService.STRINGS.BLOG_STATUS_PUBLISHED
      case BLOG_POST_STATUS.SCHEDULED:
        return BlogAdminWebListService.STRINGS.BLOG_STATUS_SCHEDULED
      case BLOG_POST_STATUS.ARCHIVED:
        return BlogAdminWebListService.STRINGS.BLOG_STATUS_ARCHIVED
      default:
        return status
    }
  }

  private static renderActionsCell(
    post: BlogPostType,
    actions: BlogListActionsType,
  ): React.ReactElement {
    const strings = BlogAdminWebListService.STRINGS
    const canPublish =
      post.status === BLOG_POST_STATUS.DRAFT ||
      post.status === BLOG_POST_STATUS.SCHEDULED ||
      post.status === BLOG_POST_STATUS.ARCHIVED
    const canSchedule = post.status === BLOG_POST_STATUS.DRAFT
    const canUnschedule = post.status === BLOG_POST_STATUS.SCHEDULED

    return (
      <Box
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        sx={{ alignItems: 'center', display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}
      >
        {canPublish && (
          <Tooltip title={strings.BLOG_TOOLTIP_PUBLISH ?? 'Publish now'}>
            <IconButton
              aria-label={strings.BLOG_PUBLISH ?? 'Publish'}
              color="primary"
              onClick={() => actions.onPublish(post.id)}
              size="small"
            >
              <Publish fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        {canSchedule && (
          <Tooltip title={strings.BLOG_TOOLTIP_SCHEDULE ?? 'Schedule for later'}>
            <IconButton
              aria-label={strings.BLOG_SCHEDULE ?? 'Schedule'}
              color="primary"
              onClick={() => actions.onScheduleClick(post.id)}
              size="small"
            >
              <Schedule fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        {canUnschedule && (
          <Tooltip title={strings.BLOG_TOOLTIP_UNSCHEDULE ?? 'Unschedule and revert to draft'}>
            <IconButton
              aria-label={strings.BLOG_UNSCHEDULE ?? 'Unschedule'}
              color="primary"
              onClick={() => actions.onUnschedule(post.id)}
              size="small"
            >
              <Unpublished fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    )
  }

  private getRowData(post: BlogPostType, actions?: BlogListActionsType): TableRowType {
    const row: TableRowType = {
      columns: [],
      id: post.id,
      testingKey: `blog-post-row-${post.slug}`,
    }

    for (const meta of BlogAdminWebListService.BLOG_ADMIN_LIST_META) {
      let cellData: unknown

      if (meta.fieldName === 'actions') {
        cellData =
          actions !== undefined
            ? BlogAdminWebListService.renderActionsCell(post, actions)
            : React.createElement(Box, { sx: { minWidth: 48 } })
      } else if (meta.fieldName === 'status') {
        cellData = BlogAdminWebListService.formatStatus(post.status)
      } else if (meta.fieldName === 'createdAt') {
        cellData = dayjs(post.createdAt).format('L')
      } else if (meta.fieldName === 'publishedAt') {
        cellData = post.publishedAt
          ? dayjs(post.publishedAt).format('L')
          : post.scheduledAt
            ? dayjs(post.scheduledAt).format('L')
            : '—'
      } else {
        cellData = post[meta.fieldName as keyof BlogPostType] ?? ''
      }

      row.columns.push({
        align: meta.align,
        componentType: meta.componentType,
        data: cellData,
        dataType: meta.fieldType,
      })
    }

    return row
  }

  public getRows(posts: BlogPostType[], actions?: BlogListActionsType): TableRowType[] {
    const rows: TableRowType[] = []
    for (const post of posts) {
      rows.push(this.getRowData(post, actions))
    }
    return rows
  }
}
