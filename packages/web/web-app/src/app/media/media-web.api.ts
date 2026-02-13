import { MEDIA_SUB_TYPES, type MediaUploadResponseType } from '@dx3/models-shared'

import { apiWeb, getCustomHeaders } from '../data/rtk-query/web.api'
import type {
  MediaWebAvatarUploadParamsType,
  MediaWebUserContentUploadParamsType,
} from './media-web.types'

export const apiWebMedia = apiWeb.injectEndpoints({
  endpoints: (build) => ({
    uploadAvatar: build.mutation<MediaUploadResponseType[], MediaWebAvatarUploadParamsType>({
      query: (payload) => {
        const bodyFormData = new FormData()
        bodyFormData.append('files', payload.file, payload.fileName)
        bodyFormData.append('mediaSubType', MEDIA_SUB_TYPES.PROFILE_IMAGE)
        return {
          data: bodyFormData,
          headers: getCustomHeaders({ contentType: 'multipart/form-data', version: 1 }),
          method: 'POST',
          uploadProgressHandler: payload.uploadProgressHandler,
          url: 'media/upload-profile-image',
        }
      },
    }),
    uploadContent: build.mutation<MediaUploadResponseType[], MediaWebUserContentUploadParamsType>({
      query: (payload) => {
        const bodyFormData = new FormData()
        for (const file of payload.files) {
          bodyFormData.append('files', file, file.name)
        }
        bodyFormData.append('mediaSubType', payload.mediaSubType)
        if (payload.ownerId) {
          bodyFormData.append('ownerId', payload.ownerId)
        }
        bodyFormData.append('public', String(!!payload.public))
        return {
          data: bodyFormData,
          headers: getCustomHeaders({ contentType: 'multipart/form-data', version: 1 }),
          method: 'POST',
          uploadProgressHandler: payload.uploadProgressHandler,
          url: 'media/upload-content',
        }
      },
    }),
  }),
  overrideExisting: true,
})

export const { useUploadAvatarMutation, useUploadContentMutation } = apiWebMedia
