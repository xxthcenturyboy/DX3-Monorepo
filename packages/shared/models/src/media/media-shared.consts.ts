export const MB = 1048576

/** Max file size in bytes for media uploads. API enforces this limit. */
export const MEDIA_MAX_FILE_SIZE_BYTES = 250 * MB

/** Max number of files per upload (e.g. media upload modal supports up to 5). */
export const MEDIA_MAX_FILES_PER_UPLOAD = 10

export const MEDIA_SUB_TYPES = {
  ASSET: 'ASSET',
  AUDIO: 'AUDIO',
  DOCUMENT: 'DOCUMENT',
  IMAGE: 'IMAGE',
  PROFILE_IMAGE: 'PROFILE_IMAGE',
  VIDEO: 'VIDEO',
}

export const MEDIA_TYPES = {
  AUDIO: 'audio',
  FONT: 'font',
  GIF: 'gif',
  ICON: 'icon',
  IMAGE: 'image',
  PDF: 'pdf',
  SVG: 'svg',
  VIDEO: 'video',
}

export const MIME_TYPES = {
  AUDIO: {
    MP3: 'audio/mpeg',
  },
  FILE: {
    PDF: 'application/pdf',
  },
  FONT: {
    OTF: 'font/otf',
    TTF: 'font/ttf',
  },
  IMAGE: {
    GIF: 'image/gif',
    ICON: 'image/vnd.microsoft.icon',
    JPG: 'image/jpeg',
    PNG: 'image/png',
    SVG: 'image/svg+xml',
    WEBP: 'image/webp',
  },
  VIDEO: {
    MP4: 'video/mp4',
    MPEG: 'video/mpeg',
    OGG: 'video/ogg',
    WEBM: 'video/webm',
  },
}

export const MIME_TYPE_BY_SUB_TYPE = {
  [MEDIA_SUB_TYPES.ASSET]: ['*'],
  [MEDIA_SUB_TYPES.AUDIO]: [MIME_TYPES.AUDIO.MP3],
  [MEDIA_SUB_TYPES.DOCUMENT]: [MIME_TYPES.FILE.PDF],
  [MEDIA_SUB_TYPES.IMAGE]: [
    MIME_TYPES.IMAGE.GIF,
    MIME_TYPES.IMAGE.JPG,
    MIME_TYPES.IMAGE.PNG,
    MIME_TYPES.IMAGE.SVG,
    MIME_TYPES.IMAGE.WEBP,
  ],
  [MEDIA_SUB_TYPES.PROFILE_IMAGE]: [MIME_TYPES.IMAGE.JPG, MIME_TYPES.IMAGE.PNG],
  [MEDIA_SUB_TYPES.VIDEO]: [
    MIME_TYPES.VIDEO.MP4,
    MIME_TYPES.VIDEO.MPEG,
    MIME_TYPES.VIDEO.OGG,
    MIME_TYPES.VIDEO.WEBM,
  ],
}

export const MEDIA_VARIANTS = {
  LARGE: 'LARGE',
  MEDIUM: 'MEDIUM',
  ORIGINAL: 'ORIGINAL',
  SMALL: 'SMALL',
  THUMB: 'THUMB',
}

export const MEDIA_TYPE_BY_MIME_TYPE_MAP = {
  [MIME_TYPES.AUDIO.MP3]: MEDIA_TYPES.AUDIO,
  [MIME_TYPES.FILE.PDF]: MEDIA_TYPES.PDF,
  [MIME_TYPES.FONT.OTF]: MEDIA_TYPES.FONT,
  [MIME_TYPES.FONT.TTF]: MEDIA_TYPES.FONT,
  [MIME_TYPES.IMAGE.GIF]: MEDIA_TYPES.GIF,
  [MIME_TYPES.IMAGE.ICON]: MEDIA_TYPES.ICON,
  [MIME_TYPES.IMAGE.JPG]: MEDIA_TYPES.IMAGE,
  [MIME_TYPES.IMAGE.PNG]: MEDIA_TYPES.IMAGE,
  [MIME_TYPES.IMAGE.SVG]: MEDIA_TYPES.SVG,
  [MIME_TYPES.IMAGE.WEBP]: MEDIA_TYPES.IMAGE,
  [MIME_TYPES.VIDEO.MP4]: MEDIA_TYPES.VIDEO,
  [MIME_TYPES.VIDEO.MPEG]: MEDIA_TYPES.VIDEO,
  [MIME_TYPES.VIDEO.OGG]: MEDIA_TYPES.VIDEO,
  [MIME_TYPES.VIDEO.WEBM]: MEDIA_TYPES.VIDEO,
}

export const FILE_EXTENSIONS = {
  [MEDIA_SUB_TYPES.ASSET]: ['*'],
  [MEDIA_SUB_TYPES.AUDIO]: ['mp3', 'audio/mpeg'],
  [MEDIA_SUB_TYPES.DOCUMENT]: ['pdf'],
  [MEDIA_SUB_TYPES.IMAGE]: ['jpg', 'jpeg', 'gif', 'png', 'svg', 'svgz'],
  [MEDIA_SUB_TYPES.PROFILE_IMAGE]: ['jpg', 'jpeg', 'png'],
  [MEDIA_SUB_TYPES.VIDEO]: ['ogg', 'mp4', 'webm', 'mov'],
}

export const S3_BUCKETS = {
  SYS_CONTENT: 'sys-content',
  UPLOAD_TMP: 'upload-tmp',
  USER_CONTENT: 'user-content',
}

export const UPLOAD_FILE_SIZES = [
  {
    name: MEDIA_VARIANTS.ORIGINAL,
    width: 0, // keeps original size
  },
  // {
  //   name: MEDIA_VARIANTS.LARGE,
  //   width: 4000
  // },
  {
    name: MEDIA_VARIANTS.MEDIUM,
    width: 1200,
  },
  {
    name: MEDIA_VARIANTS.SMALL,
    width: 400,
  },
  {
    name: MEDIA_VARIANTS.THUMB,
    width: 120,
  },
]
