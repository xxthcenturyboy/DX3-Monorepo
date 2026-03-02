const configValues = { dbPath: '' }
const mockReaderGet = jest.fn()
const mockMaxmindOpen = jest.fn()

jest.mock('@dx3/api-libs/config/config-api.consts', () => ({
  get MAXMIND_GEOIP_DB_PATH() {
    return configValues.dbPath
  },
}))

jest.mock('@dx3/api-libs/logger', () => require('../testing/mocks/internal/logger.mock'))

jest.mock('maxmind', () => ({
  open: (...args: unknown[]) => mockMaxmindOpen(...args),
}))

async function getGeoIpService(): Promise<typeof import('./geoip-api.service').GeoIpService> {
  const mod = await import('./geoip-api.service')
  return mod.GeoIpService
}

describe('GeoIpService', () => {
  beforeEach(() => {
    jest.resetModules()
    configValues.dbPath = ''
    mockReaderGet.mockReset()
    mockMaxmindOpen.mockReset()
  })

  it('should exist when imported', async () => {
    const GeoIpService = await getGeoIpService()
    expect(GeoIpService).toBeDefined()
  })

  it('should have lookup static method', async () => {
    const GeoIpService = await getGeoIpService()
    expect(GeoIpService.lookup).toBeDefined()
    expect(typeof GeoIpService.lookup).toBe('function')
  })

  it('should return null when ip is empty', async () => {
    const GeoIpService = await getGeoIpService()
    const result = await GeoIpService.lookup('')
    expect(result).toBeNull()
    expect(mockMaxmindOpen).not.toHaveBeenCalled()
  })

  it('should return null when ip is undefined', async () => {
    const GeoIpService = await getGeoIpService()
    const result = await GeoIpService.lookup(undefined as unknown as string)
    expect(result).toBeNull()
  })

  it('should return null when MAXMIND_GEOIP_DB_PATH is not set', async () => {
    const GeoIpService = await getGeoIpService()
    const result = await GeoIpService.lookup('1.2.3.4')
    expect(result).toBeNull()
    expect(mockMaxmindOpen).not.toHaveBeenCalled()
  })

  it('should return city data when reader exists and get returns data', async () => {
    configValues.dbPath = '/path/to/GeoLite2-City.mmdb'
    const cityData = { city: { names: { en: 'Test City' } }, country: {} }
    mockReaderGet.mockReturnValue(cityData)
    mockMaxmindOpen.mockResolvedValue({ get: mockReaderGet } as never)

    const GeoIpService = await getGeoIpService()
    const result = await GeoIpService.lookup('1.2.3.4')

    expect(mockMaxmindOpen).toHaveBeenCalledWith('/path/to/GeoLite2-City.mmdb')
    expect(mockReaderGet).toHaveBeenCalledWith('1.2.3.4')
    expect(result).toEqual(cityData)
  })

  it('should return null when reader.get returns null', async () => {
    configValues.dbPath = '/path/to/db.mmdb'
    mockReaderGet.mockReturnValue(null)
    mockMaxmindOpen.mockResolvedValue({ get: mockReaderGet } as never)

    const GeoIpService = await getGeoIpService()
    const result = await GeoIpService.lookup('1.2.3.4')

    expect(result).toBeNull()
  })

  it('should return null when reader.get returns undefined', async () => {
    configValues.dbPath = '/path/to/db.mmdb'
    mockReaderGet.mockReturnValue(undefined)
    mockMaxmindOpen.mockResolvedValue({ get: mockReaderGet } as never)

    const GeoIpService = await getGeoIpService()
    const result = await GeoIpService.lookup('1.2.3.4')

    expect(result).toBeNull()
  })

  it('should return null when reader.get throws', async () => {
    configValues.dbPath = '/path/to/db.mmdb'
    mockReaderGet.mockReturnValue(null)
    mockMaxmindOpen.mockResolvedValue({ get: mockReaderGet } as never)
    mockReaderGet.mockImplementationOnce(() => {
      throw new Error('Lookup failed')
    })

    const GeoIpService = await getGeoIpService()
    const result = await GeoIpService.lookup('1.2.3.4')

    expect(result).toBeNull()
  })

  it('should return null when maxmind.open throws', async () => {
    configValues.dbPath = '/path/to/db.mmdb'
    mockMaxmindOpen.mockRejectedValue(new Error('Database load failed'))

    const GeoIpService = await getGeoIpService()
    const result = await GeoIpService.lookup('1.2.3.4')

    expect(result).toBeNull()
  })

  it('should cache reader between lookups', async () => {
    configValues.dbPath = '/path/to/db.mmdb'
    mockReaderGet.mockReturnValue({ city: {} })
    mockMaxmindOpen.mockResolvedValue({ get: mockReaderGet } as never)

    const GeoIpService = await getGeoIpService()
    await GeoIpService.lookup('1.2.3.4')
    await GeoIpService.lookup('5.6.7.8')

    expect(mockMaxmindOpen).toHaveBeenCalledTimes(1)
    expect(mockReaderGet).toHaveBeenCalledTimes(2)
  })

  it('should reuse pending promise when concurrent lookups race', async () => {
    configValues.dbPath = '/path/to/db.mmdb'
    mockReaderGet.mockReturnValue({ city: { names: { en: 'Test City' } } })

    let resolveOpen!: (value: unknown) => void
    const slowOpenPromise = new Promise((resolve) => {
      resolveOpen = resolve
    })
    mockMaxmindOpen.mockReturnValue(slowOpenPromise)

    const GeoIpService = await getGeoIpService()

    const p1 = GeoIpService.lookup('1.2.3.4')
    const p2 = GeoIpService.lookup('5.6.7.8')

    resolveOpen({ get: mockReaderGet })

    await p1
    await p2

    expect(mockMaxmindOpen).toHaveBeenCalledTimes(1)
  })

  it('should handle non-Error thrown during lookup', async () => {
    configValues.dbPath = '/path/to/db.mmdb'
    mockReaderGet.mockImplementation(() => {
      throw 'string error'
    })
    mockMaxmindOpen.mockResolvedValue({ get: mockReaderGet } as never)

    const GeoIpService = await getGeoIpService()
    const result = await GeoIpService.lookup('1.2.3.4')

    expect(result).toBeNull()
  })

  it('should handle non-Error thrown during maxmind open', async () => {
    configValues.dbPath = '/path/to/db.mmdb'
    mockMaxmindOpen.mockRejectedValue('string open error')

    const GeoIpService = await getGeoIpService()
    const result = await GeoIpService.lookup('1.2.3.4')

    expect(result).toBeNull()
  })
})
