/**
 * Migration: Create support_requests and support_messages tables
 *
 * @description Creates support_requests and support_messages tables for the support feature.
 *              Required before 20260125120100-add-support-request-user-timezone.js
 * @created 2026-01-25T12:00:50.000Z
 */

module.exports = {
  /**
   * Rollback migration - Drop support tables
   * @param {import('sequelize').QueryInterface} queryInterface
   * @param {import('sequelize').Sequelize} Sequelize
   */
  down: async (queryInterface, Sequelize) => {
    console.log('[Migration] Rolling back: Removing support tables')

    await queryInterface.sequelize.query(`
      BEGIN;
        DROP TABLE IF EXISTS support_messages;
        DROP TABLE IF EXISTS support_requests;
        DROP TYPE IF EXISTS enum_support_requests_status;
        DROP TYPE IF EXISTS enum_support_requests_category;
      COMMIT;
    `)

    console.log('[Migration] Rollback complete: support tables removed')
  },

  /**
   * Apply migration - Create support tables
   * @param {import('sequelize').QueryInterface} queryInterface
   * @param {import('sequelize').Sequelize} Sequelize
   */
  up: async (queryInterface, Sequelize) => {
    console.log('[Migration] Applying: Creating support tables')

    await queryInterface.sequelize.query(`
      BEGIN;
        -- Enum types for support_requests (matches SupportRequestModel)
        DO $$ BEGIN
          CREATE TYPE enum_support_requests_category AS ENUM ('issue', 'new_feature', 'other', 'question');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;

        DO $$ BEGIN
          CREATE TYPE enum_support_requests_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;

        -- support_requests (user_timezone added by next migration)
        CREATE TABLE IF NOT EXISTS support_requests (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL REFERENCES users(id),
          category enum_support_requests_category NOT NULL,
          subject VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          status enum_support_requests_status NOT NULL DEFAULT 'open',
          assigned_to UUID REFERENCES users(id),
          viewed_by_admin BOOLEAN NOT NULL DEFAULT false,
          viewed_at TIMESTAMPTZ,
          resolved_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS support_request_user_id_index ON support_requests(user_id);
        CREATE INDEX IF NOT EXISTS support_request_status_index ON support_requests(status);
        CREATE INDEX IF NOT EXISTS support_request_category_index ON support_requests(category);
        CREATE INDEX IF NOT EXISTS support_request_viewed_index ON support_requests(viewed_by_admin);

        -- support_messages (threading/response feature)
        CREATE TABLE IF NOT EXISTS support_messages (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          support_request_id UUID NOT NULL REFERENCES support_requests(id) ON DELETE CASCADE,
          user_id UUID NOT NULL REFERENCES users(id),
          message TEXT NOT NULL,
          is_admin_response BOOLEAN NOT NULL DEFAULT false,
          is_internal_note BOOLEAN NOT NULL DEFAULT false,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS support_message_request_id_index ON support_messages(support_request_id);
      COMMIT;
    `)

    console.log('[Migration] Applied: support tables created')
  },
}
