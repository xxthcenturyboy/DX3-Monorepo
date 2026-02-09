/**
 * Migration: Create blog CMS tables
 *
 * @description Creates blog_posts, blog_post_revisions, blog_categories, blog_tags,
 *              and junction tables for post-category and post-tag many-to-many relationships
 * @created 2026-02-07T12:00:00.000Z
 */

module.exports = {
  /**
   * Rollback migration - Drop blog tables
   * @param {import('sequelize').QueryInterface} queryInterface
   * @param {import('sequelize').Sequelize} Sequelize
   */
  down: async (queryInterface, Sequelize) => {
    console.log('[Migration] Rolling back: Removing blog tables')

    await queryInterface.sequelize.query(`
      BEGIN;
        DROP TABLE IF EXISTS blog_post_revisions;
        DROP TABLE IF EXISTS blog_post_tags;
        DROP TABLE IF EXISTS blog_post_categories;
        DROP TABLE IF EXISTS blog_posts;
        DROP TABLE IF EXISTS blog_tags;
        DROP TABLE IF EXISTS blog_categories;
      COMMIT;
    `)

    console.log('[Migration] Rollback complete: blog tables removed')
  },

  /**
   * Apply migration - Create blog tables
   * @param {import('sequelize').QueryInterface} queryInterface
   * @param {import('sequelize').Sequelize} Sequelize
   */
  up: async (queryInterface, Sequelize) => {
    console.log('[Migration] Applying: Creating blog tables')

    await queryInterface.sequelize.query(`
      BEGIN;
        -- Enable uuid extension if not exists
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        -- blog_categories: flat single-level categories
        CREATE TABLE IF NOT EXISTS blog_categories (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(128) NOT NULL,
          slug VARCHAR(128) NOT NULL UNIQUE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS blog_categories_slug_idx ON blog_categories(slug);

        -- blog_tags: flat tags
        CREATE TABLE IF NOT EXISTS blog_tags (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(128) NOT NULL,
          slug VARCHAR(128) NOT NULL UNIQUE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS blog_tags_slug_idx ON blog_tags(slug);

        -- blog_posts: main posts table
        CREATE TABLE IF NOT EXISTS blog_posts (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          author_id UUID NOT NULL REFERENCES users(id),
          title VARCHAR(512) NOT NULL,
          slug VARCHAR(512) NOT NULL UNIQUE,
          content TEXT NOT NULL,
          excerpt TEXT,
          status VARCHAR(32) NOT NULL DEFAULT 'draft',
          featured_image_id UUID REFERENCES media(id),
          is_anonymous BOOLEAN NOT NULL DEFAULT false,
          published_at TIMESTAMPTZ,
          scheduled_at TIMESTAMPTZ,
          canonical_url VARCHAR(512),
          seo_title VARCHAR(256),
          seo_description VARCHAR(512),
          reading_time_minutes INTEGER NOT NULL DEFAULT 0,
          deleted_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS blog_posts_slug_idx ON blog_posts(slug);
        CREATE INDEX IF NOT EXISTS blog_posts_status_idx ON blog_posts(status);
        CREATE INDEX IF NOT EXISTS blog_posts_author_id_idx ON blog_posts(author_id);
        CREATE INDEX IF NOT EXISTS blog_posts_published_at_idx ON blog_posts(published_at) WHERE published_at IS NOT NULL;
        CREATE INDEX IF NOT EXISTS blog_posts_scheduled_at_idx ON blog_posts(scheduled_at) WHERE scheduled_at IS NOT NULL;

        -- blog_post_categories: many-to-many junction
        CREATE TABLE IF NOT EXISTS blog_post_categories (
          post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
          category_id UUID NOT NULL REFERENCES blog_categories(id) ON DELETE CASCADE,
          PRIMARY KEY (post_id, category_id)
        );

        -- blog_post_tags: many-to-many junction
        CREATE TABLE IF NOT EXISTS blog_post_tags (
          post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
          tag_id UUID NOT NULL REFERENCES blog_tags(id) ON DELETE CASCADE,
          PRIMARY KEY (post_id, tag_id)
        );

        -- blog_post_revisions: version history
        CREATE TABLE IF NOT EXISTS blog_post_revisions (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
          editor_id UUID NOT NULL REFERENCES users(id),
          title VARCHAR(512) NOT NULL,
          content TEXT NOT NULL,
          excerpt TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS blog_post_revisions_post_id_idx ON blog_post_revisions(post_id);
      COMMIT;
    `)

    console.log('[Migration] Applied: blog tables created')
  },
}
