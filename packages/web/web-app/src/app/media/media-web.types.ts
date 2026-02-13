import type { MediaDataType } from '@dx3/models-shared'

import type { UploadProgressHandlerType } from '../data/rtk-query/axios-web.types'

export type MediaStateType = {
  media: MediaDataType[]
}

export type MediaWebAvatarUploadParamsType = {
  file: Blob
  fileName: string
  uploadProgressHandler: UploadProgressHandlerType
}

export type MediaWebUserContentUploadParamsType = {
  files: File[]
  mediaSubType: string
  ownerId?: string
  public?: boolean
  uploadProgressHandler?: UploadProgressHandlerType
}
