# @dx3/encryption

Shared cryptographic utilities for the DX3 monorepo. Provides hashing, random value generation, and RSA key management functions used across the API, web, and mobile packages.

## Installation

This is a private workspace package. Reference it in any `package.json` within the monorepo:

```json
"dependencies": {
  "@dx3/encryption": "workspace:*"
}
```

## API

### Hashing (`hashing.ts`)

PBKDF2-based password hashing with salt management.

| Export | Description |
|---|---|
| `dxHashString(str)` | Hashes a string, returning a combined `salt:hash` value |
| `dxGetSaltFromHash(hash)` | Extracts the salt prefix from a combined hash string |
| `dxGenerateHashWithSalt(str, salt)` | Derives a hash from a string and an existing salt |
| `dxVerifyHash(str, hash)` | Verifies a plaintext string against a stored combined hash |

### Generic Hashing (`hashString.ts`)

| Export | Description |
|---|---|
| `dxHashAnyToString(value)` | Converts any serialisable value to a deterministic SHA-256 hex string |

### Random Values (`randomValue.ts`)

| Export | Description |
|---|---|
| `dxGenerateRandomValue(length?)` | Generates a cryptographically random hex string (default: 48 chars) |
| `dxGenerateOtp(codeLength?)` | Generates a numeric one-time password string (default: 6 digits) |

### RSA Keys (`rsa.keys.ts`)

RSA-2048 key pair operations using `node-rsa`.

| Export | Description |
|---|---|
| `dxRsaGenerateKeyPair()` | Generates a new RSA-2048 key pair, returning `{ privateKey, publicKey }` or `null` keys on failure |
| `dxRsaSignPayload(payload, privateKey)` | Signs a payload string with a PEM private key, returning the signature or `undefined` on failure |
| `dxRsaValidatePayload(payload, signature, publicKey)` | Validates a payload signature against a PEM public key |
| `dxRsaValidateBiometricKey(publicKey)` | Validates that a string is a well-formed RSA public key |

## Scripts

```bash
# Run unit tests
pnpm test

# Run unit tests with coverage report
pnpm test:coverage

# Build (TypeScript compile)
pnpm build

# Lint
pnpm lint
```

## Test Coverage

Coverage is collected from `src/lib/**/*.ts`, excluding spec files. Target: ≥ 80% for statements, branches, functions, and lines.
