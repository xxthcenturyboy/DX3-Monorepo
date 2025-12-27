import fs from 'node:fs'
import path from 'node:path'
import axios, { type AxiosError, type AxiosRequestConfig } from 'axios'
import FormData from 'form-data'

import type { MediaUploadResponseType } from '@dx3/models-shared'
import { MEDIA_SUB_TYPES, MEDIA_VARIANTS } from '@dx3/models-shared'

import { getGlobalAuthHeaders } from '../../support/test-setup'

describe('v1 Media Routes', () => {
  let mediaId = ''
  let mediaId2 = ''
  let profileImageId = ''

  describe('POST /api/v1/media/upload-profile-image', () => {
    test('should return an error when no file is sent', async () => {
      //arrange
      const bodyFormData = new FormData()
      bodyFormData.append('files', '', { filename: 'test-media-1.png' })
      const request: AxiosRequestConfig = {
        data: bodyFormData,
        headers: {
          ...getGlobalAuthHeaders(),
          // 'Content-Type': 'multipart/form-data',
        },
        method: 'POST',
        url: '/api/v1/media/upload-profile-image',
        withCredentials: true,
      }
      // act
      try {
        await axios.request(request)
      } catch (err) {
        const typedError = err as AxiosError
        // assert
        expect(typedError.response.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual(
          'options.allowEmptyFiles is false, file size should be greater than 0',
        )
      }
    })

    test('should return an error when more than one file is sent', async () => {
      //arrange
      const bodyFormData = new FormData()
      const filePath1 = path.join(__dirname, '../..', 'support', 'test-media-1.png')
      const filePath2 = path.join(__dirname, '../..', 'support', 'test-media-2.png')
      const fileStream1 = fs.createReadStream(filePath1)
      const fileStream2 = fs.createReadStream(filePath2)
      bodyFormData.append('files', fileStream1, { filename: 'test-media-1.png' })
      bodyFormData.append('files', fileStream2, { filename: 'test-media-2.png' })
      const request: AxiosRequestConfig = {
        data: bodyFormData,
        headers: {
          ...getGlobalAuthHeaders(),
          // 'Content-Type': 'multipart/form-data',
        },
        method: 'POST',
        url: '/api/v1/media/upload-profile-image',
        withCredentials: true,
      }
      // act
      try {
        await axios.request(request)
      } catch (err) {
        const typedError = err as AxiosError
        // assert
        expect(typedError.response.status).toBe(413)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual('200 File upload count exceeded.')
      }
    })

    test('should return a media record when successful', async () => {
      //arrange
      const filePath = path.join(__dirname, '../..', 'support', 'test-media-1.png')
      const fileStream1 = fs.createReadStream(filePath)
      const bodyFormData = new FormData()
      bodyFormData.append('files', fileStream1, { filename: 'test-media-1.png' })
      bodyFormData.append('mediaSubType', MEDIA_SUB_TYPES.PROFILE_IMAGE)
      const request: AxiosRequestConfig = {
        data: bodyFormData,
        headers: {
          ...getGlobalAuthHeaders(),
          //  'Content-Type': 'multipart/form-data'
        },
        method: 'POST',
        url: '/api/v1/media/upload-profile-image',
        withCredentials: true,
      }

      // act
      const result = await axios.request<MediaUploadResponseType[]>(request)
      const data = result.data[0]
      profileImageId = data.data.id

      // assert
      expect(data).toBeDefined()
      expect(result.status).toEqual(200)
      expect(data.ok).toBe(true)
      expect(data.msg).toBeUndefined()
      expect(data.data.id).toBeDefined()
      expect(data.data.mediaSubType).toEqual(MEDIA_SUB_TYPES.PROFILE_IMAGE)
      expect(data.data.files).toBeDefined()
      expect(data.data.files[MEDIA_VARIANTS.SMALL]).toBeDefined()
      expect(data.data.files[MEDIA_VARIANTS.MEDIUM]).toBeDefined()
      expect(data.data.files[MEDIA_VARIANTS.ORIGINAL]).toBeDefined()
      expect(data.data.files[MEDIA_VARIANTS.THUMB]).toBeDefined()
    })

    test('should retrieve the profile image', async () => {
      //arrange
      const request: AxiosRequestConfig = {
        headers: getGlobalAuthHeaders(),
        method: 'GET',
        url: `/api/v1/media/${profileImageId}/${MEDIA_VARIANTS.THUMB}`,
        withCredentials: true,
      }

      // act
      const result = await axios.request(request)
      // assert
      expect(result).toBeDefined()
      expect(result.status).toEqual(200)
      expect(result.data).toBeDefined()
    })
  })

  describe('POST /api/v1/media/upload-user-content', () => {
    test('should return an error when no file is sent', async () => {
      //arrange
      const bodyFormData = new FormData()
      bodyFormData.append('files', '', { filename: 'test-media-1.png' })
      const request: AxiosRequestConfig = {
        data: bodyFormData,
        headers: {
          ...getGlobalAuthHeaders(),
          // 'Content-Type': 'multipart/form-data',
        },
        method: 'POST',
        url: '/api/v1/media/upload-user-content',
        withCredentials: true,
      }
      // act
      try {
        await axios.request(request)
      } catch (err) {
        const typedError = err as AxiosError
        // assert
        expect(typedError.response.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual(
          'options.allowEmptyFiles is false, file size should be greater than 0',
        )
      }
    })

    test('should return a media record when a single file upload is successful', async () => {
      //arrange
      const filePath = path.join(__dirname, '../..', 'support', 'test-media-1.png')
      const fileStream1 = fs.createReadStream(filePath)
      const bodyFormData = new FormData()
      bodyFormData.append('files', fileStream1, { filename: 'test-media-1.png' })
      bodyFormData.append('mediaSubType', MEDIA_SUB_TYPES.IMAGE)
      const request: AxiosRequestConfig = {
        data: bodyFormData,
        headers: {
          ...getGlobalAuthHeaders(),
          //  'Content-Type': 'multipart/form-data'
        },
        method: 'POST',
        url: '/api/v1/media/upload-user-content',
        withCredentials: true,
      }

      // act
      const result = await axios.request<MediaUploadResponseType[]>(request)
      const data = result.data[0]
      mediaId = data.data.id

      // assert
      expect(data).toBeDefined()
      expect(result.status).toEqual(200)
      expect(data.ok).toBe(true)
      expect(data.msg).toBeUndefined()
      expect(data.data.id).toBeDefined()
      expect(data.data.mediaSubType).toEqual(MEDIA_SUB_TYPES.IMAGE)
      expect(data.data.files).toBeDefined()
      expect(data.data.files[MEDIA_VARIANTS.SMALL]).toBeDefined()
      expect(data.data.files[MEDIA_VARIANTS.MEDIUM]).toBeDefined()
      expect(data.data.files[MEDIA_VARIANTS.ORIGINAL]).toBeDefined()
      expect(data.data.files[MEDIA_VARIANTS.THUMB]).toBeDefined()
    })

    test('should return status 200 and the uploaded file when successful', async () => {
      //arrange
      const request: AxiosRequestConfig = {
        headers: getGlobalAuthHeaders(),
        method: 'GET',
        url: `/api/v1/media/${mediaId}/${MEDIA_VARIANTS.THUMB}`,
        withCredentials: true,
      }

      // act
      const result = await axios.request(request)
      // assert
      expect(result).toBeDefined()
      expect(result.status).toEqual(200)
      expect(result.data).toBeDefined()
    })

    test('should return media records when multiple file uploads are successful', async () => {
      //arrange
      const filePath1 = path.join(__dirname, '../..', 'support', 'test-media-1.png')
      const filePath2 = path.join(__dirname, '../..', 'support', 'test-media-2.png')
      const fileStream1 = fs.createReadStream(filePath1)
      const fileStream2 = fs.createReadStream(filePath2)
      const bodyFormData = new FormData()
      bodyFormData.append('files', fileStream1, { filename: 'test-media-1.png' })
      bodyFormData.append('files', fileStream2, { filename: 'test-media-2.png' })
      bodyFormData.append('mediaSubType', MEDIA_SUB_TYPES.IMAGE)
      const request: AxiosRequestConfig = {
        data: bodyFormData,
        headers: {
          ...getGlobalAuthHeaders(),
          //  'Content-Type': 'multipart/form-data'
        },
        method: 'POST',
        url: '/api/v1/media/upload-user-content',
        withCredentials: true,
      }

      // act
      const result = await axios.request<MediaUploadResponseType[]>(request)
      const data0 = result.data[0]
      const data1 = result.data[1]
      mediaId = data0.data.id
      mediaId2 = data1.data.id
      // assert
      expect(result.status).toEqual(200)

      expect(data0).toBeDefined()
      expect(data0.ok).toBe(true)
      expect(data0.msg).toBeUndefined()
      expect(data0.data.id).toBeDefined()
      expect(data0.data.mediaSubType).toEqual(MEDIA_SUB_TYPES.IMAGE)
      expect(data0.data.files).toBeDefined()
      expect(data0.data.files[MEDIA_VARIANTS.SMALL]).toBeDefined()
      expect(data0.data.files[MEDIA_VARIANTS.MEDIUM]).toBeDefined()
      expect(data0.data.files[MEDIA_VARIANTS.ORIGINAL]).toBeDefined()
      expect(data0.data.files[MEDIA_VARIANTS.THUMB]).toBeDefined()

      expect(data1).toBeDefined()
      expect(data1.ok).toBe(true)
      expect(data1.msg).toBeUndefined()
      expect(data1.data.id).toBeDefined()
      expect(data1.data.mediaSubType).toEqual(MEDIA_SUB_TYPES.IMAGE)
      expect(data1.data.files).toBeDefined()
      expect(data1.data.files[MEDIA_VARIANTS.SMALL]).toBeDefined()
      expect(data1.data.files[MEDIA_VARIANTS.MEDIUM]).toBeDefined()
      expect(data1.data.files[MEDIA_VARIANTS.ORIGINAL]).toBeDefined()
      expect(data1.data.files[MEDIA_VARIANTS.THUMB]).toBeDefined()
    })

    test('should return status 200 and the uploaded file1 when successful', async () => {
      //arrange
      const request: AxiosRequestConfig = {
        headers: getGlobalAuthHeaders(),
        method: 'GET',
        url: `/api/v1/media/${mediaId}/${MEDIA_VARIANTS.THUMB}`,
        withCredentials: true,
      }

      // act
      const result = await axios.request(request)
      // assert
      expect(result).toBeDefined()
      expect(result.status).toEqual(200)
      expect(result.data).toBeDefined()
    })

    test('should return status 200 and the uploaded file2 when successful', async () => {
      //arrange
      const request: AxiosRequestConfig = {
        headers: getGlobalAuthHeaders(),
        method: 'GET',
        url: `/api/v1/media/${mediaId2}/${MEDIA_VARIANTS.THUMB}`,
        withCredentials: true,
      }

      // act
      const result = await axios.request(request)
      // assert
      expect(result).toBeDefined()
      expect(result.status).toEqual(200)
      expect(result.data).toBeDefined()
    })
  })
})
