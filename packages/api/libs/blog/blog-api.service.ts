import dayjs from 'dayjs'

import {
  BLOG_POST_STATUS,
  type BlogCategoryType,
  type BlogPostRevisionType,
  type BlogPostStatusType,
  type BlogPostType,
  type BlogPostWithAuthorType,
  type BlogTagType,
  type CreateBlogPostPayloadType,
  type GetBlogPostsAdminQueryType,
  type GetBlogPostsAdminResponseType,
  type GetBlogPostsQueryType,
  type GetBlogPostsResponseType,
  type UpdateBlogPostPayloadType,
} from '@dx3/models-shared'
import { slugify } from '@dx3/utils-shared'

import { ApiLoggingClass, type ApiLoggingClassType } from '../logger'
import type { UserModel } from '../user/user-api.postgres-model'
import { ANONYMOUS_AUTHOR_DISPLAY_NAME } from './blog-api.consts'
import { BlogCategoryModel, type BlogCategoryModelType } from './blog-category-api.postgres-model'
import { BlogPostModel, type BlogPostModelType } from './blog-post-api.postgres-model'
import {
  BlogPostRevisionModel,
  type BlogPostRevisionModelType,
} from './blog-post-revision-api.postgres-model'
import { BlogTagModel, type BlogTagModelType } from './blog-tag-api.postgres-model'

export class BlogService {
  private logger: ApiLoggingClassType

  constructor() {
    this.logger = ApiLoggingClass.instance
  }

  /**
   * Get published posts with cursor-based pagination (public)
   */
  async getPublishedPosts(params: GetBlogPostsQueryType): Promise<GetBlogPostsResponseType> {
    const result = await BlogPostModel.getPublishedPosts(params)
    return {
      cursor: result.cursor,
      posts: result.rows.map((p) => this.mapPostWithAuthor(p)),
    }
  }

  /**
   * Get single published post by slug (public)
   */
  async getPostBySlug(slug: string): Promise<BlogPostWithAuthorType | null> {
    const post = await BlogPostModel.getPostBySlug(slug)
    return post ? this.mapPostWithAuthor(post) : null
  }

  /**
   * Get related posts by shared categories/tags
   */
  async getRelatedPosts(postId: string, limit = 3): Promise<BlogPostWithAuthorType[]> {
    const post = await BlogPostModel.findByPk(postId, {
      include: [
        {
          as: 'categories',
          attributes: ['id'],
          model: BlogCategoryModel,
          through: { attributes: [] },
        },
        { as: 'tags', attributes: ['id'], model: BlogTagModel, through: { attributes: [] } },
      ],
    })

    if (!post) return []

    const categoryIds = post.categories?.map((c) => c.id) ?? []
    const tagIds = post.tags?.map((t) => t.id) ?? []

    const related = await BlogPostModel.getRelatedPosts(postId, categoryIds, tagIds, limit)
    return related.map((p) => this.mapPostWithAuthor(p))
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<BlogCategoryType[]> {
    const rows = await BlogCategoryModel.getAll()
    return rows.map((r) => this.mapCategory(r))
  }

  /**
   * Get all tags
   */
  async getTags(): Promise<BlogTagType[]> {
    const rows = await BlogTagModel.getAll()
    return rows.map((r) => this.mapTag(r))
  }

  /**
   * Get all posts for admin with filters
   */
  async getAllPosts(params: GetBlogPostsAdminQueryType): Promise<GetBlogPostsAdminResponseType> {
    const result = await BlogPostModel.getAllPosts(params)
    return {
      count: result.count,
      rows: result.rows.map((p) => this.mapPost(p)),
    }
  }

  /**
   * Get single post by ID for editing (admin)
   */
  async getPostById(id: string): Promise<BlogPostType | null> {
    const post = await BlogPostModel.getPostById(id)
    return post && !post.deletedAt ? this.mapPost(post) : null
  }

  /**
   * Get post by ID for preview (any status, includes author - EDITOR only)
   */
  async getPostForPreview(id: string): Promise<BlogPostWithAuthorType | null> {
    const post = await BlogPostModel.getPostByIdWithAuthor(id)
    return post && !post.deletedAt ? this.mapPostWithAuthor(post) : null
  }

  /**
   * Create new draft post
   */
  async createPost(authorId: string, payload: CreateBlogPostPayloadType): Promise<BlogPostType> {
    const slug = await this.generateSlug(payload.title)
    const readingTime = BlogPostModel.calculateReadingTime(payload.content)
    const excerpt = payload.excerpt ?? BlogPostModel.generateExcerpt(payload.content)

    const categoryIds = await this.resolveCategoryIds(payload.categories ?? [])
    const tagIds = await this.resolveTagIds(payload.tags ?? [])

    const post = await BlogPostModel.create({
      authorId,
      content: payload.content,
      excerpt: excerpt || null,
      featuredImageId: payload.featuredImageId ?? null,
      isAnonymous: payload.isAnonymous ?? false,
      readingTimeMinutes: readingTime,
      slug,
      status: BLOG_POST_STATUS.DRAFT,
      title: payload.title,
    })

    await (
      post as BlogPostModel & { setCategories: (ids: string[]) => Promise<void> }
    ).setCategories(categoryIds)
    await (post as BlogPostModel & { setTags: (ids: string[]) => Promise<void> }).setTags(tagIds)

    const saved = await this.getPostById(post.id)
    if (!saved) throw new Error('Failed to create post')
    return saved
  }

  /**
   * Update post and create revision
   */
  async updatePost(
    id: string,
    editorId: string,
    payload: UpdateBlogPostPayloadType,
  ): Promise<BlogPostType> {
    const post = await BlogPostModel.findByPk(id)

    if (!post || post.deletedAt) {
      throw new Error('Post not found')
    }

    await BlogPostRevisionModel.create({
      content: post.content,
      editorId,
      excerpt: post.excerpt,
      postId: id,
      title: post.title,
    })

    const updates: Partial<BlogPostModelType> = {}

    if (payload.title !== undefined) updates.title = payload.title
    if (payload.content !== undefined) {
      updates.content = payload.content
      updates.readingTimeMinutes = BlogPostModel.calculateReadingTime(payload.content)
    }
    if (payload.excerpt !== undefined) updates.excerpt = payload.excerpt
    if (payload.featuredImageId !== undefined) updates.featuredImageId = payload.featuredImageId
    if (payload.isAnonymous !== undefined) updates.isAnonymous = payload.isAnonymous
    if (payload.seoTitle !== undefined) updates.seoTitle = payload.seoTitle
    if (payload.seoDescription !== undefined) updates.seoDescription = payload.seoDescription
    if (payload.canonicalUrl !== undefined) updates.canonicalUrl = payload.canonicalUrl
    if (payload.slug !== undefined) {
      const existing = await BlogPostModel.findExistingSlug(payload.slug, id)
      if (existing) throw new Error('Slug already in use')
      updates.slug = payload.slug
    }

    await post.update(updates)

    if (payload.categories !== undefined) {
      const categoryIds = await this.resolveCategoryIds(payload.categories)
      await (
        post as BlogPostModel & { setCategories: (ids: string[]) => Promise<void> }
      ).setCategories(categoryIds)
    }
    if (payload.tags !== undefined) {
      const tagIds = await this.resolveTagIds(payload.tags)
      await (post as BlogPostModel & { setTags: (ids: string[]) => Promise<void> }).setTags(tagIds)
    }

    const saved = await this.getPostById(id)
    if (!saved) throw new Error('Failed to update post')
    return saved
  }

  /**
   * Soft delete post
   */
  async deletePost(id: string): Promise<void> {
    const post = await BlogPostModel.findByPk(id)
    if (!post || post.deletedAt) throw new Error('Post not found')
    await post.update({ deletedAt: dayjs().toDate() })
  }

  /**
   * Publish post immediately
   */
  async publishPost(id: string): Promise<BlogPostType> {
    const post = await BlogPostModel.findByPk(id)
    if (!post || post.deletedAt) throw new Error('Post not found')

    await post.update({
      publishedAt: dayjs().toDate(),
      scheduledAt: null,
      status: BLOG_POST_STATUS.PUBLISHED,
    })

    const saved = await this.getPostById(id)
    if (!saved) throw new Error('Failed to publish post')
    return saved
  }

  /**
   * Schedule post for future publish
   */
  async schedulePost(id: string, scheduledAt: Date): Promise<BlogPostType> {
    const post = await BlogPostModel.findByPk(id)
    if (!post || post.deletedAt) throw new Error('Post not found')
    if (!dayjs(scheduledAt).isAfter(dayjs()))
      throw new Error('Scheduled time must be in the future')

    await post.update({
      scheduledAt,
      status: BLOG_POST_STATUS.SCHEDULED,
    })

    const saved = await this.getPostById(id)
    if (!saved) throw new Error('Failed to schedule post')
    return saved
  }

  /**
   * Get revision history for a post
   */
  async getRevisions(postId: string): Promise<BlogPostRevisionType[]> {
    const rows = await BlogPostRevisionModel.getByPostId(postId)

    return rows.map((r: BlogPostRevisionModelType & { editor?: UserModel }) => ({
      content: r.content,
      createdAt: r.createdAt,
      editorId: r.editorId,
      excerpt: r.excerpt,
      id: r.id,
      postId: r.postId,
      title: r.title,
    }))
  }

  /**
   * Restore post from revision (creates new revision with restored content)
   */
  async restoreRevision(
    postId: string,
    revisionId: string,
    editorId: string,
  ): Promise<BlogPostType> {
    const revision = await BlogPostRevisionModel.findOne({
      where: { id: revisionId, postId },
    })

    if (!revision) throw new Error('Revision not found')

    return this.updatePost(postId, editorId, {
      content: revision.content,
      excerpt: revision.excerpt ?? undefined,
      title: revision.title,
    })
  }

  /**
   * Process scheduled posts (run via cron every minute)
   */
  async processScheduledPosts(): Promise<number> {
    const posts = await BlogPostModel.findScheduledToPublish()
    const now = dayjs().toDate()

    for (const post of posts) {
      await post.update({
        publishedAt: now,
        scheduledAt: null,
        status: BLOG_POST_STATUS.PUBLISHED,
      })
      this.logger.logInfo(`BlogService: Published scheduled post ${post.id} (${post.slug})`)
    }

    return posts.length
  }

  /**
   * Generate unique slug from title
   */
  async generateSlug(title: string, existingSlug?: string): Promise<string> {
    const base = slugify(title) || 'untitled'
    let slug = base
    let counter = 1

    while (true) {
      const existing = await BlogPostModel.findExistingSlug(slug)
      if (!existing || (existingSlug && existing.slug === existingSlug)) {
        return slug
      }
      slug = `${base}-${counter++}`
    }
  }

  private async resolveCategoryIds(namesOrIds: string[]): Promise<string[]> {
    const ids: string[] = []

    for (const item of namesOrIds) {
      if (/^[0-9a-f-]{36}$/i.test(item)) {
        ids.push(item)
      } else {
        const itemSlug = slugify(item)
        const cat = await BlogCategoryModel.findOrCreateBySlug(itemSlug, item)
        ids.push(cat.id)
      }
    }

    return ids
  }

  private async resolveTagIds(namesOrIds: string[]): Promise<string[]> {
    const ids: string[] = []

    for (const item of namesOrIds) {
      if (/^[0-9a-f-]{36}$/i.test(item)) {
        ids.push(item)
      } else {
        const itemSlug = slugify(item)
        const tag = await BlogTagModel.findOrCreateBySlug(itemSlug, item)
        ids.push(tag.id)
      }
    }

    return ids
  }

  private getAuthorDisplayName(
    post: BlogPostModelType & { author?: UserModel },
    isAnonymous: boolean,
  ): string {
    if (isAnonymous) return ANONYMOUS_AUTHOR_DISPLAY_NAME
    const author = post.author
    if (!author) return ANONYMOUS_AUTHOR_DISPLAY_NAME
    const full = [author.firstName, author.lastName].filter(Boolean).join(' ')
    return full || author.username || ANONYMOUS_AUTHOR_DISPLAY_NAME
  }

  private mapPost(
    post: BlogPostModelType & { categories?: BlogCategoryModel[]; tags?: BlogTagModel[] },
  ): BlogPostType {
    return {
      authorId: post.authorId,
      canonicalUrl: post.canonicalUrl,
      categories: (post.categories ?? []).map((c) => this.mapCategory(c)),
      content: post.content,
      createdAt: post.createdAt,
      excerpt: post.excerpt,
      featuredImageId: post.featuredImageId,
      id: post.id,
      isAnonymous: post.isAnonymous,
      publishedAt: post.publishedAt,
      readingTimeMinutes: post.readingTimeMinutes,
      scheduledAt: post.scheduledAt,
      seoDescription: post.seoDescription,
      seoTitle: post.seoTitle,
      slug: post.slug,
      status: post.status as BlogPostStatusType,
      tags: (post.tags ?? []).map((t) => this.mapTag(t)),
      title: post.title,
      updatedAt: post.updatedAt,
    }
  }

  private mapPostWithAuthor(
    post: BlogPostModelType & {
      author?: UserModel
      categories?: BlogCategoryModel[]
      tags?: BlogTagModel[]
    },
  ): BlogPostWithAuthorType {
    const base = this.mapPost(post)
    return {
      ...base,
      authorDisplayName: this.getAuthorDisplayName(post, post.isAnonymous),
    }
  }

  private mapCategory(r: BlogCategoryModelType): BlogCategoryType {
    return { id: r.id, name: r.name, slug: r.slug }
  }

  private mapTag(r: BlogTagModelType): BlogTagType {
    return { id: r.id, name: r.name, slug: r.slug }
  }
}
