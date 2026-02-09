import dayjs from 'dayjs'

import { BLOG_POST_STATUS, type BlogPostType } from '@dx3/models-shared'
import type { TableHeaderItem, TableMeta, TableRowType } from '@dx3/web-libs/ui/table/types'

import { DEFAULT_STRINGS } from '../../i18n/i18n.consts'
import { store } from '../../store/store-web.redux'

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
      width: '25%',
    },
    {
      align: 'left',
      componentType: 'text',
      fieldName: 'slug',
      fieldType: 'string',
      headerAlign: 'left',
      sortable: false,
      title: BlogAdminWebListService.STRINGS.SLUG,
      width: '25%',
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
      title: BlogAdminWebListService.STRINGS.DATE,
      width: '20%',
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

  private getRowData(post: BlogPostType): TableRowType {
    const row: TableRowType = {
      columns: [],
      id: post.id,
      testingKey: `blog-post-row-${post.slug}`,
    }

    for (const meta of BlogAdminWebListService.BLOG_ADMIN_LIST_META) {
      let cellData: unknown

      if (meta.fieldName === 'status') {
        cellData = BlogAdminWebListService.formatStatus(post.status)
      } else if (meta.fieldName === 'createdAt') {
        cellData = dayjs(post.createdAt).format('L')
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

  public getRows(posts: BlogPostType[]): TableRowType[] {
    const rows: TableRowType[] = []
    for (const post of posts) {
      rows.push(this.getRowData(post))
    }
    return rows
  }
}
