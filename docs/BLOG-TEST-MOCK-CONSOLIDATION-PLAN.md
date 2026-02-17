# Blog Test Mock Consolidation Plan

## Summary

Review of 16+ blog component/reducer spec files in `packages/web/web-app/src/app/blog/` reveals repeated mock patterns that can be consolidated to reduce duplication and improve maintainability.

---

## Current State: Repeated Patterns

### 1. Store Mock (`store-web.redux`)

**Used in:** list, editor, schedule-dialog, settings, settings-drawer, list-header (indirect), list-service, editor-menu

**Pattern:**
```ts
jest.mock('../../store/store-web.redux', () => ({
  store: {
    getState: () => ({
      i18n: { translations: {} },
      // schedule-dialog adds: BLOG_SCHEDULE_TZ_OTHER, BLOG_SCHEDULE_TZ_YOURS
    }),
  },
}))
```

**Consolidation:** Single shared mock; schedule-dialog can override `getState` in its spec for timezone strings.

---

### 2. i18n Mock (`useStrings` + `useTranslation`)

**Used in:** All component specs (each with a different subset of keys)

**Pattern:** Each spec defines 5–30 string keys. Settings/editor need `useTranslation` for MediaUploadModal; others only `useStrings`.

**Keys by component (sample):**
| Component | Key count | Unique keys |
|-----------|-----------|-------------|
| list | 18 | ALL, BLOG_CREATE_POST, BLOG_STATUS_*, etc. |
| list-header | 12 | Overlap with list |
| schedule-dialog | 8 | BLOG_SCHEDULE_*, CONFIRM |
| settings | 24 | BLOG_ANONYMOUS, BLOG_FEATURED_IMAGE_*, etc. |
| settings-drawer | 12 | BLOG_PUBLISH_*, BLOG_SETTINGS, CLOSE |
| editor | 16 | ALIGN_*, BLOG_INSERT_*, BLOG_UPLOAD_*, etc. |
| post-preview | 6 | BLOG_FEATURED_IMAGE, BLOG_READING_TIME_MIN |
| post-web | 5 | BLOG_FEATURED_IMAGE, BLOG_POST_NOT_FOUND |
| blog-web | 4 | BLOG_LOADING, BLOG_NO_POSTS |
| image-edit | 12 | IMAGE_EDIT_*, IMAGE_ALIGN_* |
| link-edit | 12 | LINK_EDIT_* |
| footer | 5 | CANCEL, CLOSE, CREATE, SAVE |

**Consolidation:** Central `BLOG_TEST_I18N_STRINGS` object with all blog-related keys. Specs use `{ ...BLOG_TEST_I18N_STRINGS }` or a subset. Per-spec overrides only when needed.

---

### 3. RTK Query Mock (`data/rtk-query`)

**Used in:** list, editor, schedule, settings-drawer, post-preview, post-web, blog-web, editor-footer, editor-title-field, list-header

**Pattern:** `jest.mock('../../data/rtk-query')` (or `../data/rtk-query` from blog/)

**Consolidation:** Already a no-op; keep as-is. The `__mocks__` may exist but specs override with explicit `jest.mock`.

---

### 4. MUI `useMediaQuery` Mock

**Used in:** list, list-header, schedule-dialog, settings-drawer, editor

**Pattern:**
```ts
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useMediaQuery: () => false,
}))
```

**Consolidation:** Move to `jest.setup.ts` or a blog-specific setup file so all specs get desktop viewport by default. Specs that need mobile can override locally.

---

### 5. Config Mock (`config-web.service`)

**Used in:** post-preview, post-web, editor, settings

**Pattern:**
```ts
jest.mock('../../config/config-web.service', () => ({
  WebConfigService: {
    getWebUrls: () => ({
      API_URL: 'http://test.api',
      WEB_APP_URL: 'http://test.app',
    }),
  },
}))
```

**Consolidation:** Shared mock implementation in `blog-test-mocks.ts`; specs that need it call `jest.mock('../../config/...', () => BLOG_CONFIG_MOCK)`.

---

### 6. Preloaded State: Auth

**Used in:** list, editor (and any spec that renders auth-gated components)

**Pattern:**
```ts
preloadedState: {
  auth: {
    logoutResponse: false,
    password: '',
    token: 'test-token',
    userId: 'u1',
    username: 'u@example.com',
  },
}
```

**Consolidation:** Export `AUTH_PRELOADED_STATE` from shared fixtures.

---

### 7. Preloaded State: Blog Editor

**Used in:** settings (multiple tests), editor-footer

**Patterns:**
- `blogEditorSettings`: full/default shape repeated 6+ times
- `blogEditorBody`: used in footer for dirty check

**Consolidation:** Export `DEFAULT_BLOG_EDITOR_SETTINGS`, `BLOG_EDITOR_BODY_PRELOADED_STATE` from fixtures.

---

### 8. Test Fixtures: Categories & Tags

**Used in:** settings, settings-drawer

**Pattern:**
```ts
const defaultCategories = [
  { id: 'cat-1', name: 'Category A', slug: 'category-a' },
  { id: 'cat-2', name: 'Category B', slug: 'category-b' },
]
const defaultTags = [
  { id: 'tag-1', name: 'Tag X', slug: 'tag-x' },
  { id: 'tag-2', name: 'Tag Y', slug: 'tag-y' },
]
```

**Consolidation:** Export from `blog-test.fixtures.ts` as `BLOG_TEST_CATEGORIES`, `BLOG_TEST_TAGS`. Ensure `slug` is present (BlogCategoryType/BlogTagType requirement).

---

### 9. Theme

**Used in:** All component specs

**Pattern:** `const testTheme = createTheme()` in each file.

**Consolidation:** Export `BLOG_TEST_THEME` from fixtures (or `createTheme()` in a shared test-utils used more broadly).

---

### 10. Modal Root Setup

**Used in:** list, editor, settings-drawer (and potentially others that render dialogs)

**Pattern:**
```ts
beforeEach(() => {
  let modalRoot = document.getElementById('modal-root')
  if (!modalRoot) {
    modalRoot = document.createElement('div')
    modalRoot.id = 'modal-root'
    document.body.appendChild(modalRoot)
  }
})
```

**Consolidation:** Add `ensureModalRoot()` to `jest.setup.ts` so it runs for all tests, or to a blog setup file imported by relevant specs.

---

## Implementation Plan

### Phase 1: Shared Fixtures (Low Risk)

1. Create `packages/web/web-app/src/app/blog/blog-test.fixtures.ts`:
   - `AUTH_PRELOADED_STATE`
   - `BLOG_TEST_CATEGORIES`, `BLOG_TEST_TAGS` (with `slug`)
   - `DEFAULT_BLOG_EDITOR_SETTINGS`
   - `BLOG_EDITOR_BODY_DIRTY_STATE` (for footer test)
   - `BLOG_TEST_THEME`
2. Update specs to import from fixtures instead of defining inline.

### Phase 2: Shared Mock Implementations (Medium Risk)

1. Create `packages/web/web-app/src/app/blog/blog-test-mocks.ts`:
   - `BLOG_STORE_MOCK` – default `getState` with empty i18n
   - `BLOG_STORE_MOCK_WITH_TZ` – for schedule dialog
   - `BLOG_I18N_MOCK` – factory `(overrides?: Record<string, string>) => ({ useStrings, useTranslation })` with full blog key set
   - `BLOG_CONFIG_MOCK`
2. Update each spec to use:
   ```ts
   jest.mock('../../store/store-web.redux', () => BLOG_STORE_MOCK)
   jest.mock('../../i18n', () => BLOG_I18N_MOCK())
   ```

### Phase 3: Jest Setup & useMediaQuery (Medium Risk)

1. Add `ensureModalRoot()` to `jest.setup.ts` (if safe for all web-app tests).
2. Add `useMediaQuery: () => false` to MUI mock in setup, or create `blog-test-setup.ts` that specs import.

**Caution:** Adding MUI mock to global setup affects all web-app specs. Prefer a blog-specific setup file that blog specs import at the top.

### Phase 4: Blog Test Setup File (Optional)

1. Create `packages/web/web-app/src/app/blog/blog-test-setup.ts`:
   - Imports and applies common mocks (store, i18n defaults, rtk-query, config, MUI useMediaQuery)
   - Exports `ensureModalRoot` if not in jest.setup
2. Blog specs add `import '../blog-test-setup'` (or `./blog-test-setup` from admin) as first import.

---

## Files to Create/Modify

| Action | Path |
|--------|------|
| Create | `packages/web/web-app/src/app/blog/blog-test.fixtures.ts` |
| Create | `packages/web/web-app/src/app/blog/blog-test-mocks.ts` |
| Create | `packages/web/web-app/src/app/blog/blog-test-setup.ts` (Phase 4) |
| Modify | `packages/web/web-app/jest.setup.ts` (add ensureModalRoot) |
| Modify | 16 blog spec files to use shared fixtures/mocks |

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Shared mocks break specs that need unique behavior | Keep per-spec overrides; use factory with overrides |
| `jest.setup` changes affect non-blog tests | Add only `ensureModalRoot` to global setup; keep blog-specific mocks in blog setup |
| i18n mock key set grows large | Use `BLOG_I18N_MOCK()` returning all keys; components only use what they need |
| Path differences (blog/ vs blog/admin/) | Each spec keeps its own `jest.mock('../../i18n', ...)` path; only the implementation is shared |

---

## Estimated Effort

- Phase 1: 1–2 hours
- Phase 2: 2–3 hours
- Phase 3: 1 hour
- Phase 4: 1–2 hours

Total: ~6–8 hours.
