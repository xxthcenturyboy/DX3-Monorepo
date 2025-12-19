# API e2e

apps/api-app-e2e/src/api/
├── root-route.spec.ts        # Health checks, well-known endpoints
├── v1/
│   ├── auth-flow-v1.spec.ts  # Authentication flows
│   ├── email-v1.spec.ts      # Email functionality
│   ├── media-v1.spec.ts      # Media upload/download
│   ├── notifications-v1.spec.ts # Push notifications
│   ├── phone-v1.spec.ts      # Phone verification
│   ├── shortlink-v1.spec.ts  # Shortlink functionality
│   ├── user-privilege-v1.spec.ts # User permissions
│   └── user-v1.spec.ts       # User management


## Testing

Run all api-app-e2e tests
```Bash
pnpm --filter @dx3/api-app-e2e test:runInBand
```

Run with verbose output
```Bash
pnpm --filter @dx3/api-app-e2e test --verbose --runInBand
```

Run specific test file (by filename only - no path needed!)
```Bash
pnpm --filter @dx3/api-app-e2e test auth-flow-v1.spec.ts
pnpm --filter @dx3/api-app-e2e test root-route.spec.ts
pnpm --filter @dx3/api-app-e2e test user-v1.spec.ts
pnpm --filter @dx3/api-app-e2e test media-v1.spec.ts
```

Run a specific test in a testfile
```Bash
pnpm --filter @dx3/api-app-e2e test --testPathPattern="auth-flow-v1" -t "should return an error when sent with an existing email."
```

Run tests in CI mode (with coverage)
```Bash
pnpm --filter @dx3/api-app-e2e test:ci
```

Debug mode (verbose output, detect open handles)
```Bash
pnpm --filter @dx3/api-app-e2e test:debug
```

## Global Authentication

Tests automatically authenticate via `test-setup.ts` before each test file runs. The global auth state is available in all test files:

```typescript
import {
  getGlobalAuthUtil,
  getGlobalAuthResponse
} from '../../support/test-setup';

describe('My API Tests', () => {
  let authUtil: AuthUtilType;
  let authRes: AuthSuccessResponseType;

  beforeAll(async () => {
    // Use global authentication - no need to login manually
    authUtil = getGlobalAuthUtil();
    authRes = getGlobalAuthResponse();
  });

  test('should make authenticated request', async () => {
    const request = {
      url: '/api/v1/protected-endpoint',
      method: 'GET',
      headers: {
        ...authUtil.getHeaders(),
      },
      withCredentials: true,
    };

    const result = await axios.request(request);
    expect(result.status).toBe(200);
  });
});
```

### Auth Flow Tests

The `auth-flow-v1.spec.ts` file is automatically excluded from global login since it tests authentication functionality itself. It handles its own auth instances.

### Creating Separate Auth Contexts

For tests that need to authenticate as a different user:

```typescript
import { AuthUtil } from '../auth/auth-util-v1';

// Create separate auth instance for test-specific user
const testUserAuthUtil = new AuthUtil();
await testUserAuthUtil.loginEmalPasswordless(email, otpCode);
```

## Environment Variables

- `HOST`: API host (default: `localhost`)
- `PORT`: API port (default: `4000`)
- `API_URL`: Full API URL (overrides HOST:PORT)

## Troubleshooting

### "Converting circular structure to JSON" Error

If you get this error, it's because Axios response objects contain circular references that Jest can't serialize between processes.

**Solutions:**
1. **Use `--runInBand`** (runs tests serially, no worker processes)
2. **Clean response objects** before storing them

**Example:**
```typescript
// ❌ Bad - stores circular response object
const response = await axios.get('/api/test');
expect(response).toBeDefined(); // Can cause circular reference error

// ✅ Good - extract specific data
const response = await axios.get('/api/test');
expect(response.status).toBe(200);
expect(response.data).toMatchObject({ success: true });
```

Check if API server is running
```Bash
curl http://localhost:4000/api/livez
curl http://localhost:4000/api/healthz
```

View test logs
```Bash
tail -f logs/api-app-e2e.log
```
