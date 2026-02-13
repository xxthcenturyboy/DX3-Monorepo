import { fn } from 'sequelize'
import {
  AllowNull,
  Column,
  CreatedAt,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript'

import { MEDIA_SUB_TYPES, type MediaFileType } from '@dx3/models-shared'
import { parseJson } from '@dx3/utils-shared'

import { MEDIA_API_POSTGRES_DB_NAME } from './media-api.consts'

@Table({
  indexes: [
    {
      fields: ['media_sub_type'],
      name: 'media_sub_type_index',
    },
    {
      fields: ['owner_id'],
      name: 'media_owner_id_index',
    },
    {
      fields: ['primary', { name: 'media_sub_type' }],
      name: 'media_sub_type_primary_index',
    },
  ],
  modelName: MEDIA_API_POSTGRES_DB_NAME,
  underscored: true,
})
export class MediaModel extends Model<MediaModel> {
  @PrimaryKey
  @AllowNull(false)
  @Column(DataType.UUID)
  id: string

  @Column({
    field: 'alt_text',
    type: DataType.STRING,
  })
  altText: string

  @Column({
    field: 'media_sub_type',
    type: DataType.STRING,
  })
  mediaSubType: string

  @Column({
    field: 'media_type',
    type: DataType.STRING,
  })
  mediaType: string

  @Column({
    field: 'files',
    type: DataType.JSONB,
  })
  files: {
    [variant: string]: MediaFileType
  }

  @Column({
    field: 'hashed_filename_mimetype',
    type: DataType.STRING,
  })
  hashedFilenameMimeType: string

  @Column({
    field: 'original_file_name',
    type: DataType.STRING,
  })
  originalFileName: string

  @Column({
    field: 'owner_id',
    type: DataType.STRING,
  })
  ownerId: string

  @Column(DataType.BOOLEAN)
  primary: boolean

  @Column({
    allowNull: false,
    defaultValue: false,
    field: 'public',
    type: DataType.BOOLEAN,
  })
  public: boolean

  @CreatedAt
  @Default(fn('now'))
  @AllowNull(false)
  @Column({ field: 'created_at', type: DataType.DATE })
  createdAt: Date

  @Column({ field: 'deleted_at', type: DataType.DATE })
  deletedAt: Date | null

  @UpdatedAt
  @Default(fn('now'))
  @AllowNull(false)
  @Column({ field: 'updated_at', type: DataType.DATE })
  updatedAt: Date

  parseFiles(): void {
    if (this.files) {
      this.files = parseJson<{
        [variant: string]: MediaFileType
      }>(this.files as unknown as string)
    }
  }

  static async findAllByOwnerId(ownerId: string): Promise<MediaModelType[]> {
    return await MediaModel.findAll({
      where: {
        deletedAt: null,
        ownerId,
      },
    })
  }

  static async findPrimaryProfile(ownerId: string): Promise<MediaModelType> {
    return await MediaModel.findOne({
      where: {
        deletedAt: null,
        mediaSubType: MEDIA_SUB_TYPES.PROFILE_IMAGE,
        ownerId,
        primary: true,
      },
    })
  }

  static async findAllProfileByOwnerId(ownerId: string): Promise<MediaModelType[]> {
    return await MediaModel.findAll({
      where: {
        deletedAt: null,
        mediaSubType: MEDIA_SUB_TYPES.PROFILE_IMAGE,
        ownerId,
      },
    })
  }
}

export type MediaModelType = typeof MediaModel.prototype
