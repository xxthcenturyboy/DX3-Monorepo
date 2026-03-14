/**
 * Migration: Create feature_flags table
 *
 * @description Creates the feature_flags table for the feature flag management feature.
 * @created 2026-03-14T12:00:00.000Z
 */

module.exports = {
  /**
   * Rollback migration - Drop feature_flags table
   * @param {import('sequelize').QueryInterface} queryInterface
   */
  down: async (queryInterface) => {
    console.log('[Migration] Rolling back: Removing feature_flags table')

    await queryInterface.sequelize.query(`
      BEGIN;
        DROP TABLE IF EXISTS feature_flags;
      COMMIT;
    `)

    console.log('[Migration] Rollback complete: feature_flags table removed')
  },

  /**
   * Apply migration - Create feature_flags table
   * @param {import('sequelize').QueryInterface} queryInterface
   */
  up: async (queryInterface) => {
    console.log('[Migration] Applying: Creating feature_flags table')

    await queryInterface.sequelize.query(`
      BEGIN;
        CREATE TABLE IF NOT EXISTS feature_flags (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(255) NOT NULL,
          description VARCHAR(512),
          status VARCHAR(255) NOT NULL DEFAULT 'DISABLED',
          target VARCHAR(255) NOT NULL DEFAULT 'ALL',
          percentage INTEGER,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE UNIQUE INDEX IF NOT EXISTS feature_flags_name_unique ON feature_flags(name);
      COMMIT;
    `)

    console.log('[Migration] Applied: feature_flags table created')
  },
}
