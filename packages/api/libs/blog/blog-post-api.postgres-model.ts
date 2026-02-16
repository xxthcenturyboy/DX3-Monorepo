import dayjs from 'dayjs'
import { fn, Op } from 'sequelize'
import {
  AllowNull,
  BelongsTo,
  BelongsToMany,
  Column,
  CreatedAt,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript'

import {
  BLOG_DEFAULTS,
  BLOG_POST_STATUS,
  BLOG_POST_STATUS_ARRAY,
  type GetBlogPostsAdminQueryType,
  type GetBlogPostsQueryType,
} from '@dx3/models-shared'

import { MediaModel } from '../media/media-api.postgres-model'
import { UserModel } from '../user/user-api.postgres-model'
import { BLOG_POST_POSTGRES_DB_NAME } from './blog-api.consts'
import { BlogCategoryModel } from './blog-category-api.postgres-model'
import { BlogTagModel } from './blog-tag-api.postgres-model'

@Table({
  indexes: [
    { fields: ['slug'], unique: true },
    { fields: ['status'] },
    { fields: ['author_id'] },
    { fields: ['published_at'] },
    { fields: ['scheduled_at'] },
  ],
  modelName: BLOG_POST_POSTGRES_DB_NAME,
  underscored: true,
})
export class BlogPostModel extends Model<BlogPostModel> {
  @PrimaryKey
  @Default(fn('uuid_generate_v4'))
  @AllowNull(false)
  @Column(DataType.UUID)
  id: string

  @ForeignKey(() => UserModel)
  @AllowNull(false)
  @Column({ field: 'author_id', type: DataType.UUID })
  authorId: string

  @BelongsTo(() => UserModel, 'author_id')
  author: UserModel

  @AllowNull(false)
  @Column(DataType.STRING(512))
  title: string

  @AllowNull(false)
  @Column(DataType.STRING(512))
  slug: string

  @AllowNull(false)
  @Column(DataType.TEXT)
  content: string

  @Column(DataType.TEXT)
  excerpt: string | null

  @Default(BLOG_POST_STATUS.DRAFT)
  @AllowNull(false)
  @Column({
    set(status: string): void {
      if (!(BLOG_POST_STATUS_ARRAY as readonly string[]).includes(status)) {
        throw new Error(
          `Invalid blog post status: ${status}. Allowed: ${BLOG_POST_STATUS_ARRAY.join(', ')}`,
        )
      }
      this.setDataValue('status', status)
    },
    type: DataType.STRING(32),
  })
  status: string

  @ForeignKey(() => MediaModel)
  @Column({ field: 'featured_image_id', type: DataType.UUID })
  featuredImageId: string | null

  @BelongsTo(() => MediaModel, 'featured_image_id')
  featuredImage: MediaModel

  @Default(false)
  @AllowNull(false)
  @Column({ field: 'is_anonymous', type: DataType.BOOLEAN })
  isAnonymous: boolean

  @Column({ field: 'published_at', type: DataType.DATE })
  publishedAt: Date | null

  @Column({ field: 'scheduled_at', type: DataType.DATE })
  scheduledAt: Date | null

  @Column({ field: 'canonical_url', type: DataType.STRING(512) })
  canonicalUrl: string | null

  @Column({ field: 'seo_title', type: DataType.STRING(256) })
  seoTitle: string | null

  @Column({ field: 'seo_description', type: DataType.STRING(512) })
  seoDescription: string | null

  @Default(0)
  @AllowNull(false)
  @Column({ field: 'reading_time_minutes', type: DataType.INTEGER })
  readingTimeMinutes: number

  @Column({ field: 'deleted_at', type: DataType.DATE })
  deletedAt: Date | null

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

  @BelongsToMany(() => BlogCategoryModel, {
    foreignKey: 'post_id',
    otherKey: 'category_id',
    through: 'blog_post_categories',
  })
  categories: BlogCategoryModel[]

  @BelongsToMany(() => BlogTagModel, {
    foreignKey: 'post_id',
    otherKey: 'tag_id',
    through: 'blog_post_tags',
  })
  tags: BlogTagModel[]

  /**
   * Calculate reading time from content (~200 words per minute)
   */
  static calculateReadingTime(content: string): number {
    const words = content.trim().split(/\s+/).filter(Boolean).length
    return Math.max(1, Math.ceil(words / BLOG_DEFAULTS.WORDS_PER_MINUTE))
  }

  /**
   * Generate excerpt from content if not provided
   */
  static generateExcerpt(content: string, maxLength = BLOG_DEFAULTS.EXCERPT_MAX_LENGTH): string {
    const plain = content.replace(/[#*`[\]()]/g, '').trim()
    if (plain.length <= maxLength) return plain
    return `${plain.slice(0, maxLength).trim()}...`
  }

  static async getPublishedPosts(
    params: GetBlogPostsQueryType,
  ): Promise<{ cursor: string | null; rows: BlogPostModel[] }> {
    const limit = params.limit ?? BLOG_DEFAULTS.POSTS_PER_PAGE
    const where = {
      deletedAt: null,
      publishedAt: { [Op.ne]: null },
      status: BLOG_POST_STATUS.PUBLISHED,
    }
    const cursorWhere = params.cursor ? { ...where, id: { [Op.lt]: params.cursor } } : where

    const posts = await BlogPostModel.findAll({
      include: [
        {
          as: 'author',
          attributes: ['firstName', 'id', 'lastName', 'username'],
          model: UserModel,
          required: true,
        },
        {
          as: 'categories',
          attributes: ['id', 'name', 'slug'],
          model: BlogCategoryModel,
          through: { attributes: [] },
        },
        {
          as: 'tags',
          attributes: ['id', 'name', 'slug'],
          model: BlogTagModel,
          through: { attributes: [] },
        },
      ],
      limit: limit + 1,
      order: [['publishedAt', 'DESC']],
      where: cursorWhere,
    })

    const hasMore = posts.length > limit
    const rows = hasMore ? posts.slice(0, limit) : posts
    const nextCursor = hasMore ? (rows[rows.length - 1]?.id ?? null) : null

    return { cursor: nextCursor, rows }
  }

  static async getPostBySlug(slug: string): Promise<BlogPostModel | null> {
    return BlogPostModel.findOne({
      include: [
        {
          as: 'author',
          attributes: ['firstName', 'id', 'lastName', 'username'],
          model: UserModel,
          required: true,
        },
        {
          as: 'categories',
          attributes: ['id', 'name', 'slug'],
          model: BlogCategoryModel,
          through: { attributes: [] },
        },
        {
          as: 'tags',
          attributes: ['id', 'name', 'slug'],
          model: BlogTagModel,
          through: { attributes: [] },
        },
      ],
      where: {
        deletedAt: null,
        slug,
        status: BLOG_POST_STATUS.PUBLISHED,
      },
    })
  }

  static async getRelatedPosts(
    postId: string,
    categoryIds: string[],
    tagIds: string[],
    limit: number,
  ): Promise<BlogPostModel[]> {
    if (categoryIds.length === 0 && tagIds.length === 0) {
      const result = await BlogPostModel.getPublishedPosts({ limit })
      return result.rows.slice(0, limit)
    }

    return BlogPostModel.findAll({
      include: [
        {
          as: 'author',
          attributes: ['firstName', 'id', 'lastName', 'username'],
          model: UserModel,
          required: true,
        },
        {
          as: 'categories',
          attributes: ['id', 'name', 'slug'],
          model: BlogCategoryModel,
          through: { attributes: [] },
        },
        {
          as: 'tags',
          attributes: ['id', 'name', 'slug'],
          model: BlogTagModel,
          through: { attributes: [] },
        },
      ],
      limit,
      order: [['publishedAt', 'DESC']],
      where: {
        deletedAt: null,
        id: { [Op.ne]: postId },
        status: BLOG_POST_STATUS.PUBLISHED,
        [Op.or]: [
          categoryIds.length > 0 ? { '$categories.id$': { [Op.in]: categoryIds } } : {},
          tagIds.length > 0 ? { '$tags.id$': { [Op.in]: tagIds } } : {},
        ],
      },
    })
  }

  static async getAllPosts(
    params: GetBlogPostsAdminQueryType,
  ): Promise<{ count: number; rows: BlogPostModel[] }> {
    const limit = params.limit ?? 20
    const offset = (params.offset ?? 0) * limit
    const orderBy = params.orderBy ?? 'createdAt'
    const sortDir = params.sortDir ?? 'DESC'

    const where: Record<string, unknown> = { deletedAt: null }
    if (params.status) where.status = params.status
    if (params.filterValue) {
      ;(where as Record<string, unknown>)[Op.or as unknown as string] = [
        { title: { [Op.iLike as unknown as string]: `%${params.filterValue}%` } },
        { slug: { [Op.iLike as unknown as string]: `%${params.filterValue}%` } },
      ]
    }

    const { count, rows } = await BlogPostModel.findAndCountAll({
      include: [
        {
          as: 'author',
          attributes: ['firstName', 'id', 'lastName', 'username'],
          model: UserModel,
          required: true,
        },
        {
          as: 'categories',
          attributes: ['id', 'name', 'slug'],
          model: BlogCategoryModel,
          through: { attributes: [] },
        },
        {
          as: 'tags',
          attributes: ['id', 'name', 'slug'],
          model: BlogTagModel,
          through: { attributes: [] },
        },
      ],
      limit,
      offset,
      order: [[orderBy, sortDir]],
      where,
    })

    return { count, rows }
  }

  static async getPostById(id: string): Promise<BlogPostModel | null> {
    return BlogPostModel.findByPk(id, {
      include: [
        {
          as: 'categories',
          attributes: ['id', 'name', 'slug'],
          model: BlogCategoryModel,
          through: { attributes: [] },
        },
        {
          as: 'tags',
          attributes: ['id', 'name', 'slug'],
          model: BlogTagModel,
          through: { attributes: [] },
        },
      ],
    })
  }

  /**
   * Get post by ID with author (for preview - any status, EDITOR only)
   */
  static async getPostByIdWithAuthor(id: string): Promise<BlogPostModel | null> {
    return BlogPostModel.findByPk(id, {
      include: [
        {
          as: 'author',
          attributes: ['firstName', 'id', 'lastName', 'username'],
          model: UserModel,
          required: false,
        },
        {
          as: 'categories',
          attributes: ['id', 'name', 'slug'],
          model: BlogCategoryModel,
          through: { attributes: [] },
        },
        {
          as: 'tags',
          attributes: ['id', 'name', 'slug'],
          model: BlogTagModel,
          through: { attributes: [] },
        },
      ],
    })
  }

  static async findScheduledToPublish(): Promise<BlogPostModel[]> {
    const now = dayjs().toDate()
    return BlogPostModel.findAll({
      where: {
        deletedAt: null,
        scheduledAt: { [Op.lte]: now },
        status: BLOG_POST_STATUS.SCHEDULED,
      },
    })
  }

  static async findExistingSlug(slug: string, excludeId?: string): Promise<BlogPostModel | null> {
    const where = excludeId ? { id: { [Op.ne]: excludeId }, slug } : { slug }
    return BlogPostModel.findOne({ where })
  }
}

export type BlogPostModelType = typeof BlogPostModel.prototype
