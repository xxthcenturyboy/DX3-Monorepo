import { fn } from 'sequelize'
import {
  AllowNull,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript'

import { UserModel } from '../user/user-api.postgres-model'
import { BLOG_POST_REVISION_POSTGRES_DB_NAME } from './blog-api.consts'
import { BlogPostModel } from './blog-post-api.postgres-model'

@Table({
  createdAt: true,
  indexes: [{ fields: ['post_id'] }],
  modelName: BLOG_POST_REVISION_POSTGRES_DB_NAME,
  underscored: true,
  updatedAt: false,
})
export class BlogPostRevisionModel extends Model<BlogPostRevisionModel> {
  @PrimaryKey
  @Default(fn('uuid_generate_v4'))
  @AllowNull(false)
  @Column(DataType.UUID)
  id: string

  @ForeignKey(() => BlogPostModel)
  @AllowNull(false)
  @Column({ field: 'post_id', type: DataType.UUID })
  postId: string

  @BelongsTo(() => BlogPostModel, 'post_id')
  post: BlogPostModel

  @ForeignKey(() => UserModel)
  @AllowNull(false)
  @Column({ field: 'editor_id', type: DataType.UUID })
  editorId: string

  @BelongsTo(() => UserModel, 'editor_id')
  editor: UserModel

  @AllowNull(false)
  @Column(DataType.STRING(512))
  title: string

  @AllowNull(false)
  @Column(DataType.TEXT)
  content: string

  @Column(DataType.TEXT)
  excerpt: string | null

  @CreatedAt
  @Default(fn('now'))
  @AllowNull(false)
  @Column({ field: 'created_at', type: DataType.DATE })
  createdAt: Date

  static async getByPostId(postId: string): Promise<BlogPostRevisionModel[]> {
    return BlogPostRevisionModel.findAll({
      include: [
        {
          as: 'editor',
          attributes: ['firstName', 'id', 'lastName', 'username'],
          model: UserModel,
          required: true,
        },
      ],
      order: [['createdAt', 'DESC']],
      where: { postId },
    })
  }
}

export type BlogPostRevisionModelType = typeof BlogPostRevisionModel.prototype
