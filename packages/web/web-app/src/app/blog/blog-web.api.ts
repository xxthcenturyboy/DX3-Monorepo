import type {
  BlogCategoryType,
  BlogPostType,
  BlogPostWithAuthorType,
  BlogTagType,
  CreateBlogPostPayloadType,
  GetBlogPostsAdminQueryType,
  GetBlogPostsAdminResponseType,
  GetBlogPostsResponseType,
  UpdateBlogPostPayloadType,
} from '@dx3/models-shared'

import { apiWeb, getCustomHeaders } from '../data/rtk-query/web.api'

type GetPostsParams = {
  cursor?: string
  limit?: number
}

export const apiWebBlog = apiWeb.injectEndpoints({
  endpoints: (build) => ({
    createBlogPost: build.mutation<BlogPostType, CreateBlogPostPayloadType>({
      invalidatesTags: ['BlogPost'],
      query: (payload) => ({
        data: payload,
        headers: getCustomHeaders({ version: 1 }),
        method: 'POST',
        url: '/blog/admin/posts',
      }),
    }),
    getBlogAdminPostById: build.query<BlogPostType, string>({
      providesTags: (_, __, id) => [{ id, type: 'BlogPost' }],
      query: (id) => ({
        headers: getCustomHeaders({ version: 1 }),
        method: 'GET',
        url: `/blog/admin/posts/${id}`,
      }),
    }),
    getBlogAdminPosts: build.query<GetBlogPostsAdminResponseType, GetBlogPostsAdminQueryType>({
      query: (params) => {
        const search = new URLSearchParams()
        if (params?.filterValue) search.append('filterValue', params.filterValue)
        if (params?.limit) search.append('limit', String(params.limit))
        if (params?.offset) search.append('offset', String(params.offset))
        if (params?.orderBy) search.append('orderBy', params.orderBy)
        if (params?.sortDir) search.append('sortDir', params.sortDir)
        if (params?.status) search.append('status', params.status)
        const qs = search.toString()
        return {
          headers: getCustomHeaders({ version: 1 }),
          method: 'GET',
          url: qs ? `/blog/admin/posts?${qs}` : '/blog/admin/posts',
        }
      },
    }),
    getBlogCategories: build.query<BlogCategoryType[], void>({
      query: () => ({
        headers: getCustomHeaders({ version: 1 }),
        method: 'GET',
        url: '/blog/categories',
      }),
    }),
    getBlogPostBySlug: build.query<BlogPostWithAuthorType | null, string>({
      query: (slug) => ({
        headers: getCustomHeaders({ version: 1 }),
        method: 'GET',
        url: `/blog/posts/${slug}`,
      }),
    }),
    // Admin endpoints (require EDITOR role)
    getBlogPostPreview: build.query<BlogPostWithAuthorType | null, string>({
      providesTags: (_, __, id) => [{ id, type: 'BlogPost' }],
      query: (id) => ({
        headers: getCustomHeaders({ version: 1 }),
        method: 'GET',
        url: `/blog/admin/posts/${id}/preview`,
      }),
    }),
    getBlogPosts: build.query<GetBlogPostsResponseType, GetPostsParams | undefined>({
      query: (params) => {
        const search = new URLSearchParams()
        if (params?.cursor) search.append('cursor', params.cursor)
        if (params?.limit) search.append('limit', String(params.limit))
        const qs = search.toString()
        return {
          headers: getCustomHeaders({ version: 1 }),
          method: 'GET',
          url: qs ? `/blog/posts?${qs}` : '/blog/posts',
        }
      },
    }),
    getBlogRelatedPosts: build.query<BlogPostWithAuthorType[], { id: string; limit?: number }>({
      query: ({ id, limit = 3 }) => {
        const search = new URLSearchParams()
        if (limit) search.append('limit', String(limit))
        const qs = search.toString()
        return {
          headers: getCustomHeaders({ version: 1 }),
          method: 'GET',
          url: qs ? `/blog/posts/${id}/related?${qs}` : `/blog/posts/${id}/related`,
        }
      },
    }),
    getBlogTags: build.query<BlogTagType[], void>({
      query: () => ({
        headers: getCustomHeaders({ version: 1 }),
        method: 'GET',
        url: '/blog/tags',
      }),
    }),
    updateBlogPost: build.mutation<BlogPostType, { id: string; payload: UpdateBlogPostPayloadType }>({
      invalidatesTags: (_result, _error, { id }) => [{ id, type: 'BlogPost' }],
      query: ({ id, payload }) => ({
        data: payload,
        headers: getCustomHeaders({ version: 1 }),
        method: 'PUT',
        url: `/blog/admin/posts/${id}`,
      }),
    }),
  }),
  overrideExisting: true,
})

export const {
  useCreateBlogPostMutation,
  useGetBlogAdminPostByIdQuery,
  useGetBlogAdminPostsQuery,
  useGetBlogCategoriesQuery,
  useGetBlogPostBySlugQuery,
  useGetBlogPostPreviewQuery,
  useGetBlogPostsQuery,
  useGetBlogRelatedPostsQuery,
  useGetBlogTagsQuery,
  useLazyGetBlogPostsQuery,
  useUpdateBlogPostMutation,
} = apiWebBlog
