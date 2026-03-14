/**
 * RBAC Test Suite
 *
 * Verifies that each protected endpoint tier correctly enforces access control.
 *
 * Status code conventions in this codebase (counterintuitive but consistent):
 *   403 — unauthenticated (no token) — ensureLoggedIn middleware
 *   401 — authenticated but insufficient role — hasAdminRole / hasSuperAdminRole
 *   200 — correct role granted
 *
 * Roles tested:
 *   USER    — basic authenticated user
 *   ADMIN   — user management, support admin
 *   SUPER_ADMIN — feature flag admin, system-wide config
 *
 * Note: /api/livez is mounted on the baseRouter (version-agnostic) and returns 405
 * when called with the X-API-Version: 1 header used by the E2E test suite.
 * Blog endpoints are used instead to cover the "public, no-auth" tier.
 *
 * Note: GET /api/feature-flag and GET /api/feature-flag/admin return 400 when the
 * feature-flag service encounters an error (e.g. no flags seeded). The auth gate
 * still passes correctly — these tests verify access is not blocked (not 403/401).
 */
import axios, { type AxiosError, type AxiosRequestConfig } from 'axios'

import { getAuthHeaders } from '../../support/test-setup'

const errorLogSpyMock = jest.spyOn(console, 'error').mockImplementation(() => {})

afterAll(() => {
  errorLogSpyMock.mockRestore()
})

async function expectStatus(request: AxiosRequestConfig, expectedStatus: number): Promise<void> {
  try {
    const response = await axios.request(request)
    expect(response.status).toBe(expectedStatus)
  } catch (err) {
    const typedError = err as AxiosError
    if (typedError.response !== undefined) {
      expect(typedError.response.status).toBe(expectedStatus)
    } else {
      // Re-throw non-Axios errors (e.g. Jest assertion errors) so they surface correctly
      throw err
    }
  }
}

/**
 * Verifies that the auth gate passes — the response is not a 401 or 403.
 * The endpoint may return 200 (data) or 400 (service error) depending on seeded state;
 * both indicate that authentication and authorization succeeded.
 */
async function expectAuthPasses(request: AxiosRequestConfig): Promise<void> {
  try {
    const response = await axios.request(request)
    expect(response.status).not.toBe(401)
    expect(response.status).not.toBe(403)
  } catch (err) {
    const typedError = err as AxiosError
    if (typedError.response !== undefined) {
      expect(typedError.response.status).not.toBe(401)
      expect(typedError.response.status).not.toBe(403)
    } else {
      throw err
    }
  }
}

describe('RBAC — Public endpoints (no auth required)', () => {
  test('GET /api/blog/posts should return 200 without auth', async () => {
    await expectStatus({ method: 'GET', url: '/api/blog/posts' }, 200)
  })

  test('GET /api/blog/categories should return 200 without auth', async () => {
    await expectStatus({ method: 'GET', url: '/api/blog/categories' }, 200)
  })

  test('GET /api/blog/tags should return 200 without auth', async () => {
    await expectStatus({ method: 'GET', url: '/api/blog/tags' }, 200)
  })
})

describe('RBAC — Authenticated (USER+) endpoints', () => {
  test('GET /api/feature-flag returns 403 without auth', async () => {
    await expectStatus({ method: 'GET', url: '/api/feature-flag' }, 403)
  })

  test('GET /api/feature-flag passes auth gate for USER', async () => {
    await expectAuthPasses({ headers: getAuthHeaders('user'), method: 'GET', url: '/api/feature-flag' })
  })

  test('GET /api/feature-flag passes auth gate for ADMIN', async () => {
    await expectAuthPasses({ headers: getAuthHeaders('admin'), method: 'GET', url: '/api/feature-flag' })
  })

  test('GET /api/feature-flag passes auth gate for SUPERADMIN', async () => {
    await expectAuthPasses({ headers: getAuthHeaders('superadmin'), method: 'GET', url: '/api/feature-flag' })
  })
})

describe('RBAC — ADMIN+ endpoints', () => {
  test('GET /api/user/list returns 403 without auth', async () => {
    await expectStatus({ method: 'GET', url: '/api/user/list' }, 403)
  })

  test('GET /api/user/list returns 401 for USER', async () => {
    await expectStatus(
      { headers: getAuthHeaders('user'), method: 'GET', url: '/api/user/list' },
      401,
    )
  })

  test('GET /api/user/list returns 200 for ADMIN', async () => {
    await expectStatus(
      { headers: getAuthHeaders('admin'), method: 'GET', url: '/api/user/list' },
      200,
    )
  })

  test('GET /api/user/list returns 200 for SUPERADMIN', async () => {
    await expectStatus(
      { headers: getAuthHeaders('superadmin'), method: 'GET', url: '/api/user/list' },
      200,
    )
  })

  test('GET /api/support/list returns 403 without auth', async () => {
    await expectStatus({ method: 'GET', url: '/api/support/list' }, 403)
  })

  test('GET /api/support/list returns 401 for USER', async () => {
    await expectStatus(
      { headers: getAuthHeaders('user'), method: 'GET', url: '/api/support/list' },
      401,
    )
  })

  test('GET /api/support/list returns 200 for ADMIN', async () => {
    await expectStatus(
      { headers: getAuthHeaders('admin'), method: 'GET', url: '/api/support/list' },
      200,
    )
  })

  test('POST /api/notification/user returns 401 for USER', async () => {
    await expectStatus(
      {
        data: { level: 'INFO', message: 'test', title: 'test', userId: 'test' },
        headers: getAuthHeaders('user'),
        method: 'POST',
        url: '/api/notification/user',
      },
      401,
    )
  })

  test('POST /api/notification/all-users returns 401 for USER', async () => {
    await expectStatus(
      {
        data: { level: 'INFO', message: 'test', title: 'test' },
        headers: getAuthHeaders('user'),
        method: 'POST',
        url: '/api/notification/all-users',
      },
      401,
    )
  })
})

describe('RBAC — SUPER_ADMIN only endpoints', () => {
  test('GET /api/feature-flag/admin returns 403 without auth', async () => {
    await expectStatus({ method: 'GET', url: '/api/feature-flag/admin' }, 403)
  })

  test('GET /api/feature-flag/admin returns 401 for USER', async () => {
    await expectStatus(
      { headers: getAuthHeaders('user'), method: 'GET', url: '/api/feature-flag/admin' },
      401,
    )
  })

  test('GET /api/feature-flag/admin returns 401 for ADMIN', async () => {
    await expectStatus(
      { headers: getAuthHeaders('admin'), method: 'GET', url: '/api/feature-flag/admin' },
      401,
    )
  })

  test('GET /api/feature-flag/admin passes auth gate for SUPERADMIN', async () => {
    await expectAuthPasses({ headers: getAuthHeaders('superadmin'), method: 'GET', url: '/api/feature-flag/admin' })
  })

  test('POST /api/notification/app-update returns 401 for ADMIN', async () => {
    await expectStatus(
      {
        headers: getAuthHeaders('admin'),
        method: 'POST',
        url: '/api/notification/app-update',
      },
      401,
    )
  })

  test('POST /api/notification/app-update returns 200 for SUPERADMIN', async () => {
    await expectStatus(
      {
        headers: getAuthHeaders('superadmin'),
        method: 'POST',
        url: '/api/notification/app-update',
      },
      200,
    )
  })
})
