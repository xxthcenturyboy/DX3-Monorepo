import { MEDIA_SUB_TYPES, type MediaUploadResponseType } from '@dx3/models-shared'

import { apiWeb } from '../data/rtk-query/web.api'
import type { MediaWebAvatarUploadParamsType } from './media-web.types'

export const apiWebMedia = apiWeb.injectEndpoints({
  endpoints: (build) => ({
    uploadAvatar: build.mutation<MediaUploadResponseType[], MediaWebAvatarUploadParamsType>({
      // @ts-expect-error - types are good - error is wrong
      query: (payload) => {
        const bodyFormData = new FormData()
        bodyFormData.append('files', payload.file, payload.fileName)
        bodyFormData.append('mediaSubType', MEDIA_SUB_TYPES.PROFILE_IMAGE)
        return {
          data: bodyFormData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          method: 'POST',
          uploadProgressHandler: payload.uploadProgressHandler,
          url: 'v1/media/upload-profile-image',
        }
      },
    }),
  }),
  overrideExisting: true,
})

export const { useUploadAvatarMutation } = apiWebMedia
