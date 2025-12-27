import type { Model, ModelCtor, Sequelize } from 'sequelize-typescript'

import { ApiLoggingClass } from '@dx3/api-libs/logger'
import { PostgresDbConnection } from '@dx3/api-libs/pg'
import { MIGRATIONS_PATH, MigrationRunner } from '@dx3/api-libs/pg/migrations'

import { POSTGRES_URI } from '../../config/config-api.consts'
import { getPostgresModels, logLoadedPostgresModels } from './dx-postgres.models'

export class DxPostgresDb {
  public static async getPostgresConnection(): Promise<typeof Sequelize.prototype | null> {
    const logger = ApiLoggingClass.instance
    try {
      const postgres = new PostgresDbConnection({
        models: getPostgresModels(),
        postgresUri: POSTGRES_URI,
      })

      await postgres.initialize()

      logLoadedPostgresModels(
        PostgresDbConnection.dbHandle.models as {
          [key: string]: ModelCtor<Model>
        },
      )

      logger.logInfo('Successfully Connected to Postgres')
      const sequelize = PostgresDbConnection.dbHandle
      const runner = new MigrationRunner(sequelize)

      // Check status
      const status = await runner.getMigrationStatus(MIGRATIONS_PATH)
      if (status.pending.length > 0) {
        await runner.runPendingMigrations({
          direction: 'up',
          migrationsPath: MIGRATIONS_PATH,
        })
      }

      return sequelize
    } catch (err) {
      logger.logError((err as Error).message, err)
      return null
    }
  }
}
