import {
  FILE_EXTENSIONS,
  MB,
  MEDIA_SUB_TYPES,
  MEDIA_TYPE_BY_MIME_TYPE_MAP,
  MEDIA_TYPES,
  MEDIA_VARIANTS,
  MIME_TYPE_BY_SUB_TYPE,
  MIME_TYPES,
  S3_BUCKETS,
  UPLOAD_FILE_SIZES,
} from './media-shared.consts'

describe('FILE_EXTENSIONS ', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(FILE_EXTENSIONS).toBeDefined()
  })

  it('should have correct values', () => {
    // arrange
    // act
    // assert
    expect(FILE_EXTENSIONS[MEDIA_SUB_TYPES.ASSET]).toEqual(['*'])
    expect(FILE_EXTENSIONS[MEDIA_SUB_TYPES.AUDIO]).toEqual(['mp3', 'audio/mpeg'])
    expect(FILE_EXTENSIONS[MEDIA_SUB_TYPES.DOCUMENT]).toEqual(['pdf'])
    expect(FILE_EXTENSIONS[MEDIA_SUB_TYPES.IMAGE]).toEqual([
      'jpg',
      'jpeg',
      'gif',
      'png',
      'svg',
      'svgz',
    ])
    expect(FILE_EXTENSIONS[MEDIA_SUB_TYPES.PROFILE_IMAGE]).toEqual(['jpg', 'jpeg', 'png'])
    expect(FILE_EXTENSIONS[MEDIA_SUB_TYPES.VIDEO]).toEqual(['ogg', 'mp4', 'webm', 'mov'])
  })
})

describe('MB ', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(MB).toBeDefined()
  })

  it('should have correct values', () => {
    // arrange
    // act
    // assert
    expect(MB).toEqual(1048576)
  })
})

describe('MEDIA_SUB_TYPES ', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(MEDIA_SUB_TYPES).toBeDefined()
  })

  it('should have correct values', () => {
    // arrange
    // act
    // assert
    expect(MEDIA_SUB_TYPES.ASSET).toEqual('ASSET')
    expect(MEDIA_SUB_TYPES.AUDIO).toEqual('AUDIO')
    expect(MEDIA_SUB_TYPES.DOCUMENT).toEqual('DOCUMENT')
    expect(MEDIA_SUB_TYPES.IMAGE).toEqual('IMAGE')
    expect(MEDIA_SUB_TYPES.PROFILE_IMAGE).toEqual('PROFILE_IMAGE')
    expect(MEDIA_SUB_TYPES.VIDEO).toEqual('VIDEO')
  })
})

describe('MEDIA_TYPES ', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(MEDIA_TYPES).toBeDefined()
  })

  it('should have correct values', () => {
    // arrange
    // act
    // assert
    expect(MEDIA_TYPES.AUDIO).toEqual('audio')
    expect(MEDIA_TYPES.FONT).toEqual('font')
    expect(MEDIA_TYPES.GIF).toEqual('gif')
    expect(MEDIA_TYPES.ICON).toEqual('icon')
    expect(MEDIA_TYPES.IMAGE).toEqual('image')
    expect(MEDIA_TYPES.PDF).toEqual('pdf')
    expect(MEDIA_TYPES.SVG).toEqual('svg')
    expect(MEDIA_TYPES.VIDEO).toEqual('video')
  })
})

describe('MEDIA_TYPE_BY_MIME_TYPE_MAP ', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(MEDIA_TYPE_BY_MIME_TYPE_MAP).toBeDefined()
  })

  it('should have correct values', () => {
    // arrange
    // act
    // assert
    expect(MEDIA_TYPE_BY_MIME_TYPE_MAP[MIME_TYPES.AUDIO.MP3]).toEqual(MEDIA_TYPES.AUDIO)
    expect(MEDIA_TYPE_BY_MIME_TYPE_MAP[MIME_TYPES.FILE.PDF]).toEqual(MEDIA_TYPES.PDF)
    expect(MEDIA_TYPE_BY_MIME_TYPE_MAP[MIME_TYPES.FONT.OTF]).toEqual(MEDIA_TYPES.FONT)
    expect(MEDIA_TYPE_BY_MIME_TYPE_MAP[MIME_TYPES.FONT.TTF]).toEqual(MEDIA_TYPES.FONT)
    expect(MEDIA_TYPE_BY_MIME_TYPE_MAP[MIME_TYPES.IMAGE.GIF]).toEqual(MEDIA_TYPES.GIF)
    expect(MEDIA_TYPE_BY_MIME_TYPE_MAP[MIME_TYPES.IMAGE.ICON]).toEqual(MEDIA_TYPES.ICON)
    expect(MEDIA_TYPE_BY_MIME_TYPE_MAP[MIME_TYPES.IMAGE.JPG]).toEqual(MEDIA_TYPES.IMAGE)
    expect(MEDIA_TYPE_BY_MIME_TYPE_MAP[MIME_TYPES.IMAGE.PNG]).toEqual(MEDIA_TYPES.IMAGE)
    expect(MEDIA_TYPE_BY_MIME_TYPE_MAP[MIME_TYPES.IMAGE.SVG]).toEqual(MEDIA_TYPES.SVG)
    expect(MEDIA_TYPE_BY_MIME_TYPE_MAP[MIME_TYPES.VIDEO.MP4]).toEqual(MEDIA_TYPES.VIDEO)
    expect(MEDIA_TYPE_BY_MIME_TYPE_MAP[MIME_TYPES.VIDEO.MPEG]).toEqual(MEDIA_TYPES.VIDEO)
    expect(MEDIA_TYPE_BY_MIME_TYPE_MAP[MIME_TYPES.VIDEO.OGG]).toEqual(MEDIA_TYPES.VIDEO)
    expect(MEDIA_TYPE_BY_MIME_TYPE_MAP[MIME_TYPES.VIDEO.WEBM]).toEqual(MEDIA_TYPES.VIDEO)
  })
})

describe('MEDIA_VARIANTS ', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(MEDIA_VARIANTS).toBeDefined()
  })

  it('should have correct values', () => {
    // arrange
    // act
    // assert
    expect(MEDIA_VARIANTS.LARGE).toEqual('LARGE')
    expect(MEDIA_VARIANTS.MEDIUM).toEqual('MEDIUM')
    expect(MEDIA_VARIANTS.ORIGINAL).toEqual('ORIGINAL')
    expect(MEDIA_VARIANTS.SMALL).toEqual('SMALL')
    expect(MEDIA_VARIANTS.THUMB).toEqual('THUMB')
  })
})

describe('MIME_TYPES ', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(MIME_TYPES).toBeDefined()
  })

  it('should have correct values', () => {
    // arrange
    // act
    // assert
    expect(MIME_TYPES.AUDIO.MP3).toEqual('audio/mpeg')
    expect(MIME_TYPES.FILE.PDF).toEqual('application/pdf')
    expect(MIME_TYPES.FONT.OTF).toEqual('font/otf')
    expect(MIME_TYPES.FONT.TTF).toEqual('font/ttf')
    expect(MIME_TYPES.IMAGE.GIF).toEqual('image/gif')
    expect(MIME_TYPES.IMAGE.ICON).toEqual('image/vnd.microsoft.icon')
    expect(MIME_TYPES.IMAGE.JPG).toEqual('image/jpeg')
    expect(MIME_TYPES.IMAGE.PNG).toEqual('image/png')
    expect(MIME_TYPES.IMAGE.SVG).toEqual('image/svg+xml')
    expect(MIME_TYPES.VIDEO.MP4).toEqual('video/mp4')
    expect(MIME_TYPES.VIDEO.MPEG).toEqual('video/mpeg')
    expect(MIME_TYPES.VIDEO.OGG).toEqual('video/ogg')
    expect(MIME_TYPES.VIDEO.WEBM).toEqual('video/webm')
  })
})

describe('MIME_TYPE_BY_SUB_TYPE ', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(MIME_TYPE_BY_SUB_TYPE).toBeDefined()
  })

  it('should have correct values', () => {
    // arrange
    // act
    // assert
    expect(MIME_TYPE_BY_SUB_TYPE[MEDIA_SUB_TYPES.ASSET]).toEqual(['*'])
    expect(MIME_TYPE_BY_SUB_TYPE[MEDIA_SUB_TYPES.AUDIO]).toEqual([MIME_TYPES.AUDIO.MP3])
    expect(MIME_TYPE_BY_SUB_TYPE[MEDIA_SUB_TYPES.DOCUMENT]).toEqual([MIME_TYPES.FILE.PDF])
    expect(MIME_TYPE_BY_SUB_TYPE[MEDIA_SUB_TYPES.IMAGE]).toEqual([
      MIME_TYPES.IMAGE.GIF,
      MIME_TYPES.IMAGE.JPG,
      MIME_TYPES.IMAGE.PNG,
      MIME_TYPES.IMAGE.SVG,
    ])
    expect(MIME_TYPE_BY_SUB_TYPE[MEDIA_SUB_TYPES.PROFILE_IMAGE]).toEqual([
      MIME_TYPES.IMAGE.JPG,
      MIME_TYPES.IMAGE.PNG,
    ])
    expect(MIME_TYPE_BY_SUB_TYPE[MEDIA_SUB_TYPES.VIDEO]).toEqual([
      MIME_TYPES.VIDEO.MP4,
      MIME_TYPES.VIDEO.MPEG,
      MIME_TYPES.VIDEO.OGG,
      MIME_TYPES.VIDEO.WEBM,
    ])
  })
})

describe('S3_BUCKETS ', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(S3_BUCKETS).toBeDefined()
  })

  it('should have correct values', () => {
    // arrange
    // act
    // assert
    expect(S3_BUCKETS.SYS_CONTENT).toEqual('sys-content')
    expect(S3_BUCKETS.UPLOAD_TMP).toEqual('upload-tmp')
    expect(S3_BUCKETS.USER_CONTENT).toEqual('user-content')
  })
})

describe('UPLOAD_FILE_SIZES ', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(UPLOAD_FILE_SIZES).toBeDefined()
  })

  it('should have correct values', () => {
    // arrange
    // act
    // assert
    expect(UPLOAD_FILE_SIZES[0]).toEqual({ name: MEDIA_VARIANTS.ORIGINAL, width: 0 })
    expect(UPLOAD_FILE_SIZES[1]).toEqual({ name: MEDIA_VARIANTS.MEDIUM, width: 1200 })
    expect(UPLOAD_FILE_SIZES[2]).toEqual({ name: MEDIA_VARIANTS.SMALL, width: 400 })
    expect(UPLOAD_FILE_SIZES[3]).toEqual({ name: MEDIA_VARIANTS.THUMB, width: 120 })
  })
})
