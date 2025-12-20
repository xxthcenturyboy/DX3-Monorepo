import { APP_DOMAIN } from '@dx3/models-shared'

import {
  TEST_EMAIL,
  TEST_EMAIL_ADMIN,
  TEST_EMAIL_NEW,
  TEST_EMAIL_NEW_2,
  TEST_EMAIL_SUPERADMIN,
} from './test-email.consts'

describe('Test Email Constants (test-email.consts.ts)', () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  describe('TEST_EMAIL', () => {
    it('should be defined', () => {
      expect(TEST_EMAIL).toBeDefined()
      expect(typeof TEST_EMAIL).toBe('string')
    })

    it('should be in valid email format', () => {
      expect(TEST_EMAIL).toMatch(emailRegex)
    })

    it('should use APP_DOMAIN', () => {
      expect(TEST_EMAIL).toBe(`test@${APP_DOMAIN}`)
    })
  })

  describe('TEST_EMAIL_ADMIN', () => {
    it('should be defined', () => {
      expect(TEST_EMAIL_ADMIN).toBeDefined()
      expect(typeof TEST_EMAIL_ADMIN).toBe('string')
    })

    it('should be in valid email format', () => {
      expect(TEST_EMAIL_ADMIN).toMatch(emailRegex)
    })

    it('should use APP_DOMAIN', () => {
      expect(TEST_EMAIL_ADMIN).toBe(`admin@${APP_DOMAIN}`)
    })
  })

  describe('TEST_EMAIL_NEW', () => {
    it('should be defined', () => {
      expect(TEST_EMAIL_NEW).toBeDefined()
      expect(typeof TEST_EMAIL_NEW).toBe('string')
    })

    it('should be in valid email format', () => {
      expect(TEST_EMAIL_NEW).toMatch(emailRegex)
    })

    it('should use APP_DOMAIN', () => {
      expect(TEST_EMAIL_NEW).toBe(`admin@${APP_DOMAIN}`)
    })
  })

  describe('TEST_EMAIL_NEW_2', () => {
    it('should be defined', () => {
      expect(TEST_EMAIL_NEW_2).toBeDefined()
      expect(typeof TEST_EMAIL_NEW_2).toBe('string')
    })

    it('should be in valid email format', () => {
      expect(TEST_EMAIL_NEW_2).toMatch(emailRegex)
    })

    it('should use APP_DOMAIN', () => {
      expect(TEST_EMAIL_NEW_2).toBe(`admin@${APP_DOMAIN}`)
    })
  })

  describe('TEST_EMAIL_SUPERADMIN', () => {
    it('should be defined', () => {
      expect(TEST_EMAIL_SUPERADMIN).toBeDefined()
      expect(typeof TEST_EMAIL_SUPERADMIN).toBe('string')
    })

    it('should be in valid email format', () => {
      expect(TEST_EMAIL_SUPERADMIN).toMatch(emailRegex)
    })

    it('should use APP_DOMAIN', () => {
      expect(TEST_EMAIL_SUPERADMIN).toBe(`superadmin@${APP_DOMAIN}`)
    })
  })

  describe('Email Uniqueness', () => {
    it('should have unique email values', () => {
      expect(TEST_EMAIL).not.toBe(TEST_EMAIL_ADMIN)
      expect(TEST_EMAIL).not.toBe(TEST_EMAIL_SUPERADMIN)
      expect(TEST_EMAIL_ADMIN).not.toBe(TEST_EMAIL_SUPERADMIN)
    })

    it('should all use the same domain', () => {
      const domain = APP_DOMAIN
      expect(TEST_EMAIL.endsWith(domain)).toBe(true)
      expect(TEST_EMAIL_ADMIN.endsWith(domain)).toBe(true)
      expect(TEST_EMAIL_SUPERADMIN.endsWith(domain)).toBe(true)
    })
  })
})
