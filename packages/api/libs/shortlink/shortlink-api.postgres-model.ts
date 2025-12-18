import sequelize from 'sequelize'
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

import { maliciousUrlCheck, randomId } from '@dx3/utils-shared'

import { webDomain, webUrl } from '../config/config-api.service'
import { ApiLoggingClass } from '../logger'
import { SHORTLINK_POSTGRES_DB_NAME } from './shortlink-api.consts'

@Table({
  modelName: SHORTLINK_POSTGRES_DB_NAME,
  timestamps: true,
  underscored: true,
})
export class ShortLinkModel extends Model<ShortLinkModel> {
  @PrimaryKey
  @Default(() => randomId())
  @Column(DataType.STRING)
  id: string

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING)
  target: string

  @Default(sequelize.fn('now'))
  @Column({ field: 'created_at', type: DataType.DATE })
  createdAt: Date

  public static async generateShortlink(url: string): Promise<string> {
    try {
      maliciousUrlCheck(webDomain() || '', webUrl() || '', url)

      // Check if we have this already
      const existing = await ShortLinkModel.findOne({
        where: {
          target: url,
        },
      })

      if (existing) {
        return `${webUrl()}/l/${existing.id}`
      }

      // Create a new short link
      const shortlink = await ShortLinkModel.create({
        target: url,
      })

      return `${webUrl()}/l/${shortlink.id}`
    } catch (err) {
      ApiLoggingClass.instance.logError((err as Error).message)
      throw err
    }
  }

  public static async getShortLinkTarget(id: string): Promise<string> {
    try {
      const link = await ShortLinkModel.findOne({
        where: {
          id,
        },
      })

      if (link) {
        maliciousUrlCheck(webDomain() || '', webUrl() || '', link.target)
        return link.target
      }

      return ''
    } catch (err) {
      ApiLoggingClass.instance.logError((err as Error).message)
      throw err
    }
  }
}

export type ShortLinkModelType = typeof ShortLinkModel.prototype
