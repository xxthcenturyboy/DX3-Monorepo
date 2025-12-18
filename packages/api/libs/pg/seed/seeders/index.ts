/**
 * Seeders Index
 * Exports all seeders in execution order
 */

import type { Seeder } from '../seed.types'
import { userPrivilegeSetSeeder } from './01-user-privilege-set.seeder'
import { userSeeder } from './02-user.seeder'
import { emailSeeder } from './03-email.seeder'
import { phoneSeeder } from './04-phone.seeder'

/**
 * All available seeders sorted by execution order
 * Order matters: parent tables must be seeded before child tables
 */
export const seeders: Seeder[] = [
  userPrivilegeSetSeeder,
  userSeeder,
  emailSeeder,
  phoneSeeder,
].sort((a, b) => a.order - b.order)

export { userPrivilegeSetSeeder } from './01-user-privilege-set.seeder'
export { userSeeder } from './02-user.seeder'
export { emailSeeder } from './03-email.seeder'
export { phoneSeeder } from './04-phone.seeder'
