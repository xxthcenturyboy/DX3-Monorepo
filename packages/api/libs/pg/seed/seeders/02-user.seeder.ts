/**
 * User Seeder
 * Seeds the users table with initial admin and test users
 */

import { UserModel } from '../../../user/user-api.postgres-model'
import { getAllUsersSeed } from '../data/users.data'
import type { Seeder, SeederContext } from '../seed.types'

export const userSeeder: Seeder = {
  name: 'UserSeeder',
  order: 2,
  run: async (context: SeederContext): Promise<number> => {
    const { options } = context
    let count = 0

    const users = await getAllUsersSeed()

    for (const userData of users) {
      const existingUser = await UserModel.findByPk(userData.id)

      if (!existingUser) {
        await UserModel.create({
          firstName: userData.firstName,
          hashword: userData.hashword,
          id: userData.id,
          lastName: userData.lastName,
          roles: userData.roles,
          username: userData.username,
        })
        count++
        if (options.verbose) {
          console.log(`  ✓ Created user: ${userData.username}`)
        }
      } else if (options.verbose) {
        console.log(`  → User already exists: ${userData.username}`)
      }
    }

    return count
  },
}
