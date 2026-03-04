import { AxiosHeaders } from 'axios'

import { HEADER_API_VERSION_PROP } from '@dx3/models-shared'

import { apiWeb, getCustomHeaders } from './web.api'

describe('web.api', () => {
  describe('apiWeb', () => {
    it('should exist when imported', () => {
      expect(apiWeb).toBeDefined()
    })

    it('should have the correct reducerPath', () => {
      expect(apiWeb.reducerPath).toBe('api')
    })

    it('should have middleware property', () => {
      expect(typeof apiWeb.middleware).toBe('function')
    })

    it('should have reducerPath set to "api"', () => {
      expect(apiWeb.reducerPath).toBe('api')
    })
  })

  describe('getCustomHeaders', () => {
    it('should return an AxiosHeaders instance', () => {
      const headers = getCustomHeaders({ version: 1 })
      expect(headers).toBeInstanceOf(AxiosHeaders)
    })

    it('should set the api version header', () => {
      const headers = getCustomHeaders({ version: 1 })
      expect(headers.get(HEADER_API_VERSION_PROP)).toBe('1')
    })

    it('should set Content-Type when provided', () => {
      const headers = getCustomHeaders({ contentType: 'application/json', version: 1 })
      expect(headers.get('Content-Type')).toBe('application/json')
    })

    it('should not set Content-Type when not provided', () => {
      const headers = getCustomHeaders({ version: 1 })
      expect(headers.get('Content-Type')).toBeFalsy()
    })
  })
})
