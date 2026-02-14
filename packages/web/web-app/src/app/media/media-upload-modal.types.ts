import type { MediaUploadResponseType } from '@dx3/models-shared'

export type MediaUploadMediaTypeKey =
  | 'MEDIA_TYPE_FILES'
  | 'MEDIA_TYPE_IMAGE'
  | 'MEDIA_TYPE_PDF'

export type MediaUploadConfigType = {
  allowedMimeTypes: string[]
  allowUrlInput?: boolean
  mediaTypeKey?: MediaUploadMediaTypeKey
  maxFiles?: number
  public: boolean
}

export type MediaUploadResultType = MediaUploadResponseType

export type MediaUploadModalPropsType = {
  closeDialog: () => void
  config: MediaUploadConfigType
  isMobileWidth?: boolean
  onSuccess: (results: MediaUploadResultType[]) => void
  onUpload: (params: {
    files: File[]
    public: boolean
  }) => Promise<MediaUploadResultType[]>
  onUrlInsert?: (url: string) => void
  windowHeight?: number
}
