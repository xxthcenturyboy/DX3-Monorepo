/**
 * Email Seeder
 * Seeds the emails table with user email addresses
 */

import { EmailModel } from '../../../email/email-api.postgres-model'
import { getEmailsSeed } from '../data/users.data'
import type { Seeder, SeederContext } from '../seed.types'

export const emailSeeder: Seeder = {
  name: 'EmailSeeder',
  order: 3,
  run: async (context: SeederContext): Promise<number> => {
    const { options } = context
    let count = 0

    const emails = getEmailsSeed()

    for (const emailData of emails) {
      const existingEmail = await EmailModel.findOne({
        where: {
          email: emailData.email,
          userId: emailData.userId,
        },
      })

      if (!existingEmail) {
        await EmailModel.create({
          default: emailData.default,
          email: emailData.email,
          label: emailData.label,
          userId: emailData.userId,
          verifiedAt: emailData.verifiedAt,
        })
        count++
        if (options.verbose) {
          console.log(`  ✓ Created email: ${emailData.email}`)
        }
      } else if (options.verbose) {
        console.log(`  → Email already exists: ${emailData.email}`)
      }
    }

    return count
  },
}
