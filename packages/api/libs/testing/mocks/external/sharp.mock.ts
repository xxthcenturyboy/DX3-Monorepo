/// <reference types="jest" />

/**
 * Mock for sharp image processing library
 * Provides chainable mock methods for image manipulation testing
 */

export const mockSharp = () => {
  const sharpMock = {
    blur: jest.fn().mockReturnThis(),
    emit: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis(),
    jpeg: jest.fn().mockReturnThis(),
    metadata: jest.fn().mockResolvedValue({
      channels: 3,
      density: 72,
      depth: 'uchar',
      format: 'jpeg',
      height: 600,
      space: 'srgb',
      width: 800,
    }),
    on: jest.fn().mockReturnThis(),
    once: jest.fn().mockReturnThis(),
    png: jest.fn().mockReturnThis(),
    resize: jest.fn().mockReturnThis(),
    rotate: jest.fn().mockReturnThis(),
    sharpen: jest.fn().mockReturnThis(),
    toBuffer: jest.fn().mockResolvedValue({
      data: Buffer.from('mocked-image-data'),
    }),
    toFile: jest.fn().mockResolvedValue({
      channels: 3,
      format: 'jpeg',
      height: 600,
      size: 1024,
      width: 800,
    }),
    webp: jest.fn().mockReturnThis(),
    write: jest.fn().mockReturnThis(),
  }

  jest.mock('sharp', () => jest.fn(() => sharpMock))

  return sharpMock
}

/**
 * Export mock instance for use in test assertions
 *
 * @example
 * import { sharpMock } from '../testing/mocks';
 * expect(sharpMock.resize).toHaveBeenCalledWith(200, 200);
 */
export const sharpMock = {
  jpeg: jest.fn(),
  metadata: jest.fn(),
  resize: jest.fn(),
  toBuffer: jest.fn(),
  toFile: jest.fn(),
}
