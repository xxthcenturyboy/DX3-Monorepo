/**
 * Reserved and invalid TLDs per RFC 6761 and related specs.
 * Used as fallback when Reference Data API is not configured
 * to reject emails with non-delegated TLDs.
 */
export const INVALID_TLDS = ['example', 'invalid', 'local', 'localhost', 'test'] as const

export type InvalidTldType = (typeof INVALID_TLDS)[number]
