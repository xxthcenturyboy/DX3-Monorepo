import type { Model, ModelCtor } from 'sequelize-typescript'

import { DeviceModel } from '@dx3/api-libs/devices/device-api.postgres-model'
import { EmailModel } from '@dx3/api-libs/email/email-api.postgres-model'
import { FeatureFlagModel } from '@dx3/api-libs/feature-flags/feature-flag-api.postgres-model'
import { logTable } from '@dx3/api-libs/logger'
import { MediaModel } from '@dx3/api-libs/media/media-api.postgres-model'
import { NotificationModel } from '@dx3/api-libs/notifications/notification-api.postgres-model'
import { PhoneModel } from '@dx3/api-libs/phone/phone-api.postgres-model'
import { ShortLinkModel } from '@dx3/api-libs/shortlink/shortlink-api.postgres-model'
import { SupportRequestModel } from '@dx3/api-libs/support/support-api.postgres-model'
import { SupportMessageModel } from '@dx3/api-libs/support/support-message-api.postgres-model'
import { UserModel } from '@dx3/api-libs/user/user-api.postgres-model'
import { UserPrivilegeSetModel } from '@dx3/api-libs/user-privilege/user-privilege-api.postgres-model'

export function getPostgresModels(): ModelCtor[] {
  const models: ModelCtor[] = []

  models.push(DeviceModel)
  models.push(EmailModel)
  models.push(FeatureFlagModel)
  models.push(MediaModel)
  models.push(NotificationModel)
  models.push(PhoneModel)
  models.push(ShortLinkModel)
  models.push(SupportRequestModel)
  models.push(SupportMessageModel)
  models.push(UserModel)
  models.push(UserPrivilegeSetModel)

  return models
}

export function logLoadedPostgresModels(pgModels: { [key: string]: ModelCtor<Model> }): void {
  const MODEL_PROP_NAME = 'Model Name'
  const TABLE_PROP_NAME = 'Table Name'
  const tableNames = Object.keys(pgModels)
  const models = []
  for (const tableName of tableNames) {
    models.push({
      [MODEL_PROP_NAME]: pgModels[tableName].name,
      [TABLE_PROP_NAME]: pgModels[tableName].tableName,
    })
  }

  logTable(models)
}
