/**
 * Migration: Add user_timezone column to support_requests table
 *
 * @description Adds user_timezone column to capture user's timezone at request creation time
 * @created 2026-01-25T12:01:00.000Z
 *
 * The user_timezone column stores IANA timezone identifiers (e.g., 'America/New_York')
 * or 'system' as the default value. This is a snapshot of the user's timezone
 * at the time the support request was created.
 */

module.exports = {
  /**
   * Rollback migration - Remove user_timezone column
   * @param {import('sequelize').QueryInterface} queryInterface
   * @param {import('sequelize').Sequelize} Sequelize
   */
  down: async (queryInterface, Sequelize) => {
    console.log('[Migration] Rolling back: Removing user_timezone column from support_requests table')

    await queryInterface.sequelize.query(`
      BEGIN;
        ALTER TABLE support_requests
          DROP COLUMN IF EXISTS user_timezone;
      COMMIT;
    `)

    console.log('[Migration] Rollback complete: user_timezone column removed')
  },

  /**
   * Apply migration - Add user_timezone column
   * @param {import('sequelize').QueryInterface} queryInterface
   * @param {import('sequelize').Sequelize} Sequelize
   */
  up: async (queryInterface, Sequelize) => {
    console.log('[Migration] Applying: Adding user_timezone column to support_requests table')

    await queryInterface.sequelize.query(`
      BEGIN;
        ALTER TABLE support_requests
          ADD COLUMN IF NOT EXISTS user_timezone VARCHAR(64) NOT NULL DEFAULT 'system';

        COMMENT ON COLUMN support_requests.user_timezone IS 'User timezone at the time of request creation - IANA timezone identifier or system';
      COMMIT;
    `)

    console.log('[Migration] Applied: user_timezone column added to support_requests table')
  },
}
