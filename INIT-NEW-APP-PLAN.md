# 🚀 New App Initialization Script - Implementation Plan

> **Purpose**: After cloning the dx3-monorepo boilerplate, run this script to rebrand and configure the monorepo for a new application.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [User Prompts](#user-prompts)
3. [Files to Modify](#files-to-modify)
4. [Replacement Strategy](#replacement-strategy)
5. [Script Features](#script-features)
6. [Implementation Details](#implementation-details)
7. [Post-Setup Instructions](#post-setup-instructions)

---

## Overview

The initialization script transforms the `dx3-monorepo` boilerplate into a new branded application. It performs case-sensitive string replacements across 254+ files and updates configuration constants.

### Scope Summary

| Category | Matches | Files |
|----------|---------|-------|
| `dx3` (lowercase) | ~606 | 254 |
| `DX3` (uppercase) | ~17 | 11 |
| Configuration constants | 6 | 1 |
| Database name | 3 | 2 |
| **Total Estimated** | ~632 | ~257 |

---

## User Prompts

The script will interactively prompt for the following values:

### 1. App Short Code (Required)
```
Enter app short code (2-3 lowercase letters):
```
- **Validation**: 2-3 lowercase alphanumeric characters
- **Example**: `abc`, `my`, `xyz`
- **Used for**:
  - Package scopes (`@abc/...`)
  - Docker container names (`redis-abc`, `postgres-abc`)
  - APP_PREFIX constant

### 2. App Name (Required)
```
Enter app display name:
```
- **Example**: `My Awesome App`, `Acme Platform`
- **Used for**:
  - `APP_NAME` constant (uppercase version of branding)
  - Console banners
  - Documentation

### 3. App Description (Required)
```
Enter app description:
```
- **Example**: `Enterprise project management platform`
- **Used for**: `APP_DESCRIPTION` constant

### 4. App Domain (Required)
```
Enter app domain (without https://):
```
- **Validation**: Valid domain format
- **Example**: `myapp.com`, `acme.io`
- **Used for**: `APP_DOMAIN` constant

### 5. Company Name (Required)
```
Enter company name:
```
- **Example**: `Acme Corporation`, `MyStartup Inc.`
- **Used for**: `COMPANY_NAME` constant

### 6. Mobile Package Name (Required)
```
Enter mobile package name (e.g., com.mycompany):
```
- **Validation**: Reverse domain notation
- **Example**: `com.acme`, `io.myapp`
- **Used for**: `MOBILE_PACKAGE_NAME` constant

### 7. Database Name (Required)
```
Enter database name (lowercase, no spaces):
```
- **Validation**: Lowercase alphanumeric with hyphens/underscores
- **Example**: `acme-app`, `myapp_db`
- **Used for**: `DB_NAME` in Makefile and db-reset.sh

---

## Files to Modify

### Category 1: Package Scope Replacements (`@dx3/` → `@{code}/`)

**581 matches across 250 files**

| File Pattern | Example Files |
|--------------|---------------|
| `package.json` | Root, api, web, mobile, shared packages |
| `tsconfig.*.json` | Path mappings |
| `*.ts`, `*.tsx` | Import statements |
| `Makefile` | pnpm filter commands |
| Shell scripts | Docker exec commands |

### Category 2: Docker Container Names (`*-dx3` → `*-{code}`)

**Files affected:**
- `docker-compose.yml` (5 occurrences)
- `Makefile` (1 occurrence)
- `_devops/scripts/db-reset.sh` (2 occurrences)

**Container names to replace:**
- `redis-dx3` → `redis-{code}`
- `postgres-dx3` → `postgres-{code}`
- `sendgrid-dx3` → `sendgrid-{code}`
- `api-dx3` → `api-{code}`
- `api-node-22-dx3` → `api-node-22-{code}`

### Category 3: Display Names (`DX3` → `{APP_NAME}`)

**17 matches across 11 files**

| File | Occurrences |
|------|-------------|
| `package.json` (root) | 1 |
| `Makefile` | 1 |
| `README.md` | 2 |
| `_devops/scripts/db-reset.sh` | 1 |
| `_devops/scripts/docker-start.dev.sh` | 1 |
| `packages/api/libs/pg/seed/index.ts` | 1 |
| `packages/shared/models/src/config/config-shared.consts.ts` | 1 |
| `packages/shared/models/src/config/config-shared.consts.spec.ts` | 1 |
| `packages/mobile/app.json` | 1 |
| `packages/mobile/src/app/App.tsx` | 6 |

### Category 4: Configuration Constants

**File:** `packages/shared/models/src/config/config-shared.consts.ts`

| Constant | Current Value | New Value |
|----------|---------------|-----------|
| `APP_DESCRIPTION` | `'Boiler plate monorepo...'` | User input |
| `APP_DOMAIN` | `'danex.software'` | User input |
| `APP_NAME` | `'DX3'` | Derived from App Name (uppercase) |
| `APP_PREFIX` | `'dx'` | App short code |
| `COMPANY_NAME` | `'Danex Software'` | User input |
| `MOBILE_PACKAGE_NAME` | `'com.dx'` | User input |

### Category 5: Database Configuration

**File:** `Makefile`
```makefile
DB_NAME := dx-app  →  DB_NAME := {db_name}
```

**File:** `_devops/scripts/db-reset.sh`
```bash
DB_NAME="${DB_NAME:-dx-app}"  →  DB_NAME="${DB_NAME:-{db_name}}"
```

### Category 6: Mobile App Name (`MobileDx3` → `Mobile{Code}`)

**Files affected:**
- `packages/mobile/app.json`
- `packages/mobile/src/app/App.tsx`

---

## Replacement Strategy

### Case-Preserving Replacement Logic

The script will handle three case variants:

| Original | Replacement | Usage |
|----------|-------------|-------|
| `dx3` | `{code}` (lowercase) | Package scopes, imports, containers |
| `DX3` | `{CODE}` (uppercase) | Display names, banners |
| `Dx3` | `{Code}` (title case) | README, mixed contexts |

### Replacement Order (Critical)

Execute replacements in this order to avoid partial matches:

1. **Longest patterns first**: `api-node-22-dx3` before `dx3`
2. **Case-sensitive**: Handle `DX3`, `Dx3`, `dx3` separately
3. **Mobile app name**: `MobileDx3` → `Mobile{Code}`
4. **Configuration constants**: Direct value replacement

### File Type Handling

| Extension | Tool | Notes |
|-----------|------|-------|
| `.ts`, `.tsx`, `.js` | sed | Preserve file permissions |
| `.json` | sed | Be careful with JSON syntax |
| `.yml`, `.yaml` | sed | Preserve indentation |
| `.md` | sed | Safe text replacement |
| `Makefile` | sed | Handle tabs carefully |
| `.sh` | sed | Preserve shebang |

---

## Script Features

### Safety Features

- [ ] **Dry-run mode** (`--dry-run`): Preview changes without modifying files
- [ ] **Backup option** (`--backup`): Create backup before modifications
- [ ] **Git status check**: Warn if uncommitted changes exist
- [ ] **Validation**: All inputs validated before proceeding
- [ ] **Confirmation prompt**: Show summary and require confirmation

### Operational Features

- [ ] **Progress indicator**: Show file count and progress
- [ ] **Verbose mode** (`--verbose`): Show each file being modified
- [ ] **Color output**: Clear visual feedback
- [ ] **Error handling**: Graceful failure with rollback instructions
- [ ] **Summary report**: Show what was changed

### Exclusions

The script will **exclude** these directories:
- `node_modules/`
- `.git/`
- `coverage/`
- `dist/`
- `*.dump`
- Binary files

---

## Implementation Details

### Script Location
```
_devops/scripts/init-new-app.sh
```

### Usage
```bash
# Interactive mode (recommended)
./_devops/scripts/init-new-app.sh

# With options
./_devops/scripts/init-new-app.sh --dry-run     # Preview only
./_devops/scripts/init-new-app.sh --backup      # Create backup first
./_devops/scripts/init-new-app.sh --verbose     # Show all changes
./_devops/scripts/init-new-app.sh --help        # Show help
```

### Script Flow

```
┌─────────────────────────────────────────────────────────────┐
│  1. INITIALIZATION                                          │
│     - Parse command line arguments                          │
│     - Check prerequisites (git, sed, find)                  │
│     - Verify we're in repo root                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  2. USER INPUT COLLECTION                                   │
│     - App short code (2-3 chars)                            │
│     - App display name                                      │
│     - App description                                       │
│     - App domain                                            │
│     - Company name                                          │
│     - Mobile package name                                   │
│     - Database name                                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  3. VALIDATION & CONFIRMATION                               │
│     - Validate all inputs                                   │
│     - Show summary of changes                               │
│     - Require explicit confirmation                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  4. BACKUP (if --backup flag)                               │
│     - Create timestamped backup directory                   │
│     - Copy affected files                                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  5. EXECUTE REPLACEMENTS                                    │
│     Phase A: Package scopes (@dx3/ → @{code}/)              │
│     Phase B: Docker containers (*-dx3 → *-{code})           │
│     Phase C: Display names (DX3 → {APP_NAME})               │
│     Phase D: Mobile app name (MobileDx3 → Mobile{Code})     │
│     Phase E: Config constants (direct replacement)          │
│     Phase F: Database name                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  6. POST-PROCESSING                                         │
│     - Update test snapshots if needed                       │
│     - Show summary report                                   │
│     - Provide next steps                                    │
└─────────────────────────────────────────────────────────────┘
```

### Core Replacement Commands

```bash
# Package scope replacement (example)
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.json" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.git/*" \
  -exec sed -i '' 's/@dx3\//@abc\//g' {} +

# Case-preserving replacement
sed -i '' 's/dx3/abc/g'   # lowercase
sed -i '' 's/DX3/ABC/g'   # uppercase
sed -i '' 's/Dx3/Abc/g'   # title case

# Configuration constant replacement (example)
sed -i '' "s/APP_DESCRIPTION = '.*'/APP_DESCRIPTION = 'New description'/" \
  packages/shared/models/src/config/config-shared.consts.ts
```

---

## Post-Setup Instructions

After running the script, the following steps are recommended:

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Verify Changes
```bash
# Check for any remaining "dx3" references
grep -r "dx3" --include="*.ts" --include="*.json" . | grep -v node_modules

# Run tests to verify nothing is broken
pnpm test
```

### 3. Update Git Remote
```bash
git remote remove origin
git remote add origin <your-new-repo-url>
```

### 4. Start Development
```bash
# Start Docker containers
docker compose up -d

# Reset database with new name
make db-reset

# Start development servers
pnpm dev:web
pnpm dev:mobile
```

### 5. Review These Files Manually
- [ ] `README.md` - Update project description
- [ ] `package.json` - Update repository URL, author
- [ ] `LICENSE` - Update copyright holder
- [ ] `.env` files - Configure environment variables

---

## Example Run

```
╔════════════════════════════════════════════════════════════╗
║          🚀 New App Initialization Script                   ║
╚════════════════════════════════════════════════════════════╝

This script will rebrand the dx3-monorepo for your new application.

────────────────────────────────────────────────────────────────
 STEP 1: App Configuration
────────────────────────────────────────────────────────────────

Enter app short code (2-3 lowercase letters): abc
Enter app display name: Acme Platform
Enter app description: Enterprise workflow automation platform
Enter app domain (without https://): acme.io
Enter company name: Acme Corporation
Enter mobile package name (e.g., com.company): com.acme
Enter database name (lowercase, hyphens ok): acme-app

────────────────────────────────────────────────────────────────
 SUMMARY
────────────────────────────────────────────────────────────────

 Short Code:      abc
 App Name:        Acme Platform
 Display Name:    ABC (uppercase variant)
 Description:     Enterprise workflow automation platform
 Domain:          acme.io
 Company:         Acme Corporation
 Mobile Package:  com.acme
 Database:        acme-app

 Files to modify: ~257
 Replacements:    ~632

────────────────────────────────────────────────────────────────

⚠️  This will modify files in your working directory.

Proceed with initialization? (yes/no): yes

▶ Phase 1/6: Replacing package scopes...        [████████████] 100%
▶ Phase 2/6: Updating Docker containers...      [████████████] 100%
▶ Phase 3/6: Updating display names...          [████████████] 100%
▶ Phase 4/6: Updating mobile app name...        [████████████] 100%
▶ Phase 5/6: Updating configuration...          [████████████] 100%
▶ Phase 6/6: Updating database name...          [████████████] 100%

════════════════════════════════════════════════════════════════
 ✅ Initialization Complete!
════════════════════════════════════════════════════════════════

 Modified: 257 files
 Time:     3.2 seconds

 Next steps:
   1. Run: pnpm install
   2. Run: docker compose up -d
   3. Run: make db-reset
   4. Review README.md and update as needed

════════════════════════════════════════════════════════════════
```

---

## Appendix: All Affected Files

<details>
<summary>Click to expand full file list (254 files)</summary>

### Root Configuration
- `package.json`
- `tsconfig.base.json`
- `docker-compose.yml`
- `docker-compose.base.yml`
- `Makefile`
- `README.md`

### DevOps Scripts
- `_devops/scripts/db-reset.sh`
- `_devops/scripts/docker-start.dev.sh`

### API Package
- `packages/api/package.json`
- `packages/api/README.md`
- `packages/api/api-app/package.json`
- `packages/api/api-app/README.md`
- `packages/api/api-app/src/**/*.ts` (70+ files)
- `packages/api/libs/**/*.ts` (100+ files)

### Web Package
- `packages/web/package.json`
- `packages/web/README.md`
- `packages/web/web-app/package.json`
- `packages/web/web-app/README.md`
- `packages/web/web-app/rspack.config.js`
- `packages/web/web-app/src/**/*.ts(x)` (50+ files)
- `packages/web/libs/**/*.ts(x)` (100+ files)

### Mobile Package
- `packages/mobile/package.json`
- `packages/mobile/app.json`
- `packages/mobile/README.md`
- `packages/mobile/src/**/*.tsx`

### Shared Packages
- `packages/shared/*/package.json`
- `packages/shared/*/README.md`
- `packages/shared/**/src/**/*.ts`

</details>

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-01-XX | Initial plan document |

---

**Author**: Generated with AI assistance
**Last Updated**: December 2024
