/**
 * Mock for node:dns/promises.
 * Avoids real DNS lookups in unit tests.
 */

const defaultMxRecords = [{ exchange: 'mx.example.com', priority: 10 }]

export const mockResolveMx = jest.fn().mockResolvedValue(defaultMxRecords)

export const resolveMx = mockResolveMx
