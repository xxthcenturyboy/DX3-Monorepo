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

import { BLOG_TAG_POSTGRES_DB_NAME } from './blog-api.consts'

@Table({
  indexes: [
    {
      fields: ['slug'],
      unique: true,
    },
  ],
  modelName: BLOG_TAG_POSTGRES_DB_NAME,
  underscored: true,
})
export class BlogTagModel extends Model<BlogTagModel> {
  @PrimaryKey
  @Default(fn('uuid_generate_v4'))
  @AllowNull(false)
  @Column(DataType.UUID)
  id: string

  @AllowNull(false)
  @Column(DataType.STRING(128))
  name: string

  @AllowNull(false)
  @Column(DataType.STRING(128))
  slug: string

  @CreatedAt
  @Default(fn('now'))
  @AllowNull(false)
  @Column({ field: 'created_at', type: DataType.DATE })
  createdAt: Date

  @UpdatedAt
  @Default(fn('now'))
  @AllowNull(false)
  @Column({ field: 'updated_at', type: DataType.DATE })
  updatedAt: Date

  static async getAll(): Promise<BlogTagModel[]> {
    return BlogTagModel.findAll({ order: [['name', 'ASC']] })
  }

  static async findOrCreateBySlug(slug: string, name: string): Promise<BlogTagModel> {
    let model = await BlogTagModel.findOne({ where: { slug } })
    if (!model) {
      model = await BlogTagModel.create({ name, slug })
    }
    return model
  }
}

export type BlogTagModelType = typeof BlogTagModel.prototype
