/**
 * Migration: Drop blog_post_revisions table
 *
 * @description Revisions feature removed from blog CMS. Table no longer used.
 * @created 2026-02-07T14:00:00.000Z
 */

module.exports = {
  down: async (queryInterface) => {
    console.log('[Migration] Rolling back: Recreating blog_post_revisions table')

    await queryInterface.sequelize.query(`
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
    `)

    console.log('[Migration] Rollback complete')
  },

  up: async (queryInterface) => {
    console.log('[Migration] Applying: Dropping blog_post_revisions table')

    await queryInterface.sequelize.query(`
      DROP TABLE IF EXISTS blog_post_revisions CASCADE;
    `)

    console.log('[Migration] Applied: blog_post_revisions dropped')
  },
}
