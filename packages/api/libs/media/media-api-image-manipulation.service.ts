import * as fs from 'node:fs'
import type { Readable } from 'node:stream'
import type { Metadata } from 'sharp'
import sharp from 'sharp'

import { type ImageResizeMediaType, MEDIA_VARIANTS, UPLOAD_FILE_SIZES } from '@dx3/models-shared'

import { ApiLoggingClass, type ApiLoggingClassType } from '../logger'

export class MediaApiImageManipulationService {
  logger: ApiLoggingClassType

  constructor() {
    this.logger = ApiLoggingClass.instance
  }

  private stringifyMetaForS3(meta: Metadata) {
    const metaKeys = Object.keys(meta)
    const stringified: { [key: string]: string } = {}
    for (const key of metaKeys) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      stringified[key] = typeof meta[key] !== 'string' ? String(meta[key]) : meta[key]
    }
    return stringified
  }

  public async getMetaFromBuffer(image: string | Buffer) {
    return await sharp(image)
      .metadata()
      .then((metadata) => metadata)
      .catch((err) => {
        throw err
      })
  }

  async resizeByImagePath(imagePath: string, width: number) {
    const fileContent = fs.readFileSync(imagePath)
    const result = await this.resizeByFileContent(fileContent, width)
    return result
  }

  async resizeByFileContent(fileContent: string | Buffer, width: number) {
    const { data } = await sharp(fileContent)
      .resize({
        width,
      })
      .toBuffer({
        resolveWithObject: true,
      })
    return data
  }

  async resizeImageToFiles(fileName: string, filePath: string, fileContent: Buffer) {
    const dataFiles: ImageResizeMediaType[] = []
    const originalImageMeta = await this.getMetaFromBuffer(filePath)
    const promises = UPLOAD_FILE_SIZES.map(async (fileSize) => {
      if (fileSize.name !== MEDIA_VARIANTS.ORIGINAL) {
        const width =
          originalImageMeta.width && originalImageMeta.width > fileSize.width
            ? fileSize.width
            : originalImageMeta.width
        const resizedImage = await this.resizeByFileContent(fileContent, width || 0)
        const resizedImageMeta = await this.getMetaFromBuffer(resizedImage)

        const imageData: ImageResizeMediaType = {
          asset: resizedImage,
          format: resizedImageMeta.format,
          height: resizedImageMeta.height,
          id: `${fileName}_${fileSize.name}`,
          metaData: this.stringifyMetaForS3(resizedImageMeta),
          size: resizedImageMeta.size,
          variant: fileSize.name,
          width: resizedImageMeta.width,
        }
        dataFiles.push(imageData)
      }
    })

    await Promise.all(promises)
    return dataFiles
  }

  public async resizeImageStream(fileName: string, fileContent: Readable) {
    const dataFiles: ImageResizeMediaType[] = []
    const originalBuffer = await fileContent.pipe(await sharp()).toBuffer()
    const originalImageMeta = await this.getMetaFromBuffer(originalBuffer)

    const promises = UPLOAD_FILE_SIZES.map(async (fileSize) => {
      if (fileSize.name === MEDIA_VARIANTS.ORIGINAL) {
        const imageData: ImageResizeMediaType = {
          asset: originalBuffer,
          format: originalImageMeta.format,
          height: originalImageMeta.height,
          id: `${fileName}`,
          metaData: this.stringifyMetaForS3(originalImageMeta),
          size: originalImageMeta.size,
          variant: fileSize.name,
          width: originalImageMeta.width,
        }

        dataFiles.push(imageData)
      } else {
        const width =
          originalImageMeta.width && originalImageMeta.width > fileSize.width
            ? fileSize.width
            : originalImageMeta.width
        const resizedImage = await this.resizeByFileContent(originalBuffer, width)
        // this.logSizes(originalImageMeta.size, resizedImage);
        const resizedImageMeta = await this.getMetaFromBuffer(resizedImage)

        const imageData: ImageResizeMediaType = {
          asset: resizedImage,
          format: resizedImageMeta.format,
          height: resizedImageMeta.height,
          id: `${fileName}_${fileSize.name}`,
          metaData: this.stringifyMetaForS3(resizedImageMeta),
          size: resizedImageMeta.size,
          variant: fileSize.name,
          width: resizedImageMeta.width,
        }

        dataFiles.push(imageData)
      }
    })

    await Promise.all(promises)
    return dataFiles
  }
}

export type MediaApiImageManipulationServiceType = typeof MediaApiImageManipulationService.prototype
