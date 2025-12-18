/**
 * User Privilege Set Seeder
 * Seeds the user_privilege_sets table with available roles
 */

import { UserPrivilegeSetModel } from '../../../user-privilege/user-privilege-api.postgres-model'
import { USER_PRIVILEGE_SETS_SEED } from '../data/user-privilege-sets.data'
import type { Seeder, SeederContext } from '../seed.types'

export const userPrivilegeSetSeeder: Seeder = {
  name: 'UserPrivilegeSetSeeder',
  order: 1,
  run: async (context: SeederContext): Promise<number> => {
    const { options } = context
    let count = 0

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
      } else if (options.verbose) {
        console.log(`  → Privilege set already exists: ${privilegeSet.name}`)
      }
    }

    return count
  },
}
