import { MEDIA_SUB_TYPES, type MediaUploadResponseType } from '@dx3/models-shared'

import { apiWeb, getCustomHeaders } from '../data/rtk-query/web.api'
import type { MediaWebAvatarUploadParamsType } from './media-web.types'

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
  }),
  overrideExisting: true,
})

export const { useUploadAvatarMutation } = apiWebMedia
