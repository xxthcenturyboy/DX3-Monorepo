import { seeders } from './seeders'

describe('seeders', () => {
  it('should export seeders array', () => {
    expect(seeders).toBeDefined()
    expect(Array.isArray(seeders)).toBe(true)
  })

  it('should have at least one seeder', () => {
    expect(seeders.length).toBeGreaterThan(0)
  })

  it('should have seeders with required Seeder shape', () => {
    for (const seeder of seeders) {
      expect(seeder).toHaveProperty('name')
      expect(seeder).toHaveProperty('order')
      expect(seeder).toHaveProperty('run')
      expect(typeof seeder.name).toBe('string')
      expect(typeof seeder.order).toBe('number')
      expect(typeof seeder.run).toBe('function')
    }
  })

  it('should have seeders sorted by order ascending', () => {
    for (let i = 1; i < seeders.length; i++) {
      expect(seeders[i].order).toBeGreaterThanOrEqual(seeders[i - 1].order)
    }
  })

  it('should have expected seeder names', () => {
    const names = seeders.map((s) => s.name)
    expect(names).toContain('UserPrivilegeSetSeeder')
    expect(names).toContain('UserSeeder')
    expect(names).toContain('EmailSeeder')
    expect(names).toContain('PhoneSeeder')
  })

  it('should have run function that is callable', () => {
    for (const seeder of seeders) {
      expect(seeder.run).toBeInstanceOf(Function)
    }
  })
})
