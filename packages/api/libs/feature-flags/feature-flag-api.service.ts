import type { FindOptions } from 'sequelize'
import { Op } from 'sequelize'

import {
  DEFAULT_LIMIT,
  DEFAULT_OFFSET,
  DEFAULT_SORT,
  FEATURE_FLAG_STATUS,
  FEATURE_FLAG_TARGET,
  type FeatureFlagEvaluatedType,
  type FeatureFlagNameType,
  type FeatureFlagStatusType,
  type FeatureFlagTargetType,
  type FeatureFlagType,
  type GetFeatureFlagsListQueryType,
  type GetFeatureFlagsListResponseType,
} from '@dx3/models-shared'
import { parseJson } from '@dx3/utils-shared'

import { ApiLoggingClass, type ApiLoggingClassType } from '../logger'
import { RedisService } from '../redis'
import type { UserSessionType } from '../user/user-api.types'
import {
  FEATURE_FLAG_CACHE_PREFIX,
  FEATURE_FLAG_CACHE_TTL,
  FEATURE_FLAG_SORT_FIELDS,
} from './feature-flag-api.consts'
import { FeatureFlagModel, type FeatureFlagModelType } from './feature-flag-api.postgres-model'

export class FeatureFlagService {
  private logger: ApiLoggingClassType

  constructor() {
    this.logger = ApiLoggingClass.instance
  }

  private getCacheKey(flagName: string): string {
    return `${FEATURE_FLAG_CACHE_PREFIX}:${flagName}`
  }

  private getSortListOptions(orderBy?: string, sortDir?: string): FindOptions['order'] {
    if (orderBy && FEATURE_FLAG_SORT_FIELDS.includes(orderBy)) {
      return [[orderBy, sortDir || DEFAULT_SORT]]
    }

    return [[FEATURE_FLAG_SORT_FIELDS[2], DEFAULT_SORT]] // Default to 'name'
  }

  private getLikeFilter(filterValue: string): { [Op.iLike]: string } {
    return {
      [Op.iLike]: `%${filterValue}%`,
    }
  }

  private getListSearchQuery(filterValue?: string) {
    if (filterValue) {
      const likeFilter = this.getLikeFilter(filterValue)

      return {
        where: {
          [Op.or]: {
            description: likeFilter,
            name: likeFilter,
          },
        },
      }
    }

    return {}
  }

  async createFlag(
    name: FeatureFlagNameType,
    description: string,
    status: FeatureFlagStatusType = FEATURE_FLAG_STATUS.DISABLED,
    target: FeatureFlagTargetType = FEATURE_FLAG_TARGET.ALL,
    percentage?: number,
  ): Promise<{ flag: FeatureFlagType }> {
    const flag = await FeatureFlagModel.createFlag(name, description, status, target, percentage)
    await this.invalidateCache(name)
    return { flag: flag.toJSON() as FeatureFlagType }
  }

  async evaluateFlag(
    flagName: FeatureFlagNameType,
    user: UserSessionType | null,
  ): Promise<boolean> {
    try {
      // Check Redis cache first
      const cached = await RedisService.instance.getCacheItemSimple(this.getCacheKey(flagName))

      let flag: FeatureFlagType | null = null

      if (cached) {
        flag = parseJson<FeatureFlagType>(cached)
      } else {
        const dbFlag = await FeatureFlagModel.getFlagByName(flagName)
        if (dbFlag) {
          flag = dbFlag.toJSON() as FeatureFlagType
          await RedisService.instance.setCacheItemWithExpiration(
            this.getCacheKey(flagName),
            JSON.stringify(flag),
            { time: FEATURE_FLAG_CACHE_TTL, token: 'EX' },
          )
        }
      }

      if (!flag || flag.status === FEATURE_FLAG_STATUS.DISABLED) {
        return false
      }

      if (flag.status === FEATURE_FLAG_STATUS.ACTIVE) {
        return this.evaluateTarget(flag, user)
      }

      if (flag.status === FEATURE_FLAG_STATUS.ROLLOUT && flag.percentage) {
        return this.evaluatePercentage(flag.percentage, user?.id)
      }

      return false
    } catch (error) {
      this.logger.logError(`Error evaluating feature flag: ${flagName}`, error as Error)
      return false
    }
  }

  private evaluateTarget(flag: FeatureFlagType, user: UserSessionType | null): boolean {
    switch (flag.target) {
      case FEATURE_FLAG_TARGET.ALL:
        return true
      case FEATURE_FLAG_TARGET.ADMIN:
        return user?.isAdmin || user?.isSuperAdmin || false
      case FEATURE_FLAG_TARGET.SUPER_ADMIN:
        return user?.isSuperAdmin || false
      case FEATURE_FLAG_TARGET.BETA_USERS:
        return user?.optInBeta || false
      case FEATURE_FLAG_TARGET.PERCENTAGE:
        return this.evaluatePercentage(flag.percentage || 0, user?.id)
      default:
        return false
    }
  }

  private evaluatePercentage(percentage: number, userId?: string): boolean {
    if (!userId) return false
    // Consistent hashing based on userId for stable assignment
    const hash = this.hashUserId(userId)
    return hash % 100 < percentage
  }

  private hashUserId(userId: string): number {
    let hash = 0
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  async evaluateAllFlags(
    user: UserSessionType | null,
  ): Promise<{ flags: FeatureFlagEvaluatedType[] }> {
    const flags = await FeatureFlagModel.getAllFlags()
    const evaluated: FeatureFlagEvaluatedType[] = []

    for (const flag of flags) {
      evaluated.push({
        enabled: await this.evaluateFlag(flag.name, user),
        name: flag.name,
      })
    }

    return { flags: evaluated }
  }

  async getAllFlags(query: GetFeatureFlagsListQueryType): Promise<GetFeatureFlagsListResponseType> {
    const { filterValue, limit, offset, orderBy, sortDir } = query

    const orderArgs = this.getSortListOptions(orderBy, sortDir)
    const search = this.getListSearchQuery(filterValue)

    let result: { count: number; rows: FeatureFlagModelType[] } = { count: 0, rows: [] }

    try {
      result = await FeatureFlagModel.findAndCountAll({
        ...search,
        limit: limit ? Number(limit) : DEFAULT_LIMIT,
        offset: offset ? Number(offset) : DEFAULT_OFFSET,
        order: orderArgs,
      })
    } catch (err) {
      const msg = (err as Error).message
      this.logger.logError(msg)
      throw new Error(msg)
    }

    const flags: FeatureFlagType[] = result.rows.map((f) => f.toJSON() as FeatureFlagType)

    return {
      count: result.count,
      flags,
    }
  }

  async updateFlag(
    id: string,
    updates: Partial<{
      description: string
      percentage: number | null
      status: FeatureFlagStatusType
      target: FeatureFlagTargetType
    }>,
  ): Promise<{ updated: boolean }> {
    // Get the flag first to know its name for targeted cache invalidation
    const flag = await FeatureFlagModel.getFlagById(id)
    if (!flag) {
      throw new Error(`Feature flag with id ${id} not found`)
    }

    await FeatureFlagModel.updateFlag(id, updates)
    // Invalidate cache for this specific flag
    await this.invalidateCache(flag.name)
    return { updated: true }
  }

  async invalidateCache(flagName?: string): Promise<void> {
    if (flagName) {
      await RedisService.instance.deleteCacheItem(this.getCacheKey(flagName))
    } else {
      const keys = await RedisService.instance.getKeys(FEATURE_FLAG_CACHE_PREFIX)
      for (const key of keys || []) {
        await RedisService.instance.deleteCacheItem(key)
      }
    }
  }
}

export type FeatureFlagServiceType = typeof FeatureFlagService.prototype
