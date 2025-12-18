import axios, { type AxiosResponse } from 'axios'

import type {
  AndroiodWellKnownData,
  AppleWellKnownData,
  HealthzStatusType,
} from '@dx3/models-shared'

describe('Root Routes', () => {
  describe('GET /api/healthz/h', () => {
    it('should return healthz info when queried', async () => {
      // arrange
      const STATUS_OK = 'OK'
      let res: AxiosResponse<HealthzStatusType>
      // act
      res = await axios.get(`/api/healthz/h`)
      // assert
      expect(res.status).toBe(200)
      expect(res.data).toBeDefined()
      expect(res.data.status).toBe(STATUS_OK)
      expect(res.data.http.status).toBe(STATUS_OK)
      expect(res.data.memory.status).toBe(STATUS_OK)
      expect(res.data.postgres.status).toBe(STATUS_OK)
      expect(res.data.redis.status).toBe(STATUS_OK)
    })
  })

  describe('GET /api/livez', () => {
    it('should return livez info when queried', async () => {
      // arrange
      let res: AxiosResponse<unknown>
      // act
      res = await axios.get(`/api/livez`)
      // assert
      expect(res.status).toBe(200)
      expect(res.data).toBeDefined()
      expect(res.data).toEqual('OK')
    })
  })

  describe('GET /api/.well-known/assetlinks.json', () => {
    it('should return AndroiodWellKnownData info when queried', async () => {
      // arrange
      let res: AxiosResponse<AndroiodWellKnownData>
      // act
      res = await axios.get(`/api/.well-known/assetlinks.json`)
      // assert
      expect(res.status).toBe(200)
      expect(res.data).toBeDefined()
      expect(Array.isArray(res.data)).toBe(true)
    })
  })

  describe('GET /api/.well-known/apple-app-site-association', () => {
    it('should return AndroiodWellKnownData info when queried', async () => {
      // arrange
      let res: AxiosResponse<AppleWellKnownData>
      // act
      res = await axios.get(`/api/.well-known/apple-app-site-association`)
      // assert
      expect(res.status).toBe(200)
      expect(res.data).toBeDefined()
      expect(Array.isArray(res.data.applinks)).toBeDefined()
      expect(Array.isArray(res.data.webcredentials)).toBeDefined()
    })
  })
})
