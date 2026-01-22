# Public Navigation Implementation Plan - Mobile & Desktop Strategy

## Current Mobile Navigation Architecture

### Key Findings:
1. **Top navbar is ALWAYS visible** (not hidden) - contains logo, app name, and auth buttons
2. **App menu (left sidebar) only shows for authenticated users** via `{isAuthenticated && <MenuNav />}` in Root component
3. **Mobile breakpoint: 600px** - below this, menu opens from bottom, account icon changes to Apps icon
4. **Public pages currently have NO menu** - only navbar with Login/Signup buttons

### Current Public Route Experience:
- **Home (`/`)**: Shows navbar with Logo + Login/Signup buttons, no menu
- **Login/Signup**: Shows navbar with Logo, no menu
- **Shortlink**: Shows navbar, no menu

## The Question: Where Should Public Routes (FAQ, About, Blog) Appear on Mobile?

Since the app menu is authenticated-only, we have **3 options**:

---

## Option 1: Navbar-Only Navigation (Simplest, Industry Standard)

**Approach**: Add public route links directly to the navbar for unauthenticated users

**Mobile Implementation**:
- Add hamburger menu icon to navbar (unauthenticated users only)
- Opens temporary drawer with public links (FAQ, About, Blog, Login, Signup)
- Closes after navigation

**Desktop Implementation**:
- Show public links as text links in navbar header
- OR keep same hamburger menu pattern for consistency

**Pros**:
- Industry standard (GitHub, LinkedIn, Stripe all use this pattern)
- Clean separation: public menu for guests, app menu for authenticated users
- No confusion between public and private content
- Simple to implement

**Cons**:
- Adds another menu component (but scoped to unauthenticated users only)

**Files to Create/Modify**:
```
packages/web/web-app/src/app/ui/menus/
├── public-menu-mobile.component.tsx (NEW)
├── public-menu-desktop.component.tsx (NEW - optional)
└── app-nav-bar.menu.tsx (MODIFY - add hamburger for unauthenticated)
```

---

## Option 2: Unified App Menu (Controversial)

**Approach**: Show the same app menu to ALL users (authenticated and unauthenticated)

**Implementation**:
- Remove `{isAuthenticated && <MenuNav />}` conditional
- Menu shows different content based on auth state:
  - **Unauthenticated**: FAQ, About, Blog, Login, Signup
  - **Authenticated**: Dashboard, Profile, Admin (role-based)

**Pros**:
- Single menu component to maintain
- Consistent UX - menu always in same place

**Cons**:
- **Breaks existing pattern** - app menu is currently authenticated-only
- Confusing UX - menu means different things based on auth state
- **Not industry standard** - most apps don't show left sidebar to guests
- Wastes screen real estate on public pages

---

## Option 3: Footer Navigation (Alternative)

**Approach**: Add footer with public links (FAQ, About, Blog, Terms, Privacy)

**Implementation**:
- Create footer component
- Show on all public pages (Home, FAQ, About, Blog)
- Hide on authenticated pages

**Pros**:
- Common pattern for marketing/content sites
- Doesn't interfere with navbar
- Good for SEO (footer links)

**Cons**:
- Doesn't solve "where are links on mobile" question
- Requires scrolling to bottom
- Still need navbar solution for easy access

---

## SELECTED APPROACH: Hybrid Progressive Enhancement

**User Decision**: Combine Option 4 (responsive navbar) with Option 2 (unified menu post-auth)

### Navigation Strategy by Auth State:

#### Unauthenticated Users (Public Navigation)
**Desktop (>600px)**:
```
┌─────────────────────────────────────────────────┐
│ DX3 Logo  Home  FAQ  About  Blog    Login Signup │
└─────────────────────────────────────────────────┘
```

**Mobile (<600px)**:
```
┌─────────────────────────────┐
│ ☰  DX3 Logo    Login Signup │
└─────────────────────────────┘

Click ☰ opens drawer:
┌─────────────────────────────┐
│ Home                        │
│ FAQ                         │
│ About                       │
│ Blog                        │
│ ────────────────            │
│ Login                       │
│ Signup                      │
└─────────────────────────────┘
```

#### Authenticated Users (Unified Menu)
**All Screen Sizes**:
```
Navbar: DX3 Logo  [App Name]    [Notifications] [Account]

Sidebar Menu (left drawer):
┌──────────────────┐
│ Dashboard        │
│ Profile          │
│ ──────────       │
│ Home             │  ← Public links now in sidebar
│ FAQ              │
│ About            │
│ Blog             │
│ ──────────       │
│ Admin (if role)  │
│ ──────────       │
│ Logout           │
└──────────────────┘
```

### Benefits of This Approach:

1. **Progressive Enhancement**: Public links migrate to sidebar after login
2. **No Duplication**: Public links appear in one place based on auth state
3. **Familiar Patterns**: Unauthenticated users see standard public site navigation
4. **Unified Experience**: Authenticated users have everything in one sidebar
5. **Clean Navbar**: Authenticated navbar stays focused (notifications, account)

---

## Implementation Plan

### Phase 1: Public Navigation Components (Unauthenticated)

#### 1.1 Create Public Menu Mobile Component
**File**: `packages/web/web-app/src/app/ui/menus/public-menu-mobile.component.tsx`

- Use `DrawerMenuComponent` (same as authenticated mobile menu)
- Render public links: Home, FAQ, About, Blog
- Include Login/Signup buttons at bottom
- Close drawer on navigation
- Anchor: bottom (mobile) or left (tablet)

#### 1.2 Modify Navbar for Public Links
**File**: `packages/web/web-app/src/app/ui/menus/app-nav-bar.menu.tsx`

Add conditional rendering:
```typescript
{!isAuthenticated && (
  <>
    {/* Desktop: Horizontal links */}
    {!mobileBreak && (
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Link to="/">Home</Link>
        <Link to="/faq">FAQ</Link>
        <Link to="/about">About</Link>
        <Link to="/blog">Blog</Link>
      </Box>
    )}

    {/* Mobile: Hamburger icon */}
    {mobileBreak && (
      <IconButton onClick={handlePublicMenuToggle}>
        <MenuIcon />
      </IconButton>
    )}

    {/* Login/Signup buttons */}
    <Button onClick={() => navigate('/login')}>Login</Button>
    <Button onClick={() => navigate('/signup')}>Signup</Button>
  </>
)}
```

#### 1.3 Add Public Menu Toggle State
**File**: `packages/web/web-app/src/app/ui/store/ui-web.reducer.ts`

Add new state:
```typescript
publicMenuOpen: boolean  // For unauthenticated mobile menu
```

### Phase 2: Unified Menu for Authenticated Users

#### 2.1 Extend MenuConfigService
**File**: `packages/web/web-app/src/app/ui/menus/menu-config.service.ts`

Add public section to authenticated menus:
```typescript
const publicSection: AppMenuType = {
  id: 'public',
  label: 'Public Pages',
  items: [
    { id: 'home', label: 'Home', path: '/', icon: 'Home' },
    { id: 'faq', label: 'FAQ', path: '/faq', icon: 'Help' },
    { id: 'about', label: 'About', path: '/about', icon: 'Info' },
    { id: 'blog', label: 'Blog', path: '/blog', icon: 'Article' },
  ],
}
```

Insert after user sections, before admin sections.

#### 2.2 Update loginBootstrap
**File**: `packages/web/web-app/src/app/config/bootstrap/login-bootstrap.ts`

Ensure public section is included in all role-based menus:
```typescript
function setUpMenus(userProfile: UserProfileStateType, mobileBreak: boolean) {
  const menuService = new MenuConfigService()
  let menus: AppMenuType[] = []

  if (userProfile.role.includes(USER_ROLE.SUPER_ADMIN)) {
    menus = menuService.getMenus(USER_ROLE.SUPER_ADMIN, userProfile.b)
  } else if (userProfile.role.includes(USER_ROLE.ADMIN)) {
    menus = menuService.getMenus(USER_ROLE.ADMIN, userProfile.b)
  } else {
    menus = menuService.getMenus(undefined, userProfile.b)
  }

  // Public section already included in getMenus() output

  store.dispatch(uiActions.menusSet({ menus }))
  if (!mobileBreak) {
    store.dispatch(uiActions.toggleMenuSet(true))
  }
}
```

### Phase 3: i18n Strings

**File**: `packages/web/web-app/src/assets/locales/en.json`

Add new strings:
```json
{
  "ABOUT": "About",
  "BLOG": "Blog",
  "FAQ": "FAQ",
  "HOME": "Home",
  "PUBLIC_PAGES": "Public Pages"
}
```

### Phase 4: Route Configuration

**File**: `packages/web/web-app/src/app/config/config-web.service.ts`

Add new route constants:
```typescript
getWebRoutes() {
  return {
    ABOUT: { MAIN: '/about' },
    BLOG: { MAIN: '/blog' },
    FAQ: { MAIN: '/faq' },
    // ... existing routes
  }
}
```

---

## Critical Files to Modify

### New Files:
1. `packages/web/web-app/src/app/ui/menus/public-menu-mobile.component.tsx`
2. `packages/web/web-app/src/app/about/about-web.component.tsx` (placeholder)
3. `packages/web/web-app/src/app/blog/blog-web.component.tsx` (placeholder)
4. `packages/web/web-app/src/app/faq/faq-web.component.tsx` (placeholder)

### Modified Files:
1. `packages/web/web-app/src/app/ui/menus/app-nav-bar.menu.tsx` - Add public nav logic
2. `packages/web/web-app/src/app/ui/menus/menu-config.service.ts` - Add public section
3. `packages/web/web-app/src/app/ui/store/ui-web.reducer.ts` - Add publicMenuOpen state
4. `packages/web/web-app/src/app/config/config-web.service.ts` - Add route constants
5. `packages/web/web-app/src/assets/locales/en.json` - Add i18n strings
6. `packages/web/web-app/src/app/routers/ssr.routes.tsx` - Add FAQ/About/Blog routes

---

## Critical Files Reference

**Navigation Components**:
- `packages/web/web-app/src/app/ui/menus/app-nav-bar.menu.tsx` - Top navbar (modify)
- `packages/web/web-app/src/app/ui/menus/menu-nav.tsx` - Menu router (authenticated only)
- `packages/web/web-app/src/app/root-web.component.tsx` - Layout orchestrator

**Breakpoint Constants**:
- `packages/web/libs/ui/ui.consts.ts` - `MEDIA_BREAK.MOBILE = 600px`

**Authenticated Menu Pattern** (for reference):
- `packages/web/web-app/src/app/ui/menus/app-menu-mobile.component.tsx`
- `packages/web/web-app/src/app/ui/menus/app-menu-desktop.component.tsx`

---

## Verification Strategy

### Manual Testing:

**Unauthenticated Flow**:
1. Navigate to home page
2. **Desktop**: Verify horizontal links in navbar (Home, FAQ, About, Blog)
3. **Mobile**: Verify hamburger menu icon appears, opens drawer with public links
4. Click each public link, verify navigation works
5. Click Login/Signup buttons, verify they work

**Authenticated Flow**:
1. Log in to the application
2. **Desktop**: Verify navbar shows only Logo, App Name, Notifications, Account
3. **All sizes**: Verify left sidebar menu opens with:
   - Dashboard section
   - Profile section
   - **Public Pages section** (Home, FAQ, About, Blog)
   - Admin section (if applicable)
   - Logout button
4. Click each public link in sidebar, verify navigation works
5. Verify public pages are accessible while logged in

**Responsive Testing**:
1. Resize browser from desktop to mobile
2. Verify navbar switches from horizontal links to hamburger at 600px breakpoint
3. Verify menu drawer opens from bottom on mobile (<600px)
4. Verify menu drawer opens from left on tablet/desktop (>600px)

### Integration Testing:
1. Verify SSR rendering works for public pages (FAQ, About, Blog once created)
2. Verify hydration works correctly (no mismatches)
3. Verify menu state persists in localStorage for authenticated users
4. Verify publicMenuOpen state resets on authentication

---

## Next Steps

1. Create public menu mobile component
2. Update navbar with conditional public navigation
3. Add publicMenuOpen state to Redux
4. Extend MenuConfigService with public section
5. Add i18n strings
6. Create placeholder FAQ/About/Blog components
7. Test both unauthenticated and authenticated flows
8. Verify responsive behavior at all breakpoints
