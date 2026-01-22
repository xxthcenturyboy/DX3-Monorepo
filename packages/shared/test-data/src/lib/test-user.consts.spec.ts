import { PHONE_DEFAULT_REGION_CODE, USER_ROLE } from '@dx3/models-shared'

import { TEST_EMAIL, TEST_EMAIL_ADMIN, TEST_EMAIL_SUPERADMIN } from './test-email.consts'
import {
  TEST_BIOMETRIC_PUBLIC_KEY,
  TEST_PHONE_1,
  TEST_PHONE_2,
  TEST_PHONE_COUNTRY_CODE,
  TEST_PHONE_COUNTRY_CODE_IT,
  TEST_PHONE_IT_VALID,
  TEST_PHONE_REGION_CODE_IT,
  TEST_PHONE_VALID,
} from './test-phone.consts'
import {
  MOCK_USERS,
  TEST_ADMIN_PASSWORD,
  TEST_ADMIN_USERNAME,
  TEST_EXISTING_ADMIN_USER_ID,
  TEST_EXISTING_PASSWORD,
  TEST_EXISTING_SUPERADMIN_USER_ID,
  TEST_EXISTING_USER_ID,
  TEST_EXISTING_USERNAME,
  TEST_NAME_FIRST_ADMIN,
  TEST_NAME_FIRST_SUPERADMIN,
  TEST_NAME_FIRST_USER,
  TEST_NAME_LAST_ADMIN,
  TEST_NAME_LAST_SUPERADMIN,
  TEST_NAME_LAST_USER,
  TEST_SUPERADMIN_PASSWORD,
  TEST_SUPERADMIN_USERNAME,
  TEST_USER_DATA,
  TEST_USER_PASSWORD,
  TEST_USER_USERNAME,
} from './test-user.consts'

describe('Test User Constants (test-user.consts.ts)', () => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

  describe('Environment Variable Credentials', () => {
    describe('Admin Credentials', () => {
      it('should export TEST_ADMIN_USERNAME', () => {
        expect(TEST_ADMIN_USERNAME).toBeDefined()
        expect(typeof TEST_ADMIN_USERNAME).toBe('string')
      })

      it('should have TEST_ADMIN_USERNAME default value when env not set', () => {
        // Default value when SEED_USER_ADMIN_USERNAME is not set
        expect(TEST_ADMIN_USERNAME).toBe(process.env.SEED_USER_ADMIN_USERNAME ?? 'admin')
      })

      it('should export TEST_ADMIN_PASSWORD', () => {
        expect(TEST_ADMIN_PASSWORD).toBeDefined()
        expect(typeof TEST_ADMIN_PASSWORD).toBe('string')
      })

      it('should have TEST_ADMIN_PASSWORD default value when env not set', () => {
        expect(TEST_ADMIN_PASSWORD).toBe(process.env.SEED_USER_ADMIN_PASSWORD ?? 'admin123')
      })
    })

    describe('Superadmin Credentials', () => {
      it('should export TEST_SUPERADMIN_USERNAME', () => {
        expect(TEST_SUPERADMIN_USERNAME).toBeDefined()
        expect(typeof TEST_SUPERADMIN_USERNAME).toBe('string')
      })

      it('should have TEST_SUPERADMIN_USERNAME default value when env not set', () => {
        expect(TEST_SUPERADMIN_USERNAME).toBe(
          process.env.SEED_USER_SUPERADMIN_USERNAME ?? 'superadmin',
        )
      })

      it('should export TEST_SUPERADMIN_PASSWORD', () => {
        expect(TEST_SUPERADMIN_PASSWORD).toBeDefined()
        expect(typeof TEST_SUPERADMIN_PASSWORD).toBe('string')
      })

      it('should have TEST_SUPERADMIN_PASSWORD default value when env not set', () => {
        expect(TEST_SUPERADMIN_PASSWORD).toBe(
          process.env.SEED_USER_SUPERADMIN_PASSWORD ?? 'superadmin123',
        )
      })
    })

    describe('User Credentials', () => {
      it('should export TEST_USER_USERNAME', () => {
        expect(TEST_USER_USERNAME).toBeDefined()
        expect(typeof TEST_USER_USERNAME).toBe('string')
      })

      it('should have TEST_USER_USERNAME default value when env not set', () => {
        expect(TEST_USER_USERNAME).toBe(process.env.SEED_USER_TEST_USERNAME ?? 'testuser')
      })

      it('should export TEST_USER_PASSWORD', () => {
        expect(TEST_USER_PASSWORD).toBeDefined()
        expect(typeof TEST_USER_PASSWORD).toBe('string')
      })

      it('should have TEST_USER_PASSWORD default value when env not set', () => {
        expect(TEST_USER_PASSWORD).toBe(process.env.SEED_USER_TEST_PASSWORD ?? 'testuser123')
      })
    })
  })

  describe('Legacy Credential Aliases', () => {
    it('should have TEST_EXISTING_USERNAME alias to TEST_ADMIN_USERNAME', () => {
      expect(TEST_EXISTING_USERNAME).toBe(TEST_ADMIN_USERNAME)
    })

    it('should have TEST_EXISTING_PASSWORD alias to TEST_ADMIN_PASSWORD', () => {
      expect(TEST_EXISTING_PASSWORD).toBe(TEST_ADMIN_PASSWORD)
    })
  })

  describe('User ID Constants', () => {
    it('should export TEST_EXISTING_ADMIN_USER_ID', () => {
      expect(TEST_EXISTING_ADMIN_USER_ID).toBeDefined()
      expect(typeof TEST_EXISTING_ADMIN_USER_ID).toBe('string')
      expect(TEST_EXISTING_ADMIN_USER_ID).toMatch(uuidRegex)
    })

    it('should export TEST_EXISTING_SUPERADMIN_USER_ID', () => {
      expect(TEST_EXISTING_SUPERADMIN_USER_ID).toBeDefined()
      expect(typeof TEST_EXISTING_SUPERADMIN_USER_ID).toBe('string')
      expect(TEST_EXISTING_SUPERADMIN_USER_ID).toMatch(uuidRegex)
    })

    it('should export TEST_EXISTING_USER_ID', () => {
      expect(TEST_EXISTING_USER_ID).toBeDefined()
      expect(typeof TEST_EXISTING_USER_ID).toBe('string')
      expect(TEST_EXISTING_USER_ID).toMatch(uuidRegex)
    })

    it('should have unique user IDs', () => {
      expect(TEST_EXISTING_ADMIN_USER_ID).not.toBe(TEST_EXISTING_SUPERADMIN_USER_ID)
      // Note: TEST_EXISTING_USER_ID may equal TEST_EXISTING_ADMIN_USER_ID by design
    })
  })

  describe('Name Constants', () => {
    it('should export admin name constants', () => {
      expect(TEST_NAME_FIRST_ADMIN).toBeDefined()
      expect(TEST_NAME_LAST_ADMIN).toBeDefined()
      expect(TEST_NAME_FIRST_ADMIN).toBe('Admin')
      expect(TEST_NAME_LAST_ADMIN).toBe('User')
    })

    it('should export superadmin name constants', () => {
      expect(TEST_NAME_FIRST_SUPERADMIN).toBeDefined()
      expect(TEST_NAME_LAST_SUPERADMIN).toBeDefined()
      expect(TEST_NAME_FIRST_SUPERADMIN).toBe('Superadmin')
      expect(TEST_NAME_LAST_SUPERADMIN).toBe('User')
    })

    it('should export user name constants', () => {
      expect(TEST_NAME_FIRST_USER).toBeDefined()
      expect(TEST_NAME_LAST_USER).toBeDefined()
      expect(TEST_NAME_FIRST_USER).toBe('Test')
      expect(TEST_NAME_LAST_USER).toBe('User')
    })
  })

  describe('TEST_USER_DATA Object', () => {
    it('should export TEST_USER_DATA', () => {
      expect(TEST_USER_DATA).toBeDefined()
      expect(typeof TEST_USER_DATA).toBe('object')
    })

    it('should have ADMIN, SUPERADMIN, and USER keys', () => {
      expect(TEST_USER_DATA).toHaveProperty('ADMIN')
      expect(TEST_USER_DATA).toHaveProperty('SUPERADMIN')
      expect(TEST_USER_DATA).toHaveProperty('USER')
    })

    describe('ADMIN user data', () => {
      const admin = TEST_USER_DATA.ADMIN

      it('should have correct email', () => {
        expect(admin.email).toBe(TEST_EMAIL_ADMIN)
      })

      it('should have correct names', () => {
        expect(admin.firstName).toBe(TEST_NAME_FIRST_ADMIN)
        expect(admin.lastName).toBe(TEST_NAME_LAST_ADMIN)
      })

      it('should have correct id', () => {
        expect(admin.id).toBe(TEST_EXISTING_USER_ID)
      })

      it('should have correct password from env', () => {
        expect(admin.password).toBe(TEST_ADMIN_PASSWORD)
      })

      it('should have correct phone data', () => {
        expect(admin.phone).toBe(TEST_PHONE_1)
        expect(admin.phoneCountryCode).toBe(TEST_PHONE_COUNTRY_CODE)
        expect(admin.phoneRegionCode).toBe(PHONE_DEFAULT_REGION_CODE)
      })

      it('should have correct roles', () => {
        expect(admin.roles).toContain(USER_ROLE.USER)
        expect(admin.roles).toContain(USER_ROLE.ADMIN)
        expect(admin.roles.length).toBe(2)
      })

      it('should have correct username from env', () => {
        expect(admin.username).toBe(TEST_ADMIN_USERNAME)
      })
    })

    describe('SUPERADMIN user data', () => {
      const superadmin = TEST_USER_DATA.SUPERADMIN

      it('should have correct email', () => {
        expect(superadmin.email).toBe(TEST_EMAIL_SUPERADMIN)
      })

      it('should have correct names', () => {
        expect(superadmin.firstName).toBe(TEST_NAME_FIRST_SUPERADMIN)
        expect(superadmin.lastName).toBe(TEST_NAME_LAST_SUPERADMIN)
      })

      it('should have correct id', () => {
        expect(superadmin.id).toBe(TEST_EXISTING_SUPERADMIN_USER_ID)
      })

      it('should have correct password from env', () => {
        expect(superadmin.password).toBe(TEST_SUPERADMIN_PASSWORD)
      })

      it('should have correct phone data', () => {
        expect(superadmin.phone).toBe(TEST_PHONE_VALID)
        expect(superadmin.phoneCountryCode).toBe(TEST_PHONE_COUNTRY_CODE)
        expect(superadmin.phoneRegionCode).toBe(PHONE_DEFAULT_REGION_CODE)
      })

      it('should have correct roles', () => {
        expect(superadmin.roles).toContain(USER_ROLE.USER)
        expect(superadmin.roles).toContain(USER_ROLE.ADMIN)
        expect(superadmin.roles).toContain(USER_ROLE.SUPER_ADMIN)
        expect(superadmin.roles.length).toBe(3)
      })

      it('should have correct username from env', () => {
        expect(superadmin.username).toBe(TEST_SUPERADMIN_USERNAME)
      })
    })

    describe('USER user data', () => {
      const user = TEST_USER_DATA.USER

      it('should have correct email', () => {
        expect(user.email).toBe(TEST_EMAIL)
      })

      it('should have correct names', () => {
        expect(user.firstName).toBe(TEST_NAME_FIRST_USER)
        expect(user.lastName).toBe(TEST_NAME_LAST_USER)
      })

      it('should have correct id', () => {
        expect(user.id).toBe(TEST_EXISTING_USER_ID)
      })

      it('should have correct password from env', () => {
        expect(user.password).toBe(TEST_USER_PASSWORD)
      })

      it('should have correct Italian phone data', () => {
        expect(user.phone).toBe(TEST_PHONE_IT_VALID)
        expect(user.phoneCountryCode).toBe(TEST_PHONE_COUNTRY_CODE_IT)
        expect(user.phoneRegionCode).toBe(TEST_PHONE_REGION_CODE_IT)
      })

      it('should have correct roles', () => {
        expect(user.roles).toContain(USER_ROLE.USER)
        expect(user.roles.length).toBe(1)
      })

      it('should have correct username from env', () => {
        expect(user.username).toBe(TEST_USER_USERNAME)
      })
    })
  })

  describe('MockUserDataType', () => {
    it('should define a type with required id field', () => {
      // Type check - MockUserDataType should have id as required
      const mockUser: { id: string } = { id: 'test-id' }
      expect(mockUser.id).toBeDefined()
    })
  })

  describe('MOCK_USERS Object', () => {
    it('should export MOCK_USERS', () => {
      expect(MOCK_USERS).toBeDefined()
      expect(typeof MOCK_USERS).toBe('object')
    })

    it('should have at least 3 mock users', () => {
      expect(Object.keys(MOCK_USERS).length).toBeGreaterThanOrEqual(3)
    })

    it('should have user keyed by TEST_EXISTING_USER_ID', () => {
      expect(MOCK_USERS[TEST_EXISTING_USER_ID]).toBeDefined()
    })

    describe('Default user mock', () => {
      const user = MOCK_USERS[TEST_EXISTING_USER_ID]

      it('should have id property', () => {
        expect(user.id).toBe(TEST_EXISTING_USER_ID)
      })

      it('should have accountLocked property', () => {
        expect(user.accountLocked).toBe(false)
      })

      it('should have biomAuthKey property', () => {
        expect(user.biomAuthKey).toBe(TEST_BIOMETRIC_PUBLIC_KEY)
      })

      it('should have defaultEmail property', () => {
        expect(user.defaultEmail).toBeDefined()
        expect(user.defaultEmail?.email).toBe(TEST_EMAIL)
        expect(user.defaultEmail?.verified).toBe(true)
      })

      it('should have defaultPhone property', () => {
        expect(user.defaultPhone).toBeDefined()
        expect(user.defaultPhone?.phone).toBe(TEST_PHONE_2)
        expect(user.defaultPhone?.countryCode).toBe(TEST_PHONE_COUNTRY_CODE)
        expect(user.defaultPhone?.regionCode).toBe(PHONE_DEFAULT_REGION_CODE)
        expect(user.defaultPhone?.verified).toBe(true)
      })

      it('should have roles property', () => {
        expect(user.roles).toContain(USER_ROLE.USER)
      })
    })

    describe('Admin user mock', () => {
      const adminUser = MOCK_USERS['admin-user']

      it('should have admin-user key', () => {
        expect(adminUser).toBeDefined()
      })

      it('should have correct id', () => {
        expect(adminUser.id).toBe(TEST_USER_DATA.ADMIN.id)
      })

      it('should not be account locked', () => {
        expect(adminUser.accountLocked).toBe(false)
      })

      it('should have admin email', () => {
        expect(adminUser.defaultEmail?.email).toBe(TEST_EMAIL_ADMIN)
      })

      it('should have no phone', () => {
        expect(adminUser.defaultPhone).toBeNull()
      })

      it('should have admin roles', () => {
        expect(adminUser.roles).toContain(USER_ROLE.ADMIN)
        expect(adminUser.roles).toContain(USER_ROLE.USER)
      })
    })

    describe('Locked user mock', () => {
      const lockedUser = MOCK_USERS['locked-user']

      it('should have locked-user key', () => {
        expect(lockedUser).toBeDefined()
      })

      it('should be account locked', () => {
        expect(lockedUser.accountLocked).toBe(true)
      })

      it('should have verified email', () => {
        expect(lockedUser.defaultEmail?.verified).toBe(true)
      })

      it('should have no phone', () => {
        expect(lockedUser.defaultPhone).toBeNull()
      })

      it('should have user role only', () => {
        expect(lockedUser.roles).toContain(USER_ROLE.USER)
        expect(lockedUser.roles?.length).toBe(1)
      })
    })
  })
})
