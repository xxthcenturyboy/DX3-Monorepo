import type { CompleteMultipartUploadCommandOutput } from '@aws-sdk/client-s3'
import type { FileJSON } from 'formidable'

export type MediaFileType = {
  bucket?: string
  eTag?: string
  format?: string
  height?: number
  key?: string
  location?: string
  size?: number
  width?: number
}

export type MediaDataType = {
  altText: string
  mediaSubType: string
  mediaType: string
  files: {
    [variant: string]: MediaFileType
  }
  hashedFilenameMimeType: string
  id: string
  originalFileName: string
  ownerId: string
  primary: boolean
}

export type ImageResizeMediaType = {
  asset: string | Buffer
  id: string
  size?: number
  width?: number
  height?: number
  format?: string
  metaData?: { [key: string]: string }
  s3UploadedFile?: CompleteMultipartUploadCommandOutput
  variant?: string
}

export type UploadMediaParams = {
  altText: string
  mediaSubType: string
}

export type UploadMediaHandlerParams = {
  filePath: string
  fileSize: number
  isPrimary?: boolean
  mimeType: string
  newFilename: string
  originalFilename: string
  ownerId: string
  uploadId?: string
} & UploadMediaParams

export type UploadMediaFile = {
  format: string
  key: string
  width: number
  fileName: FileJSON[]
}

export type MediaUploadResponseType = {
  data: Partial<MediaDataType>
  msg?: string
  ok: boolean
}
