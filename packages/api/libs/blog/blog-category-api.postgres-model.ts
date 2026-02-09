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

import { BLOG_CATEGORY_POSTGRES_DB_NAME } from './blog-api.consts'

@Table({
  indexes: [
    {
      fields: ['slug'],
      unique: true,
    },
  ],
  modelName: BLOG_CATEGORY_POSTGRES_DB_NAME,
  underscored: true,
})
export class BlogCategoryModel extends Model<BlogCategoryModel> {
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

  static async getAll(): Promise<BlogCategoryModel[]> {
    return BlogCategoryModel.findAll({ order: [['name', 'ASC']] })
  }

  static async findOrCreateBySlug(slug: string, name: string): Promise<BlogCategoryModel> {
    let model = await BlogCategoryModel.findOne({ where: { slug } })
    if (!model) {
      model = await BlogCategoryModel.create({ name, slug })
    }
    return model
  }
}

export type BlogCategoryModelType = typeof BlogCategoryModel.prototype
