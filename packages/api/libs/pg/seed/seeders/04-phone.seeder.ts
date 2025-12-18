/**
 * Phone Seeder
 * Seeds the phones table with user phone numbers
 */

import { PhoneModel } from '../../../phone/phone-api.postgres-model'
import { getPhonesSeed } from '../data/users.data'
import type { Seeder, SeederContext } from '../seed.types'

export const phoneSeeder: Seeder = {
  name: 'PhoneSeeder',
  order: 4,
  run: async (context: SeederContext): Promise<number> => {
    const { options } = context
    let count = 0

    const phones = getPhonesSeed()

    for (const phoneData of phones) {
      const existingPhone = await PhoneModel.findOne({
        where: {
          countryCode: phoneData.countryCode,
          phone: phoneData.phone,
          userId: phoneData.userId,
        },
      })

      if (!existingPhone) {
        await PhoneModel.create({
          countryCode: phoneData.countryCode,
          default: phoneData.default,
          label: phoneData.label,
          phone: phoneData.phone,
          regionCode: phoneData.regionCode,
          userId: phoneData.userId,
          verifiedAt: phoneData.verifiedAt,
        })
        count++
        if (options.verbose) {
          console.log(`  ✓ Created phone: +${phoneData.countryCode} ${phoneData.phone}`)
        }
      } else if (options.verbose) {
        console.log(`  → Phone already exists: +${phoneData.countryCode} ${phoneData.phone}`)
      }
    }

    return count
  },
}
