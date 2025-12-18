## Directory Structure

```
testing/
├── helpers/           # Test utilities and helper functions
│   ├── console-spy.ts # Console output spying and suppression
│   ├── test-utils.ts  # Custom Jest matchers and utilities
│   └── index.ts
├── mocks/             # Centralized mocks for common services
│   ├── index.ts       # centralized exports
│   ├── external/      # Mocks of external services like AWS, S3, Redis, anything in libs, etc
└── README.md          # This file
```

## How It Works

### Test Setup Flow

1. **`test-setup.ts`** runs before all tests
2. Loads `.env` file for environment configuration
3. Sets up all mocks via `setupAllMocks()`
4. All tests run with mocked dependencies (unit tests only)

### Writing Tests

#### Unit Test (Default)
```typescript
describe('MyService', () => {
  it('should do something', () => {
    // Config, database, etc. are automatically mocked
    expect(MyService.doSomething()).toBe(true);
  });
});
```

## Mocking Strategy

### Centralized Mocks
Use centralized mocks from `testing/mocks` instead of inline mocks:

```typescript
// ❌ Don't do this
jest.mock('../server/cookies/cookie.service', () => ({
  CookeiService: {
    setCookie: jest.fn(),
    // ...
  }
}));

// ✅ Do this instead
import { mockCookieService } from '../testing/mocks/server';
mockCookieService();
```

### Console Suppression
Use the console spy utility instead of manual suppression:

```typescript
// ❌ Don't do this
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

// ✅ Do this instead
import { useConsoleSpy } from '../testing/helpers';

const consoleSpy = useConsoleSpy();

beforeAll(() => consoleSpy.setup());
afterEach(() => consoleSpy.clear());
afterAll(() => consoleSpy.restore());
```

## Best Practices

1. **Write Unit Tests**: Tests should work without external dependencies
2. **Use Centralized Mocks**: Reuse mocks from `testing/mocks`
3. **Clean Up Resources**: Always clean up in `afterAll`
4. **Test Isolation**: Use `beforeEach` and `afterEach` to reset state
5. **Descriptive Names**: Use clear test names that explain what's being tested

## Troubleshooting

### Tests hang or don't exit
- Ensure all connections are closed in `afterAll`
- Check for unclosed Redis connections (`await redis.quit()`)
- Use `--detectOpenHandles` flag to find leaks: `pnpm test --detectOpenHandles`

### Mocks not working
- Check that mock setup happens before imports
- Verify `setupAllMocks()` is called in `test-setup.ts`
- Use `jest.unmock('./service')` if you need to test the real implementation

### Environment variables not loading
- Ensure `.env` file is in repository root
- Check file permissions on `.env`
- Use `DEBUG_TESTS=true` to see if .env was loaded

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Sequelize Testing Guide](https://sequelize.org/docs/v6/other-topics/testing/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
