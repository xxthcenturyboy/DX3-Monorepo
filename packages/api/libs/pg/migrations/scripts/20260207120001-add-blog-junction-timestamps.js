/**
 * Migration: Add created_at and updated_at to blog junction tables
 *
 * @description Sequelize BelongsToMany with string through creates implicit models
 *              that expect created_at and updated_at. Add these columns so
 *              setCategories/setTags work without "column created_at does not exist" errors.
 * @created 2026-02-07T12:00:01.000Z
 */

module.exports = {
  /**
   * Rollback migration - Remove timestamp columns from junction tables
   * @param {import('sequelize').QueryInterface} queryInterface
   * @param {import('sequelize').Sequelize} Sequelize
   */
  down: async (queryInterface, Sequelize) => {
    console.log(
      '[Migration] Rolling back: Removing created_at/updated_at from blog junction tables',
    )

    await queryInterface.sequelize.query(`
      BEGIN;
        ALTER TABLE blog_post_categories
          DROP COLUMN IF EXISTS created_at,
          DROP COLUMN IF EXISTS updated_at;
        ALTER TABLE blog_post_tags
          DROP COLUMN IF EXISTS created_at,
          DROP COLUMN IF EXISTS updated_at;
      COMMIT;
    `)

    console.log('[Migration] Rollback complete')
  },

  /**
   * Apply migration - Add created_at and updated_at to junction tables
   * @param {import('sequelize').QueryInterface} queryInterface
   * @param {import('sequelize').Sequelize} Sequelize
   */
  up: async (queryInterface, Sequelize) => {
    console.log('[Migration] Applying: Adding created_at/updated_at to blog junction tables')

    await queryInterface.sequelize.query(`
      BEGIN;
        ALTER TABLE blog_post_categories
          ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
        ALTER TABLE blog_post_tags
          ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
      COMMIT;
    `)

    console.log('[Migration] Applied: junction table timestamps added')
  },
}
