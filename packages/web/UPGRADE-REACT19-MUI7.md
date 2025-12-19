# 📋 React 19, MUI v7 & React Router v7 Upgrade Plan

> **Package:** `@dx3/web`
> **Created:** December 18, 2025
> **Status:** Planned

---

## 🔍 Project Analysis Summary

### Current State

| Package | Current Version | Target Version | Action |
|---------|----------------|----------------|--------|
| `react` | ~18.3.1 | ^19.1.4 | Upgrade |
| `react-dom` | ~18.3.1 | ^19.1.4 | Upgrade |
| `@mui/material` | ^6.4.6 | ^7.3.6 | Upgrade |
| `@mui/icons-material` | ^6.4.6 | ^7.3.6 | Upgrade |
| `react-router` | ^7.2.0 | ^7.2.0 | Keep |
| `react-router-dom` | 6.11.2 | **REMOVE** | ❌ Delete |
| `@types/react` | ~18.3.12 | ^19.1.4 | Upgrade |
| `@types/react-dom` | 18.3.0 | ^19.1.4 | Upgrade |
| `@types/react-is` | 18.3.0 | ^19.0.0 | Upgrade |

### Critical Discovery: React Router v7 Package Consolidation

In React Router v7, `react-router-dom` is **deprecated and merged** into `react-router`. All exports previously from `react-router-dom` are now available directly from `react-router`:

```typescript
// ❌ OLD (v6 with react-router-dom)
import { BrowserRouter, useNavigate } from 'react-router-dom';

// ✅ NEW (v7 with react-router only)
import { BrowserRouter, useNavigate } from 'react-router';
```

---

## 📊 Impact Analysis

### React Router Migration Impact

| Category | Files Affected | Complexity |
|----------|---------------|------------|
| Source Components | 19 files | Low (import change only) |
| Test Files | 6 files | Low (import change only) |
| **Total** | **25 files** | **Simple find-replace** |

### Imports to Migrate

All imports are available in `react-router` v7:

| Import | Files Using | Status |
|--------|-------------|--------|
| `useNavigate` | 11 files | ✅ Available |
| `useLocation` | 7 files | ✅ Available |
| `useParams` | 2 files | ✅ Available |
| `useMatch` | 1 file | ✅ Available |
| `Outlet` | 5 files | ✅ Available |
| `RouteObject` (type) | 5 files | ✅ Available |
| `RouterProvider` | 1 file | ✅ Available |
| `createBrowserRouter` | 1 file | ✅ Available |
| `Navigate` | 1 file | ✅ Available |
| `MemoryRouter` | 3 files (tests) | ✅ Available |
| `BrowserRouter` | 1 file (tests) | ✅ Available |
| `jest.mock` | 1 file (tests) | ✅ Update mock |

---

## 📝 Detailed Upgrade Plan

### Phase 1: React Router v7 Consolidation

**Estimated Time:** 1-2 hours

#### 1.1 Remove `react-router-dom` and Keep `react-router`

**packages/web/package.json:**
```diff
  "dependencies": {
-   "react-router": "^7.2.0",
-   "react-router-dom": "6.11.2",
+   "react-router": "^7.2.0",
  }
```

**packages/web/web-app/package.json:**
```diff
  "dependencies": {
-   "react-router": "^7.2.0",
-   "react-router-dom": "6.11.2",
+   "react-router": "^7.2.0",
  }
```

#### 1.2 Update All Import Statements (25 files)

**Simple global find-replace:**
```diff
- from 'react-router-dom'
+ from 'react-router'
```

#### 1.3 Files Requiring Import Updates

**Source Files (19 files):**

| File | Current Import | New Import |
|------|----------------|------------|
| `main.tsx` | `import { RouterProvider } from 'react-router-dom'` | `import { RouterProvider } from 'react-router'` |
| `root-web.component.tsx` | `import { Outlet, useLocation, useNavigate } from 'react-router-dom'` | `import { Outlet, useLocation, useNavigate } from 'react-router'` |
| `routers/app.router.tsx` | `import { createBrowserRouter } from 'react-router-dom'` | `import { createBrowserRouter } from 'react-router'` |
| `routers/private.router.tsx` | `import { Navigate, Outlet, type RouteObject } from 'react-router-dom'` | `import { Navigate, Outlet, type RouteObject } from 'react-router'` |
| `routers/admin.router.tsx` | `import { Outlet, type RouteObject } from 'react-router-dom'` | `import { Outlet, type RouteObject } from 'react-router'` |
| `routers/sudo.router.tsx` | `import { Outlet, type RouteObject } from 'react-router-dom'` | `import { Outlet, type RouteObject } from 'react-router'` |
| `auth/auth-web.router.tsx` | `import { Outlet, type RouteObject } from 'react-router-dom'` | `import { Outlet, type RouteObject } from 'react-router'` |
| `auth/auth-web-login.component.tsx` | `import { useLocation, useNavigate } from 'react-router-dom'` | `import { useLocation, useNavigate } from 'react-router'` |
| `auth/auth-web-logout.button.tsx` | `import { useNavigate } from 'react-router-dom'` | `import { useNavigate } from 'react-router'` |
| `home/home-web.component.tsx` | `import { useNavigate } from 'react-router-dom'` | `import { useNavigate } from 'react-router'` |
| `shortlink/shortlink-web.component.tsx` | `import { useNavigate, useParams } from 'react-router-dom'` | `import { useNavigate, useParams } from 'react-router'` |
| `user/admin/user-admin-web.component.tsx` | `import { useNavigate } from 'react-router-dom'` | `import { useNavigate } from 'react-router'` |
| `user/admin/user-admin-web-list.component.tsx` | `import { useLocation, useNavigate } from 'react-router-dom'` | `import { useLocation, useNavigate } from 'react-router'` |
| `user/admin/user-admin-web-edit.component.tsx` | `import { useLocation, useNavigate, useParams } from 'react-router-dom'` | `import { useLocation, useNavigate, useParams } from 'react-router'` |
| `ui/menus/app-nav-bar.menu.tsx` | `import { useLocation, useNavigate } from 'react-router-dom'` | `import { useLocation, useNavigate } from 'react-router'` |
| `ui/menus/app-menu-item.component.tsx` | `import { useLocation, useMatch, useNavigate } from 'react-router-dom'` | `import { useLocation, useMatch, useNavigate } from 'react-router'` |
| `ui/menus/app-menu-account.component.tsx` | `import { useNavigate } from 'react-router-dom'` | `import { useNavigate } from 'react-router'` |
| `ui/menus/app-menu-group.component.tsx` | `import { useLocation } from 'react-router-dom'` | `import { useLocation } from 'react-router'` |
| `data/rtk-query/axios-web.api.ts` | `// import { Navigate } from 'react-router-dom'` | `// import { Navigate } from 'react-router'` |

**Test Files (6 files):**

| File | Current Import | New Import |
|------|----------------|------------|
| `routers/app.router.spec.tsx` | `import type { RouteObject } from 'react-router-dom'` | `import type { RouteObject } from 'react-router'` |
| `routers/private.router.spec.tsx` | `import { MemoryRouter } from 'react-router-dom'` | `import { MemoryRouter } from 'react-router'` |
| `routers/sudo.router.spec.tsx` | `import { MemoryRouter } from 'react-router-dom'` | `import { MemoryRouter } from 'react-router'` |
| `root-web.component.spec.tsx` | `import { BrowserRouter } from 'react-router-dom'` | `import { BrowserRouter } from 'react-router'` |
| `home/home-web.component.spec.tsx` | `import { MemoryRouter } from 'react-router-dom'` | `import { MemoryRouter } from 'react-router'` |
| `shortlink/shortlink-web.component.spec.tsx` | `jest.mock('react-router-dom', ...)` | `jest.mock('react-router', ...)` |

#### 1.4 Automation Script (PowerShell)

```powershell
# Run from packages/web directory
Get-ChildItem -Recurse -Include "*.tsx","*.ts" |
  ForEach-Object {
    (Get-Content $_.FullName) -replace "from 'react-router-dom'", "from 'react-router'" |
    Set-Content $_.FullName
  }

# Also update jest.mock references
Get-ChildItem -Recurse -Include "*.spec.tsx","*.spec.ts" |
  ForEach-Object {
    (Get-Content $_.FullName) -replace "jest\.mock\('react-router-dom'", "jest.mock('react-router'" |
    Set-Content $_.FullName
  }
```

---

### Phase 2: Fix Deprecated MUI APIs

**Estimated Time:** 30 minutes

#### 2.1 Replace `onBackdropClick` (3 files)

The `onBackdropClick` prop was deprecated in MUI v5 and removed in MUI v7.

**Files affected:**
- `libs/ui/dialog/dialog.component.tsx`
- `libs/ui/dialog/awaiter.dialog.tsx`
- `libs/ui/dialog/api-error.dialog.tsx`

**Before:**
```typescript
<Dialog
  onBackdropClick={() => closeDialog()}
  onClose={() => closeDialog()}
  open={open}
>
```

**After (MUI v7 compatible):**
```typescript
<Dialog
  onClose={(event, reason) => {
    if (reason === 'backdropClick') {
      closeDialog();
    } else {
      closeDialog();
    }
  }}
  open={open}
>
```

**For dialogs that should NOT close on backdrop click (awaiter.dialog.tsx):**
```typescript
<Dialog
  onClose={(event, reason) => {
    if (reason !== 'backdropClick') {
      // Only close if not backdrop click
    }
  }}
  open={open}
>
```

---

### Phase 3: React 19 Upgrade

**Estimated Time:** 1-2 hours

#### 3.1 Update React Dependencies

**Both `packages/web/package.json` and `packages/web/web-app/package.json`:**

```json
{
  "dependencies": {
    "react": "^19.1.4",
    "react-dom": "^19.1.4",
    "react-is": "^19.1.4"
  },
  "devDependencies": {
    "@types/react": "^19.1.4",
    "@types/react-dom": "^19.1.4",
    "@types/react-is": "^19.0.0"
  }
}
```

> **Security Note:** Version ^19.1.4 includes patches for CVE-2025-55182 and other security vulnerabilities.

#### 3.2 React 19 Breaking Changes Checklist

| Change | Your Codebase | Action Required |
|--------|---------------|-----------------|
| `forwardRef` simplified | 7 files use it | Optional refactor (still works) |
| `ref` as regular prop | N/A | No action |
| Strict Mode improvements | Using StrictMode ✅ | No action |
| `use()` hook added | Not used | Optional enhancement |
| Concurrent rendering | Supported | No action |

#### 3.3 Optional: Simplify `forwardRef` (7 files)

**Files using forwardRef:**
- `auth-web-request-otp.component.tsx`
- `auth-web-login-user-pass.component.tsx`
- `table.component.tsx`
- `content-collapsible-panel.tsx`
- Jest setup files (mocks)

**Current pattern (still works in React 19):**
```typescript
export const TableComponent: React.FC<TableComponentProps> = React.forwardRef((props, ref) => {
  // ...
});
```

**New React 19 pattern (optional refactor):**
```typescript
type TableComponentPropsWithRef = TableComponentProps & { ref?: React.Ref<HTMLDivElement> };

export const TableComponent: React.FC<TableComponentPropsWithRef> = ({ ref, ...props }) => {
  // ref is now a regular prop!
};
```

> **Recommendation:** Keep existing `forwardRef` for now - it's not deprecated, just simplified.

---

### Phase 4: MUI v7 Upgrade

**Estimated Time:** 1-2 hours

#### 4.1 Update MUI Dependencies

```json
{
  "dependencies": {
    "@mui/material": "^7.3.6",
    "@mui/icons-material": "^7.3.6"
  }
}
```

#### 4.2 MUI v7 Breaking Changes Assessment

| Change | Impact on Your Codebase | Action |
|--------|------------------------|--------|
| ESM/CJS `exports` field | None - rspack handles this | ✅ No action |
| CSS Layers support | Optional feature | Optional |
| Deprecated v5 APIs removed | Not using any | ✅ No action |
| `onBackdropClick` removed | **3 files affected** | Fix in Phase 2 |
| Theme structure | Compatible | ✅ No action |
| `sx` prop behavior | Same | ✅ No action |

#### 4.3 Theme Compatibility

Your current theme (`libs/ui/system/mui-overrides/mui.theme.ts`) is **fully compatible** with MUI v7. No changes required.

#### 4.4 Update peerDependencies

Update the `peerDependencies` in `packages/web/package.json`:

```diff
  "peerDependencies": {
-   "@mui/icons-material": ">=5.0.0",
-   "@mui/material": ">=5.0.0",
-   "react": ">=18.0.0",
+   "@mui/icons-material": ">=7.0.0",
+   "@mui/material": ">=7.0.0",
+   "react": ">=19.0.0",
    "react-spinners": ">=0.15.0"
  }
```

---

### Phase 5: Third-Party Dependency Verification

**Estimated Time:** 30 minutes

#### 5.1 Compatibility Status

All third-party dependencies have been verified for React 19 and MUI v7 compatibility:

| Package | Version | React 19 | MUI v7 | Notes |
|---------|---------|----------|--------|-------|
| `lottie-react` | ^2.4.1 | ✅ Compatible | N/A | Works without changes |
| `react-avatar-editor` | ^13.0.2 | ⚠️ Requires override | N/A | See section 5.2 |
| `react-phone-input-2` | ^2.15.1 | ✅ Compatible | N/A | Works without changes |
| `mui-one-time-password-input` | ^5.0.0 | ✅ Compatible | ✅ Compatible | Works without changes |
| `react-toastify` | ^11.0.5 | ✅ Compatible | N/A | Works without changes |
| `react-spinners` | ^0.15.0 | ✅ Compatible | N/A | Works without changes |
| `@testing-library/react` | 16.1.0 | ✅ Compatible | N/A | Update to ^16.2.0 recommended |
| `react-redux` | ^9.2.0 | ✅ Compatible | N/A | Works without changes |
| `reduxjs-toolkit-persist` | ^7.2.1 | ✅ Compatible | N/A | Works without changes |

#### 5.2 Required Override: react-avatar-editor

The `react-avatar-editor` package has peer dependencies locked to older React versions.

**⚠️ IMPORTANT: For pnpm workspaces, overrides must be in the ROOT `package.json`:**

**Root `package.json` (recommended for pnpm):**
```json
{
  "pnpm": {
    "overrides": {
      "react-avatar-editor>react": ">=19.1.4",
      "react-avatar-editor>react-dom": ">=19.1.4"
    }
  }
}
```

**Alternative: Individual package.json files (npm/yarn):**

If not using pnpm, add to **both package.json files**:

**packages/web/package.json:**
```json
{
  "overrides": {
    "react-avatar-editor": {
      "react": ">=19.1.4",
      "react-dom": ">=19.1.4"
    }
  }
}
```

**packages/web/web-app/package.json:**
```json
{
  "overrides": {
    "react-avatar-editor": {
      "react": ">=19.1.4",
      "react-dom": ">=19.1.4"
    }
  }
}
```

> **Note:** This project uses pnpm (v10.26.0). Use the root `package.json` with `pnpm.overrides` syntax.

---

### Phase 6: Testing & Validation

**Estimated Time:** 3-4 hours

#### 6.1 Automated Tests

```powershell
# Run lib tests
pnpm --filter @dx3/web test:libs

# Run web-app tests
pnpm --filter @dx3/web-app test

# Run with coverage
pnpm --filter @dx3/web test:libs:coverage
```

#### 6.2 Manual Testing Checklist

| Feature | Test Cases | Priority |
|---------|------------|----------|
| **Routing** | Navigation, back button, deep links | Critical |
| **Authentication** | Login, OTP, logout, protected routes | Critical |
| **Dialogs** | Open, close, backdrop click | High |
| **Tables** | Sorting, pagination, loading | High |
| **Forms** | Phone input, OTP input, validation | High |
| **Avatar Editor** | Upload, crop, save | High |
| **Theme** | Light/dark toggle | Medium |
| **Notifications** | Toast, socket updates | Medium |
| **Animations** | Lottie components | Medium |

---

## 📦 Final Dependency Configuration

### packages/web/package.json

```json
{
  "name": "@dx3/web",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "lint": "biome check .",
    "test": "NODE_OPTIONS='--no-deprecation' jest --detectOpenHandles",
    "test:libs": "NODE_OPTIONS='--no-deprecation' jest --testPathPattern=\"libs\" --detectOpenHandles",
    "test:libs:coverage": "NODE_OPTIONS='--no-deprecation' jest --testPathPattern=\"libs\" --coverage --detectOpenHandles",
    "test:libs:watch": "NODE_OPTIONS='--no-deprecation' jest --testPathPattern=\"libs\" --watch",
    "test:libs:watch:coverage": "NODE_OPTIONS='--no-deprecation' jest --testPathPattern=\"libs\" --watch --coverage",
    "test:libs:debug": "NODE_OPTIONS='--no-deprecation' jest --testPathPattern=\"libs\" --debug",
    "test:libs:debug:coverage": "NODE_OPTIONS='--no-deprecation' jest --testPathPattern=\"libs\" --debug --coverage"
  },
  "dependencies": {
    "@dx3/models-shared": "workspace:*",
    "@dx3/utils-shared": "workspace:*",
    "@fontsource/roboto": "^5.2.0",
    "@mui/icons-material": "^7.3.6",
    "@mui/material": "^7.3.6",
    "@popperjs/core": "^2.11.8",
    "@reduxjs/toolkit": "^2.6.0",
    "axios": "^1.6.0",
    "dayjs": "^1.11.13",
    "jwt-decode": "^4.0.0",
    "libphonenumber-js": "^1.12.4",
    "lottie-react": "^2.4.1",
    "mui-one-time-password-input": "^5.0.0",
    "react": "^19.1.4",
    "react-avatar-editor": "^13.0.2",
    "react-dom": "^19.1.4",
    "react-is": "^19.1.4",
    "react-phone-input-2": "^2.15.1",
    "react-redux": "^9.2.0",
    "react-router": "^7.2.0",
    "react-spinners": "^0.15.0",
    "react-toastify": "^11.0.5",
    "redux": "^5.0.1",
    "redux-persist": "^6.0.0",
    "redux-thunk": "^3.1.0",
    "reduxjs-toolkit-persist": "^7.2.1",
    "reselect": "^5.1.1",
    "socket.io-client": "^4.8.1",
    "uuid": "^11.1.0"
  },
  "devDependencies": {
    "@dx3/test-data": "workspace:*",
    "@rspack/cli": "^1.1.5",
    "@rspack/core": "^1.1.5",
    "@rspack/dev-server": "1.0.9",
    "@rspack/plugin-react-refresh": "^1.0.0",
    "@testing-library/dom": "10.4.0",
    "@testing-library/react": "^16.2.0",
    "@types/react": "^19.1.4",
    "@types/react-avatar-editor": "^13.0.3",
    "@types/react-dom": "^19.1.4",
    "@types/react-is": "^19.0.0",
    "css-loader": "^7.1.2",
    "dotenv": "^17.2.3",
    "dotenv-webpack": "^8.1.1",
    "postcss": "^8.4.40",
    "postcss-loader": "^8.1.1",
    "react-refresh": "~0.14.0",
    "style-loader": "^4.0.0",
    "stylus": "^0.63.0"
  },
  "peerDependencies": {
    "@mui/icons-material": ">=7.0.0",
    "@mui/material": ">=7.0.0",
    "react": ">=19.0.0",
    "react-spinners": ">=0.15.0"
  },
  "overrides": {
    "react-avatar-editor": {
      "react": ">=19.1.4",
      "react-dom": ">=19.1.4"
    }
  }
}
```

---

## ⚠️ Risk Assessment

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| React Router import breaks | Low | Low | Simple string replace |
| react-avatar-editor peer deps | Low | Low | Override configured |
| MUI component behavior change | Low | Low | Using standard patterns |
| Test suite failures | Medium | Medium | Run incrementally |
| Runtime hydration errors | Low | Low | StrictMode already enabled |

---

## 📅 Execution Timeline

| Phase | Duration | Complexity |
|-------|----------|------------|
| **Phase 1:** React Router Consolidation | 1-2 hours | Easy |
| **Phase 2:** Fix Deprecated MUI APIs | 30 minutes | Easy |
| **Phase 3:** React 19 Upgrade | 1-2 hours | Medium |
| **Phase 4:** MUI v7 Upgrade | 1-2 hours | Medium |
| **Phase 5:** Dependency Verification | 30 minutes | Easy |
| **Phase 6:** Testing & Validation | 3-4 hours | Medium |

**Total Estimated Time: 8-12 hours**

---

## 🚀 Execution Order

```
┌─────────────────────────────────────────────────────────────┐
│  1. Create feature branch                                    │
│     git checkout -b feature/react-19-mui-7-upgrade           │
├─────────────────────────────────────────────────────────────┤
│  2. Phase 1: React Router consolidation                      │
│     - Remove react-router-dom from package.json              │
│     - Update 25 import statements (inc. jest.mock)           │
├─────────────────────────────────────────────────────────────┤
│  3. Phase 2: Fix onBackdropClick in 3 dialog files          │
├─────────────────────────────────────────────────────────────┤
│  4. Run tests - verify router changes work                   │
│     pnpm --filter @dx3/web test:libs                         │
├─────────────────────────────────────────────────────────────┤
│  5. Phase 3 & 4: Upgrade React 19 + MUI v7 together         │
│     - Update package.json dependencies                       │
│     - Add pnpm.overrides to ROOT package.json                │
│     - Update peerDependencies in packages/web/package.json   │
│     - Run pnpm install                                       │
├─────────────────────────────────────────────────────────────┤
│  6. Phase 5: Verify third-party dependencies                 │
│     - Test avatar editor functionality                       │
├─────────────────────────────────────────────────────────────┤
│  7. Phase 6: Full test suite + manual testing               │
│     - Run all automated tests                                │
│     - Manual testing checklist                               │
├─────────────────────────────────────────────────────────────┤
│  8. Code review and merge to main                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 📚 References

- [React 19 Release Notes](https://react.dev/blog/2024/12/05/react-19)
- [React 19 Upgrade Guide](https://react.dev/blog/2024/12/05/react-19#how-to-upgrade)
- [MUI v7 Release Announcement](https://mui.com/blog/material-ui-v7-is-here/)
- [MUI v7 Migration Guide](https://mui.com/material-ui/migration/upgrade-to-v7/)
- [React Router v7 Documentation](https://reactrouter.com/)
- [React Router v6 to v7 Upgrade Guide](https://reactrouter.com/upgrading/v6)
