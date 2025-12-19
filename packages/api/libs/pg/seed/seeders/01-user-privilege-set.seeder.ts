/**
 * User Privilege Set Seeder
 * Seeds the user_privilege_sets table with available roles
 */

import { RedisService } from '../../../redis'
import { UserPrivilegeSetModel } from '../../../user-privilege/user-privilege-api.postgres-model'
import { UserPrivilegeSetCache } from '../../../user-privilege/user-privilege-api.redis-cache'
import { USER_PRIVILEGE_SETS_SEED } from '../data/user-privilege-sets.data'
import type { Seeder, SeederContext } from '../seed.types'

export const userPrivilegeSetSeeder: Seeder = {
  name: 'UserPrivilegeSetSeeder',
  order: 1,
  run: async (context: SeederContext): Promise<number> => {
    const { options } = context
    let count = 0

    // Check if Redis is available for caching
    const redisAvailable = !!RedisService.instance

    for (const privilegeSet of USER_PRIVILEGE_SETS_SEED) {
      const [record, created] = await UserPrivilegeSetModel.findOrCreate({
        defaults: {
          description: privilegeSet.description,
          name: privilegeSet.name,
          order: privilegeSet.order,
        },
        where: { name: privilegeSet.name },
      })

      if (created) {
        count++
        if (options.verbose) {
          console.log(`  ✓ Created privilege set: ${privilegeSet.name}`)
        }

        // Update cache if Redis is available
        if (redisAvailable) {
          try {
            const cache = new UserPrivilegeSetCache()
            await cache.setCache(privilegeSet.name, record.dataValues)
            if (options.verbose) {
              console.log(`    → Cached: ${privilegeSet.name}`)
            }
          } catch (error) {
            console.log(
              `  ⚠ Failed to cache privilege set ${privilegeSet.name}: ${(error as Error).message}`,
            )
          }
        }
      } else if (options.verbose) {
        console.log(`  → Privilege set already exists: ${privilegeSet.name}`)
      }
    }

    return count
  },
}
