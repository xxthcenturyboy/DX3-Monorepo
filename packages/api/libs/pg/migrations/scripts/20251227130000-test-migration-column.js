'use strict'

/**
 * Migration: Add test_migration column to emails table
 *
 * @description Test migration to verify migration framework is working correctly
 * @created 2025-12-27T13:00:00.000Z
 *
 * This is a demonstration migration that adds a nullable 'test_migration' column
 * to the emails table. This column can be safely removed after verifying the
 * migration framework is operational.
 */

module.exports = {
  /**
   * Rollback migration - Remove test_migration column
   * @param {import('sequelize').QueryInterface} queryInterface
   * @param {import('sequelize').Sequelize} Sequelize
   */
  down: async (queryInterface, Sequelize) => {
    console.log('[Migration] Rolling back: Removing test_migration column from emails table')

    await queryInterface.sequelize.query(`
      BEGIN;
        ALTER TABLE emails
          DROP COLUMN IF EXISTS test_migration;
      COMMIT;
    `)

    console.log('[Migration] Rollback complete: test_migration column removed')
  },

  /**
   * Apply migration - Add test_migration column
   * @param {import('sequelize').QueryInterface} queryInterface
   * @param {import('sequelize').Sequelize} Sequelize
   */
  up: async (queryInterface, Sequelize) => {
    console.log('[Migration] Applying: Adding test_migration column to emails table')

    await queryInterface.sequelize.query(`
      BEGIN;
        ALTER TABLE emails
          ADD COLUMN IF NOT EXISTS test_migration VARCHAR(255) NULL;

        COMMENT ON COLUMN emails.test_migration IS 'Test column for migration framework verification - safe to remove';
      COMMIT;
    `)

    console.log('[Migration] Applied: test_migration column added to emails table')
  },
}
