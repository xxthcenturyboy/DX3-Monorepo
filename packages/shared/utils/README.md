# @dx3/utils-shared

Shared utility functions for the DX3 monorepo. Provides date handling, string manipulation, regex patterns, JSON parsing, and other helpers used across the API, web, and mobile packages.

## Installation

This is a private workspace package. Reference it in any `package.json` within the monorepo:

```json
"dependencies": {
  "@dx3/utils-shared": "workspace:*"
}
```

## API

### Auth (`basic-auth.util.ts`)

| Export | Description |
|---|---|
| `basicAuthHeader(username, password)` | Encodes credentials as a Base64 Basic Auth header value |

### CSV (`csv-parser.ts`)

| Export | Description |
|---|---|
| `parseCSV(csv)` | Parses a CSV string into an array of typed row objects |

### Dates (`dx-dates.util.ts`)

| Export | Description |
|---|---|
| `DxDateUtilClass` | `dayjs`-powered date utility class with `getTimestamp`, `getMilisecondsDays`, `formatRelativeTime`, `formatAbsoluteTime`, and `getTimestampFromDate` methods |

### URL Safety (`malicious-url-check.ts`)

| Export | Description |
|---|---|
| `maliciousUrlCheck(url)` | Returns `true` if a URL matches known malicious patterns |

### Numbers (`number.util.ts`)

| Export | Description |
|---|---|
| `formatBytes(bytes, decimals?)` | Formats a byte count into a human-readable string (KB, MB, etc.) |
| `formatNumThouSeparator(n)` | Formats a number with thousands-separator commas |
| `isNumber(value)` | Type guard returning `true` if the value is a finite number |
| `randomId()` | Generates a random integer suitable for use as a transient UI key |

### JSON (`parse-json.ts`)

| Export | Description |
|---|---|
| `parseJson<T>(value)` | Safely parses a JSON string, returning `null` on failure |

### Object Utilities (`properties-to-array.ts`)

| Export | Description |
|---|---|
| `propertiesToArray(obj)` | Recursively flattens an object's property paths into a dot-notation string array |

### Regex Patterns (`regex-patterns.ts`)

| Export | Description |
|---|---|
| `regexEmail` | Email address validation regex |
| `regexMatchNumberGroups` | Matches groups of digit characters |
| `regexNoWhiteSpaceAlphaNumeric` | Alphanumeric-only, no whitespace |
| `regexNoWhiteSpaceString` | Any non-whitespace string |
| `regexPhone` | International phone number regex |
| `regexPhoneUS` | US phone number regex |
| `regexPostgresUrl` | PostgreSQL connection URL regex |
| `regexUuid` | UUID v4 regex |

### Reverse Regex (`reverse-regex.util.ts`)

| Export | Description |
|---|---|
| `computeRegex(parts)` | Combines regex part descriptors into a single `RegExp` |
| `getRegexTypesFromString(str)` | Identifies the regex character-class types present in a string |
| `makeRegex(types)` | Constructs a `RegExp` from an array of character-class type identifiers |

### Async (`sleep.ts`)

| Export | Description |
|---|---|
| `sleep(ms)` | Returns a `Promise` that resolves after the given number of milliseconds |

### Strings (`strings.util.ts`)

| Export | Description |
|---|---|
| `convertpHyphensToUnderscores(str)` | Replaces hyphens with underscores |
| `hyphenatedToCamelCaseConcatenated(str)` | Converts a hyphenated string to camelCase |
| `hyphenatedToTilteCaseConcatenated(str)` | Converts a hyphenated string to TitleCase |
| `obfuscateEmail(email)` | Partially masks an email address for display |
| `obfuscatePhone(phone)` | Partially masks a phone number for display |
| `sentenceToTitleCase(str)` | Capitalises the first letter of every word in a sentence |
| `slugify(str)` | Converts a string to a URL-safe lowercase slug |
| `stringToTitleCase(str)` | Capitalises the first letter of a single string |
| `stripHyphens(str)` | Removes all hyphens from a string |
| `truncateString(str, maxLength)` | Truncates a string and appends `…` if it exceeds `maxLength` |
| `uppercase(str)` | Converts a string to uppercase |

### Types (`util-shared.types.ts`)

| Export | Description |
|---|---|
| `PrimitiveTypes` | Union type of JavaScript primitive values |
| `SortDirType` | `'ASC' \| 'DESC'` sort direction union |

### UUID (`uuid.util.ts`)

| Export | Description |
|---|---|
| `getTimeFromUuid(uuid)` | Extracts the timestamp embedded in a UUID v1 string |

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
