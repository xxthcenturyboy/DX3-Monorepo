# Database-Driven Blog CMS Implementation Plan

## Overview

Implement a full-featured blog/news CMS with database-driven content, markdown rendering, role-based authorship (editor role), draft/scheduling/revision support, and an admin UI - all integrated with the existing SSR infrastructure.

## Requirements Summary

### Content & Structure
| Requirement | Decision |
|-------------|----------|
| Post slugs | Auto-generated from title with manual override |
| Categories | Flat (single-level, no hierarchy) |
| Tags | Flat (many-to-many with posts) |
| Featured images | Optional (not required for publishing) |
| Post excerpts | Auto-generated from first ~200 chars, with manual override |
| Reading time | Calculated and displayed |
| URL structure | `/blog/:slug` |

### Authorship & Permissions
| Requirement | Decision |
|-------------|----------|
| Role model | Single "editor" role with full blog access |
| Author attribution | Author's choice per post (show name or anonymous) |
| Anonymous display | Shows "DX3 Team" when anonymous |

### Revisions & Scheduling
| Requirement | Decision |
|-------------|----------|
| Revision retention | Unlimited (keep all history) |
| Scheduled posts | node-cron background job within API process |

### Public Display
| Requirement | Decision |
|-------------|----------|
| Pagination | Infinite scroll |
| Posts per load | 5 posts |
| Related posts | Yes, based on shared categories + tags |
| Comments | Deferred to future phase |

### Media & SEO
| Requirement | Decision |
|-------------|----------|
| Images in content | Both Media API (S3) and external URLs allowed |
| SEO fields | Title, description, canonical URL override |

## Implementation Todos

| ID | Task | Status |
|----|------|--------|
| shared-types | Create shared blog types and constants in packages/shared/models/src/blog/ | Pending |
| db-models | Create Postgres models for blog_posts, revisions, categories, tags | Pending |
| db-migration | Create database migration script for blog tables | Pending |
| api-service | Implement BlogService with CRUD, publishing, scheduling, and revision methods | Pending |
| api-routes | Create public and admin API routes for blog operations | Pending |
| scheduler | Implement node-cron job for publishing scheduled posts | Pending |
| ssr-loaders | Add SSR loaders to ssr.routes.tsx for /blog and /blog/:slug | Pending |
| public-components | Refactor blog components with markdown rendering, infinite scroll, related posts | Pending |
| admin-routes | Add blog admin routes to admin.router.tsx | Pending |
| admin-ui | Build admin UI: post list, markdown editor, settings, revisions | Pending |
| rtk-api | Create RTK Query endpoints for blog admin operations | Pending |
| i18n | Add all blog-related i18n strings to en.json | Pending |

## Architecture Overview

```mermaid
flowchart TB
    subgraph web [Web App - SSR]
        BlogList["/blog - Post List"]
        BlogPost["/blog/:slug - Single Post"]
        AdminBlog["/admin/blog - Management UI"]
    end

    subgraph api [API Server]
        BlogRoutes[Blog Routes]
        BlogService[Blog Service]
        BlogModel[Blog Postgres Model]
    end

    subgraph db [PostgreSQL]
        PostsTable[blog_posts]
        RevisionsTable[blog_post_revisions]
        CategoriesTable[blog_categories]
        TagsTable[blog_tags]
    end

    BlogList -->|SSR Loader| BlogRoutes
    BlogPost -->|SSR Loader| BlogRoutes
    AdminBlog -->|RTK Query| BlogRoutes
    BlogRoutes --> BlogService
    BlogService --> BlogModel
    BlogModel --> PostsTable
    BlogModel --> RevisionsTable
    BlogModel --> CategoriesTable
    BlogModel --> TagsTable
```

## Phase 1: Shared Types and Constants

Create shared blog types in `packages/shared/models/src/blog/`:

- `blog-shared.types.ts` - BlogPost, BlogCategory, BlogTag, BlogRevision types
- `blog-shared.consts.ts` - Post status enum (DRAFT, SCHEDULED, PUBLISHED, ARCHIVED), role constants

Key types:

```typescript
type BlogPostStatus = 'draft' | 'published' | 'scheduled' | 'archived'

type BlogPostType = {
  authorId: string
  canonicalUrl: string | null        // SEO: canonical URL override
  categories: BlogCategoryType[]
  content: string                    // Markdown content
  createdAt: Date
  excerpt: string | null             // Manual excerpt (auto-generated if null)
  featuredImageId: string | null     // Optional featured image
  id: string
  isAnonymous: boolean               // Author's choice: show name or "DX3 Team"
  publishedAt: Date | null
  readingTimeMinutes: number         // Calculated from content length
  scheduledAt: Date | null
  seoDescription: string | null
  seoTitle: string | null
  slug: string                       // Auto-generated with manual override
  status: BlogPostStatus
  tags: BlogTagType[]
  title: string
  updatedAt: Date
}

type BlogCategoryType = {
  id: string
  name: string
  slug: string
}

type BlogTagType = {
  id: string
  name: string
  slug: string
}

type BlogPostRevisionType = {
  content: string
  createdAt: Date
  editorId: string                   // Who made this revision
  excerpt: string | null
  id: string
  postId: string
  title: string
}
```

## Phase 2: Database Layer (API)

### 2.1 Postgres Models

Create in `packages/api/libs/blog/`:

| Model | Table | Purpose |
|-------|-------|---------|
| `BlogPostModel` | `blog_posts` | Main posts table with status, scheduling, SEO fields |
| `BlogPostRevisionModel` | `blog_post_revisions` | Version history for each post |
| `BlogCategoryModel` | `blog_categories` | Post categories (hierarchical) |
| `BlogTagModel` | `blog_tags` | Post tags (flat) |
| `BlogPostTagModel` | `blog_post_tags` | Many-to-many junction |
| `BlogPostCategoryModel` | `blog_post_categories` | Many-to-many junction |

### 2.2 Migration Script

Create migration in `packages/api/libs/pg/migrations/scripts/`:

- `YYYYMMDDHHMMSS-create-blog-tables.js` - Creates all blog tables with indexes

### 2.3 Blog Service

Create `packages/api/libs/blog/blog-api.service.ts`:

**Public Methods:**
- `getPublishedPosts(cursor, limit)` - Cursor-based pagination for infinite scroll (5 posts default)
- `getPostBySlug(slug)` - Single post with author info for SSR
- `getRelatedPosts(postId, limit)` - Posts sharing categories/tags (exclude current)
- `getCategories()` - All categories
- `getTags()` - All tags

**Admin Methods:**
- `getAllPosts(filters, sort, cursor)` - All posts with status filter, sorted by createdAt desc
- `createPost(data, authorId)` - Create draft with auto-generated slug
- `updatePost(id, data, editorId)` - Update and create revision
- `deletePost(id)` - Soft delete
- `publishPost(id)` - Change status to published, set publishedAt
- `schedulePost(id, scheduledAt)` - Set status to scheduled
- `getRevisions(postId)` - Get revision history
- `restoreRevision(postId, revisionId, editorId)` - Restore from history (creates new revision)

**Utility Methods:**
- `generateSlug(title, existingSlug?)` - Create unique slug from title
- `calculateReadingTime(content)` - ~200 words per minute
- `generateExcerpt(content, maxLength)` - First ~200 chars if no manual excerpt

### 2.4 Scheduled Post Publisher

Create `packages/api/libs/blog/blog-scheduler.service.ts`:

- Uses `node-cron` to run every minute
- Queries posts where `status = 'scheduled'` AND `scheduledAt <= NOW()`
- Updates status to `published` and sets `publishedAt`
- Logs published posts for monitoring

## Phase 3: API Routes

Create in `packages/api/api-app/src/blog/`:

**Public Routes (SSR-compatible):**
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/blog/posts` | GET | List published posts (cursor pagination, 5 per page) |
| `/api/blog/posts/:slug` | GET | Single post by slug with author info |
| `/api/blog/posts/:id/related` | GET | Related posts by category/tag overlap |
| `/api/blog/categories` | GET | List all categories |
| `/api/blog/tags` | GET | List all tags |

**Admin Routes (Editor role required):**
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/blog/admin/posts` | GET | List all posts (filters, sorted by createdAt desc) |
| `/api/blog/admin/posts` | POST | Create new draft post |
| `/api/blog/admin/posts/:id` | GET | Get single post for editing |
| `/api/blog/admin/posts/:id` | PUT | Update post (creates revision) |
| `/api/blog/admin/posts/:id` | DELETE | Soft delete post |
| `/api/blog/admin/posts/:id/publish` | POST | Publish immediately |
| `/api/blog/admin/posts/:id/schedule` | POST | Schedule for future publish |
| `/api/blog/admin/posts/:id/revisions` | GET | Get revision history |
| `/api/blog/admin/posts/:id/revisions/:revisionId/restore` | POST | Restore from revision |
| `/api/blog/admin/categories` | GET/POST/PUT/DELETE | Category CRUD |
| `/api/blog/admin/tags` | GET/POST/PUT/DELETE | Tag CRUD |

Add `editor` to user roles in `packages/shared/models/src/user/user-shared.consts.ts`.

## Phase 4: Web App - Public Blog (SSR)

### 4.1 Update SSR Routes

Modify `packages/web/web-app/src/app/routers/ssr.routes.tsx`:

- Add SSR loader for `/blog` to fetch published posts
- Add SSR loader for `/blog/:slug` to fetch single post
- Add route for individual blog post pages

### 4.2 Refactor Blog Components

Update `packages/web/web-app/src/app/blog/`:

- `blog-web.component.tsx` - Blog list with infinite scroll (5 posts per load)
- `blog-post-web.component.tsx` - Single post view with:
  - Markdown-rendered content
  - Author name or "DX3 Team" based on `isAnonymous`
  - Reading time display
  - Related posts section (category + tag based)
- `blog-post-card.component.tsx` - Reusable card showing:
  - Featured image (if present)
  - Title, excerpt (auto or manual)
  - Author, date, reading time
  - Category/tag chips
- `blog-markdown-renderer.component.tsx` - Markdown to HTML with syntax highlighting
- `blog-infinite-scroll.hook.ts` - Custom hook for cursor-based infinite loading
- `blog-related-posts.component.tsx` - Related posts sidebar/section

### 4.3 Markdown Rendering

Install `react-markdown` and `remark-gfm` for markdown rendering with GitHub Flavored Markdown support. Use `rehype-highlight` for code syntax highlighting.

### 4.4 Infinite Scroll Implementation

Use Intersection Observer API to detect when user scrolls near bottom:
- Trigger fetch for next page using cursor from last post
- Show loading skeleton while fetching
- Stop when no more posts returned

## Phase 5: Web App - Admin UI (CSR)

### 5.1 Admin Routes

Add to `packages/web/web-app/src/app/routers/admin.router.tsx`:

- `/admin/blog` - Blog post management dashboard
- `/admin/blog/new` - Create new post
- `/admin/blog/edit/:id` - Edit existing post
- `/admin/blog/categories` - Category management
- `/admin/blog/tags` - Tag management

### 5.2 Admin Components

Create in `packages/web/web-app/src/app/blog/admin/`:

- `blog-admin-list.component.tsx` - DataGrid of all posts:
  - Columns: Title, Status, Author, Created, Updated
  - Filters: Status (draft/published/scheduled/archived)
  - Default sort: Most recently created
  - Quick actions: Edit, Publish, Delete
- `blog-admin-editor.component.tsx` - Markdown editor with:
  - Split pane: editor + live preview
  - Toolbar for formatting (bold, italic, headers, links, images)
  - Image upload via Media API or external URL paste
  - Auto-save draft functionality
- `blog-admin-settings.component.tsx` - Post settings panel:
  - Slug field (auto-generated, manually editable)
  - Excerpt field (optional, shows auto-generated preview)
  - Featured image selector (optional)
  - Category multi-select
  - Tag multi-select (with create-on-the-fly)
  - Anonymous toggle ("Publish as DX3 Team")
  - SEO section: title, description, canonical URL
  - Scheduling: date/time picker for future publish
- `blog-admin-revisions.component.tsx` - Revision history:
  - List of all revisions with timestamp and editor
  - Diff view comparing revisions
  - Restore button (creates new revision)

### 5.3 Markdown Editor

Use `@mdxeditor/editor` for the admin markdown editor with:

- WYSIWYG / Notion-like editing experience
- Toolbar for formatting (headings, lists, quotes, links)
- Plugins: headingsPlugin, listsPlugin, quotePlugin, thematicBreakPlugin, linkPlugin, linkDialogPlugin, markdownShortcutPlugin
- Image upload integration (via existing Media API) - to be added in follow-up

### 5.4 RTK Query API

Create `packages/web/web-app/src/app/blog/blog-web.api.ts`:

- Endpoints for all admin operations
- Cache invalidation on mutations
- Optimistic updates for status changes

## Phase 6: Redux State

Create `packages/web/web-app/src/app/blog/store/`:

- `blog-web.reducer.ts` - Blog admin state (current draft, filters)
- `blog-web.selectors.ts` - Memoized selectors

## Phase 7: i18n Strings

Update `packages/web/web-app/src/assets/locales/en.json` with all blog-related strings (titles, buttons, status labels, error messages).

## Key Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `packages/shared/models/src/blog/*` | Create | Shared types and constants |
| `packages/shared/models/src/user/user-shared.consts.ts` | Modify | Add 'editor' role |
| `packages/api/libs/blog/*` | Create | Models, service, scheduler |
| `packages/api/api-app/src/blog/*` | Create | Controller and route registration |
| `packages/api/api-app/src/data/pg/dx-postgres.models.ts` | Modify | Register blog models |
| `packages/api/api-app/src/routes/v1.routes.ts` | Modify | Add blog routes |
| `packages/api/api-app/src/main.ts` | Modify | Initialize blog scheduler |
| `packages/api/libs/pg/migrations/scripts/*` | Create | Blog tables migration |
| `packages/web/web-app/src/app/blog/*` | Modify/Create | Public and admin components |
| `packages/web/web-app/src/app/routers/ssr.routes.tsx` | Modify | Add SSR loaders for /blog and /blog/:slug |
| `packages/web/web-app/src/app/routers/admin.router.tsx` | Modify | Add admin routes |
| `packages/web/web-app/src/assets/locales/en.json` | Modify | Add blog i18n strings |

## Dependencies to Add

**API Package:**

- `node-cron` - Scheduled post publisher (runs every minute)

**Web Package:**

- `react-markdown` - Markdown rendering for public pages
- `remark-gfm` - GitHub Flavored Markdown support
- `rehype-highlight` - Code syntax highlighting
- `@mdxeditor/editor` - Admin WYSIWYG markdown editor
- `diff` - Revision diff display
- `react-intersection-observer` - Infinite scroll trigger

## Estimated Scope

This is a significant feature spanning ~30-40 files across shared, API, and web packages.

**Recommended Implementation Order:**

1. **Phase 1: Foundation** (shared types, DB models, migration)
2. **Phase 2: API Layer** (service, routes, scheduler)
3. **Phase 3: Public SSR** (blog list, single post, related posts, infinite scroll)
4. **Phase 4: Admin UI** (list, editor, settings, revisions)
5. **Phase 5: Polish** (i18n, error handling, loading states)

**Estimated Effort:** 3-5 days for full implementation
