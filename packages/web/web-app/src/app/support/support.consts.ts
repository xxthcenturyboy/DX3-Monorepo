import {
  SUPPORT_CATEGORY,
  SUPPORT_STATUS,
  type SupportCategoryType,
  type SupportStatusType,
} from '@dx3/models-shared'

import type { StringKeyName } from '../i18n'

export const CATEGORY_LABEL_KEYS: Record<SupportCategoryType, StringKeyName> = {
  [SUPPORT_CATEGORY.ISSUE]: 'SUPPORT_CATEGORY_ISSUE',
  [SUPPORT_CATEGORY.NEW_FEATURE]: 'SUPPORT_CATEGORY_NEW_FEATURE',
  [SUPPORT_CATEGORY.OTHER]: 'SUPPORT_CATEGORY_OTHER',
  [SUPPORT_CATEGORY.QUESTION]: 'SUPPORT_CATEGORY_QUESTION',
}

export const STATUS_LABEL_KEYS: Record<SupportStatusType, StringKeyName> = {
  [SUPPORT_STATUS.CLOSED]: 'SUPPORT_STATUS_CLOSED',
  [SUPPORT_STATUS.IN_PROGRESS]: 'SUPPORT_STATUS_IN_PROGRESS',
  [SUPPORT_STATUS.OPEN]: 'SUPPORT_STATUS_OPEN',
  [SUPPORT_STATUS.RESOLVED]: 'SUPPORT_STATUS_RESOLVED',
}

export const SUPPORT_ROUTES = {
  MAIN: '/support',
} as const

export const SUPPORT_ADMIN_ROUTES = {
  DETAIL: '/admin/support',
  LIST: '/admin/support/list',
  MAIN: '/admin/support',
} as const
