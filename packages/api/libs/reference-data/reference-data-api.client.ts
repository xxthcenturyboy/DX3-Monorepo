import axios from 'axios'

import {
  REFERENCE_DATA_API_KEY,
  REFERENCE_DATA_API_SECRET,
  REFERENCE_DATA_API_URL,
} from '../config/config-api.consts'
import type { DomainCheckResultType } from './reference-data.types'

/**
 * Check if Reference Data API is configured.
 */
export function isReferenceDataApiConfigured(): boolean {
  return Boolean(REFERENCE_DATA_API_URL && REFERENCE_DATA_API_KEY && REFERENCE_DATA_API_SECRET)
}

/**
 * Check domain against Reference Data API.
 * Returns null if API not configured or request fails.
 */
export async function checkDomain(domain: string): Promise<DomainCheckResultType | null> {
  if (!isReferenceDataApiConfigured() || !domain) return null

  const apiKey = REFERENCE_DATA_API_KEY
  const apiSecret = REFERENCE_DATA_API_SECRET
  if (!apiKey || !apiSecret) return null

  const url = `${REFERENCE_DATA_API_URL.replace(/\/$/, '')}/check/domain/${encodeURIComponent(domain)}`

  try {
    const { data, status } = await axios.get<DomainCheckResultType>(url, {
      headers: {
        'X-API-Key': apiKey,
        'X-API-Secret': apiSecret,
      },
      timeout: 5000,
      validateStatus: (s) => s < 500,
    })
    if (status >= 200 && status < 300 && data) return data
    return null
  } catch {
    return null
  }
}
