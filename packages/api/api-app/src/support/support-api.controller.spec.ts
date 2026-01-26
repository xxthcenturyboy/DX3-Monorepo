import { SupportController } from './support-api.controller'

jest.mock('@dx3/api-libs/auth/tokens/token.service')
jest.mock('@dx3/api-libs/headers/header.service')
jest.mock('@dx3/api-libs/support')
jest.mock('@dx3/api-libs/logger/log-request.util')

describe('SupportController', () => {
  it('should exist when imported', () => {
    expect(SupportController).toBeDefined()
  })

  it('should have the correct methods', () => {
    expect(SupportController.bulkUpdateStatus).toBeDefined()
    expect(SupportController.createRequest).toBeDefined()
    expect(SupportController.getById).toBeDefined()
    expect(SupportController.getByUserId).toBeDefined()
    expect(SupportController.getList).toBeDefined()
    expect(SupportController.getUnviewedCount).toBeDefined()
    expect(SupportController.markAllAsViewed).toBeDefined()
    expect(SupportController.markAsViewed).toBeDefined()
    expect(SupportController.updateStatus).toBeDefined()
  })

  describe('createRequest', () => {
    it('should be a function', () => {
      expect(typeof SupportController.createRequest).toBe('function')
    })
  })

  describe('getList', () => {
    it('should be a function', () => {
      expect(typeof SupportController.getList).toBe('function')
    })
  })

  describe('getById', () => {
    it('should be a function', () => {
      expect(typeof SupportController.getById).toBe('function')
    })
  })

  describe('updateStatus', () => {
    it('should be a function', () => {
      expect(typeof SupportController.updateStatus).toBe('function')
    })
  })

  describe('markAsViewed', () => {
    it('should be a function', () => {
      expect(typeof SupportController.markAsViewed).toBe('function')
    })
  })

  describe('markAllAsViewed', () => {
    it('should be a function', () => {
      expect(typeof SupportController.markAllAsViewed).toBe('function')
    })
  })

  describe('getUnviewedCount', () => {
    it('should be a function', () => {
      expect(typeof SupportController.getUnviewedCount).toBe('function')
    })
  })

  describe('bulkUpdateStatus', () => {
    it('should be a function', () => {
      expect(typeof SupportController.bulkUpdateStatus).toBe('function')
    })
  })

  describe('getByUserId', () => {
    it('should be a function', () => {
      expect(typeof SupportController.getByUserId).toBe('function')
    })
  })
})
