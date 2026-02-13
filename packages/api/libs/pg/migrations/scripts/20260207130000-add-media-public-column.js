/**
 * Migration: Add public column to media table
 *
 * @description Adds public boolean column to media table for unauthenticated access to selected assets.
 * @created 2026-02-07T13:00:00.000Z
 */

module.exports = {
  /**
   * Rollback migration - Remove public column
   * @param {import('sequelize').QueryInterface} queryInterface
   * @param {import('sequelize').Sequelize} Sequelize
   */
  down: async (queryInterface, Sequelize) => {
    console.log('[Migration] Rolling back: Removing media.public column')

    await queryInterface.sequelize.query(`
      ALTER TABLE media DROP COLUMN IF EXISTS public;
    `)

    console.log('[Migration] Rollback complete: media.public column removed')
  },

  /**
   * Apply migration - Add public column
   * @param {import('sequelize').QueryInterface} queryInterface
   * @param {import('sequelize').Sequelize} Sequelize
   */
  up: async (queryInterface, Sequelize) => {
    console.log('[Migration] Applying: Adding media.public column')

    await queryInterface.sequelize.query(`
      ALTER TABLE media ADD COLUMN IF NOT EXISTS public BOOLEAN NOT NULL DEFAULT false;
    `)

    console.log('[Migration] Complete: media.public column added')
  },
}
