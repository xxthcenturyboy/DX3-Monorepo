import { fn } from 'sequelize'
import {
  AllowNull,
  Column,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript'

import {
  FEATURE_FLAG_NAMES_ARRAY,
  FEATURE_FLAG_STATUS,
  FEATURE_FLAG_STATUS_ARRAY,
  FEATURE_FLAG_TARGET,
  FEATURE_FLAG_TARGET_ARRAY,
  type FeatureFlagNameType,
  type FeatureFlagStatusType,
  type FeatureFlagTargetType,
} from '@dx3/models-shared'

import { FEATURE_FLAG_ENTITY_NAME } from './feature-flag-api.consts'

@Table({
  indexes: [
    {
      fields: ['name'],
      unique: true,
    },
  ],
  modelName: FEATURE_FLAG_ENTITY_NAME,
  timestamps: true,
  underscored: true,
})
export class FeatureFlagModel extends Model<FeatureFlagModel> {
  @PrimaryKey
  @Default(fn('uuid_generate_v4'))
  @AllowNull(false)
  @Column(DataType.UUID)
  id: string

  @Unique
  @AllowNull(false)
  @Column({
    set(name: string): void {
      if (!(FEATURE_FLAG_NAMES_ARRAY as readonly string[]).includes(name)) {
        throw new Error(
          `Invalid feature flag name: ${name}. ` +
            `Allowed names are: ${FEATURE_FLAG_NAMES_ARRAY.join(', ')}`,
        )
      }
      this.setDataValue('name', name)
    },
    type: DataType.STRING,
  })
  name: FeatureFlagNameType

  @AllowNull(true)
  @Column(DataType.STRING(512))
  description: string

  @Default(FEATURE_FLAG_STATUS.DISABLED)
  @AllowNull(false)
  @Column({
    set(status: string): void {
      if (!(FEATURE_FLAG_STATUS_ARRAY as readonly string[]).includes(status)) {
        throw new Error(
          `Invalid feature flag status: ${status}. ` +
            `Allowed statuses are: ${FEATURE_FLAG_STATUS_ARRAY.join(', ')}`,
        )
      }
      this.setDataValue('status', status)
    },
    type: DataType.STRING,
  })
  status: FeatureFlagStatusType

  @Default(FEATURE_FLAG_TARGET.ALL)
  @AllowNull(false)
  @Column({
    set(target: string): void {
      if (!(FEATURE_FLAG_TARGET_ARRAY as readonly string[]).includes(target)) {
        throw new Error(
          `Invalid feature flag target: ${target}. ` +
            `Allowed targets are: ${FEATURE_FLAG_TARGET_ARRAY.join(', ')}`,
        )
      }
      this.setDataValue('target', target)
    },
    type: DataType.STRING,
  })
  target: FeatureFlagTargetType

  @AllowNull(true)
  @Column(DataType.INTEGER)
  percentage: number | null

  @Default(fn('now'))
  @AllowNull(false)
  @Column({ field: 'created_at', type: DataType.DATE })
  createdAt: Date

  @Default(fn('now'))
  @AllowNull(false)
  @Column({ field: 'updated_at', type: DataType.DATE })
  updatedAt: Date

  static async getAllFlags(): Promise<FeatureFlagModel[]> {
    return await FeatureFlagModel.findAll({
      order: [['name', 'ASC']],
    })
  }

  static async getFlagById(id: string): Promise<FeatureFlagModel | null> {
    return await FeatureFlagModel.findByPk(id)
  }

  static async getFlagByName(name: FeatureFlagNameType): Promise<FeatureFlagModel | null> {
    return await FeatureFlagModel.findOne({
      where: { name },
    })
  }

  static async createFlag(
    name: FeatureFlagNameType,
    description: string,
    status: FeatureFlagStatusType = FEATURE_FLAG_STATUS.DISABLED,
    target: FeatureFlagTargetType = FEATURE_FLAG_TARGET.ALL,
    percentage?: number,
  ): Promise<FeatureFlagModel> {
    return await FeatureFlagModel.create({
      description,
      name,
      percentage: percentage ?? null,
      status,
      target,
    })
  }

  static async updateFlag(
    id: string,
    updates: Partial<{
      description: string
      percentage: number | null
      status: FeatureFlagStatusType
      target: FeatureFlagTargetType
    }>,
  ): Promise<[affectedCount: number]> {
    return await FeatureFlagModel.update({ ...updates, updatedAt: new Date() }, { where: { id } })
  }
}

export type FeatureFlagModelType = typeof FeatureFlagModel.prototype
