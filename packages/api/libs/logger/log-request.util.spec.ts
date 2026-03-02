import { logRequest } from './log-request.util'

const mockLogError = jest.fn()
const mockLogInfo = jest.fn()

jest.mock('./logger-api.class', () => ({
  ApiLoggingClass: {
    get instance() {
      return {
        logError: mockLogError,
        logInfo: mockLogInfo,
      }
    },
  },
}))

function createMockRequest(overrides: Record<string, unknown> = {}) {
  return {
    body: {},
    fingerprint: undefined,
    geo: undefined,
    headers: {},
    ip: '127.0.0.1',
    method: 'GET',
    params: {},
    query: {},
    user: undefined,
    ...overrides,
  } as unknown as Parameters<typeof logRequest>[0]['req']
}

describe('logRequest', () => {
  beforeEach(() => {
    mockLogError.mockClear()
    mockLogInfo.mockClear()
  })

  it('should exist when imported', () => {
    expect(logRequest).toBeDefined()
  })

  it('should call logInfo for non-fail type', () => {
    const req = createMockRequest()
    logRequest({ req, type: 'REQUEST' })
    expect(mockLogInfo).toHaveBeenCalled()
    expect(mockLogError).not.toHaveBeenCalled()
  })

  it('should call logError for fail type', () => {
    const req = createMockRequest()
    logRequest({ req, type: 'FAIL_AUTH' })
    expect(mockLogError).toHaveBeenCalled()
    expect(mockLogInfo).not.toHaveBeenCalled()
  })

  it('should call logError when type starts with fail (case insensitive)', () => {
    const req = createMockRequest()
    logRequest({ req, type: 'failed_validation' })
    expect(mockLogError).toHaveBeenCalled()
  })

  it('should include method and ip in log output', () => {
    const req = createMockRequest({ ip: '192.168.1.1', method: 'POST' })
    logRequest({ req, type: 'TEST' })
    expect(mockLogInfo).toHaveBeenCalledWith(expect.stringContaining('method: POST'))
    expect(mockLogInfo).toHaveBeenCalledWith(expect.stringContaining('ip: 192.168.1.1'))
  })

  it('should include userId when req.user is set', () => {
    const req = createMockRequest({ user: { id: 'user-123' } })
    logRequest({ req, type: 'TEST' })
    expect(mockLogInfo).toHaveBeenCalledWith(expect.stringContaining('userId: user-123'))
  })

  it('should include logged-out when req.user is not set', () => {
    const req = createMockRequest()
    logRequest({ req, type: 'TEST' })
    expect(mockLogInfo).toHaveBeenCalledWith(expect.stringContaining('logged-out'))
  })

  it('should include fingerprint when req.fingerprint is set', () => {
    const req = createMockRequest({ fingerprint: 'fp-abc123' })
    logRequest({ req, type: 'TEST' })
    expect(mockLogInfo).toHaveBeenCalledWith(expect.stringContaining('fingerprint: fp-abc123'))
  })

  it('should include geo summary when req.geo has data', () => {
    const req = createMockRequest({
      geo: {
        city: { names: { en: 'London' } },
        country: { iso_code: 'GB' },
        subdivisions: [{ iso_code: 'ENG' }],
      },
    })
    logRequest({ req, type: 'TEST' })
    expect(mockLogInfo).toHaveBeenCalledWith(
      expect.stringMatching(/geo:.*country=GB|geo:.*city=London|geo:.*region=ENG/),
    )
  })

  it('should include message when provided', () => {
    const req = createMockRequest()
    logRequest({ message: 'Custom message', req, type: 'TEST' })
    expect(mockLogInfo).toHaveBeenCalledWith(expect.stringContaining('msg: Custom message'))
  })

  it('should use X-Forwarded-For when present', () => {
    const req = createMockRequest({
      headers: { 'X-Forwarded-For': '10.0.0.1' },
      ip: '127.0.0.1',
    })
    logRequest({ req, type: 'TEST' })
    expect(mockLogInfo).toHaveBeenCalledWith(expect.stringContaining('ip: 10.0.0.1'))
  })
})
