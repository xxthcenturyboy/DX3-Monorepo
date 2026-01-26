/**
 * Migration: Add timezone column to users table
 *
 * @description Adds timezone column to track user's preferred timezone
 * @created 2026-01-25T12:00:00.000Z
 *
 * The timezone column stores IANA timezone identifiers (e.g., 'America/New_York')
 * or 'system' as the default value.
 */

module.exports = {
  /**
   * Rollback migration - Remove timezone column
   * @param {import('sequelize').QueryInterface} queryInterface
   * @param {import('sequelize').Sequelize} Sequelize
   */
  down: async (queryInterface, Sequelize) => {
    console.log('[Migration] Rolling back: Removing timezone column from users table')

    await queryInterface.sequelize.query(`
      BEGIN;
        ALTER TABLE users
          DROP COLUMN IF EXISTS timezone;
      COMMIT;
    `)

    console.log('[Migration] Rollback complete: timezone column removed')
  },

  /**
   * Apply migration - Add timezone column
   * @param {import('sequelize').QueryInterface} queryInterface
   * @param {import('sequelize').Sequelize} Sequelize
   */
  up: async (queryInterface, Sequelize) => {
    console.log('[Migration] Applying: Adding timezone column to users table')

    await queryInterface.sequelize.query(`
      BEGIN;
        ALTER TABLE users
          ADD COLUMN IF NOT EXISTS timezone VARCHAR(64) NOT NULL DEFAULT 'system';

        COMMENT ON COLUMN users.timezone IS 'User timezone preference - IANA timezone identifier or system';
      COMMIT;
    `)

    console.log('[Migration] Applied: timezone column added to users table')
  },
}
