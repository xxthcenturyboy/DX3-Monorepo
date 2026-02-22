import type { DomainCheckResultType } from '../../reference-data/reference-data.types'

/**
 * Mock for Reference Data API client.
 * Use in tests to avoid real HTTP requests.
 * Default: isReferenceDataApiConfigured returns false (API not configured).
 */

export const mockCheckDomain = jest.fn<
  Promise<DomainCheckResultType | null>,
  [domain: string]
>()

export const mockIsReferenceDataApiConfigured = jest.fn<boolean, []>()

// Default: API not configured, so EmailUtil uses static list + Joi fallback
mockIsReferenceDataApiConfigured.mockReturnValue(false)

// Re-export as real module names for jest.mock factory
export const checkDomain = mockCheckDomain
export const isReferenceDataApiConfigured = mockIsReferenceDataApiConfigured

export function mockReferenceDataApiClient(options?: {
  checkDomainResult?: DomainCheckResultType | null
  configured?: boolean
}) {
  mockIsReferenceDataApiConfigured.mockReturnValue(options?.configured ?? false)
  if (options?.checkDomainResult !== undefined) {
    mockCheckDomain.mockResolvedValue(options.checkDomainResult)
  } else {
    mockCheckDomain.mockResolvedValue({ disposable: false, validTld: true })
  }
}

export function resetReferenceDataApiClientMock(): void {
  mockIsReferenceDataApiConfigured.mockReturnValue(false)
  mockCheckDomain.mockReset()
}
