import { Readable } from 'node:stream'
import type { Metadata } from 'sharp'

import { type ImageResizeMediaType, MEDIA_VARIANTS } from '@dx3/models-shared'

import { ApiLoggingClass } from '../logger'
import { MediaApiImageManipulationService } from './media-api-image-manipulation.service'

jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))
// jest.mock('sharp');

describe('MediaApiImageManipulationService', () => {
  beforeAll(() => {
    new ApiLoggingClass({ appName: 'TEST' })
  })

  afterAll(() => {
    jest.clearAllMocks()
  })

  it('should exist when imported', () => {
    expect(MediaApiImageManipulationService).toBeDefined()
  })

  it('should instantiate when called', () => {
    // arrange
    // act
    const service = new MediaApiImageManipulationService()
    // assert
    expect(service).toBeDefined()
  })

  it('should return format: "jpeg" when getMetaFromBuffer is called', async () => {
    // arrange
    const imageBuffer = Buffer.from('image-data')
    const service = new MediaApiImageManipulationService()
    // act
    const result = (await service.getMetaFromBuffer(imageBuffer)) as Metadata
    // assert
    expect(result).toBeDefined()
    expect(result.format).toEqual('jpeg')
  })

  it('should return "mocked-image-data" when resizeByFileContent is called', async () => {
    // arrange
    const service = new MediaApiImageManipulationService()
    const imageBuffer = Buffer.from('image-data')
    // act
    const result = await service.resizeByFileContent(imageBuffer, 60)
    // assert
    expect(result).toBeDefined()
    expect(result.toString()).toEqual('mocked-image-data')
  })

  it('should return an array of 4 resized objects and meta when resizeImageStream is called', async () => {
    // arrange
    const testFileName = 'test-file-name'
    const service = new MediaApiImageManipulationService()
    const mockedStream = new Readable()
    mockedStream._read = (_size) => null
    // act
    const result = (await service.resizeImageStream(
      testFileName,
      mockedStream,
    )) as ImageResizeMediaType[]
    // console.log('result', result);
    // assert
    expect(result).toBeDefined()
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBe(4)
    // @ts-expect-error - not typed for test
    expect(result[0].asset.data.toString()).toEqual('mocked-image-data')
    expect(result[0].id).toEqual(testFileName)
    expect(result[0].metaData.format).toEqual('jpeg')
    expect(result[0].variant).toEqual(MEDIA_VARIANTS.ORIGINAL)

    expect(result[1].asset.toString()).toEqual('mocked-image-data')
    expect(result[1].id).toEqual(`${testFileName}_${MEDIA_VARIANTS.MEDIUM}`)
    expect(result[1].metaData.format).toEqual('jpeg')
    expect(result[1].variant).toEqual(MEDIA_VARIANTS.MEDIUM)

    expect(result[2].asset.toString()).toEqual('mocked-image-data')
    expect(result[2].id).toEqual(`${testFileName}_${MEDIA_VARIANTS.SMALL}`)
    expect(result[2].metaData.format).toEqual('jpeg')
    expect(result[2].variant).toEqual(MEDIA_VARIANTS.SMALL)

    expect(result[3].asset.toString()).toEqual('mocked-image-data')
    expect(result[3].id).toEqual(`${testFileName}_${MEDIA_VARIANTS.THUMB}`)
    expect(result[3].metaData.format).toEqual('jpeg')
    expect(result[3].variant).toEqual(MEDIA_VARIANTS.THUMB)
  })
})
