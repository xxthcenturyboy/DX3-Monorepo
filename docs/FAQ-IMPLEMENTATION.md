# FAQ Feature Implementation Plan

## 1. Overview
This document outlines the plan to add a Frequently Asked Questions (FAQ) module to the application. The feature includes public-facing FAQs, internal application FAQs, and an administration interface for managing these records.

## 2. Data Model

### Schema Definition
We will introduce a new entity `FAQ`.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID / Integer | Yes | Primary Key |
| `question` | String | Yes | The FAQ question text |
| `answer` | Text / String | Yes | The FAQ answer (stored as Markdown) |
| `audience` | Enum | Yes | Values: `['PUBLIC', 'APP']` |
| `order` | Integer | Yes | Display order for sorting |
| `createdAt` | Timestamp | Yes | Auto-generated creation date |
| `updatedAt` | Timestamp | Yes | Auto-generated update date |
| `deletedAt` | Timestamp | No | Nullable field for Soft Deletes |

## 3. Backend Implementation

### API Endpoints
We need to create the following endpoints (REST or GraphQL resolvers):

#### Public / General User Endpoints
1.  **Get Public FAQs**
    *   **Route:** `GET /api/faqs/public`
    *   **Access:** Public (No Auth)
    *   **Logic:** Fetch records where `audience` = 'PUBLIC' AND `deletedAt` is NULL.
2.  **Get App FAQs**
    *   **Route:** `GET /api/faqs/app`
    *   **Access:** Authenticated Users
    *   **Logic:** Fetch records where `audience` = 'APP' AND `deletedAt` is NULL.

#### Admin Endpoints
*Access restricted to `Admin` or `SuperAdmin` roles.*

1.  **List All FAQs**
    *   **Route:** `GET /api/admin/faqs`
    *   **Logic:** Fetch all records (paginated). Include `deletedAt` status if "Trash" view is required, otherwise filter out soft-deleted items by default.
2.  **Get FAQ Details**
    *   **Route:** `GET /api/admin/faqs/:id`
3.  **Create FAQ**
    *   **Route:** `POST /api/admin/faqs`
    *   **Body:** `{ question, answer, audience }`
4.  **Update FAQ**
    *   **Route:** `PUT /api/admin/faqs/:id`
5.  **Reorder FAQs**
    *   **Route:** `PATCH /api/admin/faqs/order`
    *   **Body:** `[{ id, order }]` (List of updated positions)
6.  **Delete FAQ (Soft Delete)**
    *   **Route:** `DELETE /api/admin/faqs/:id`
    *   **Logic:** Set `deletedAt` to current timestamp.

## 4. Frontend Implementation

### Navigation Logic
The navigation structure requires conditional rendering based on the authentication state.

1.  **Logged Out (Public)**
    *   **Component:** `NavBar`
    *   **Logic:** If `!isAuthenticated`, render "FAQ" link.
    *   **Target:** Routes to `/faq` (Public View).
2.  **Logged In (User)**
    *   **Component:** `NavBar` -> Remove "FAQ" link.
    *   **Component:** `Sidebar`
    *   **Logic:** If `isAuthenticated`, render "FAQ" link.
    *   **Target:** Routes to `/app/faq` (App View).
3.  **Logged In (Admin)**
    *   **Component:** `Sidebar` (Admin Section)
    *   **Logic:** If `user.role` is `Admin` or `SuperAdmin`, render "FAQ Admin" link.
    *   **Target:** Routes to `/admin/faqs`.

### Views / Components

#### 1. Public FAQ Page (`/faq`)
*   **Layout:** Public Layout (NavBar visible).
*   **Data Source:** `GET /api/faqs/public`.
*   **Display:** Accordion or List style display of questions and answers (Answers rendered from Markdown using `react-markdown`).

#### 2. App FAQ Page (`/app/faq`)
*   **Layout:** App Layout (Sidebar visible).
*   **Data Source:** `GET /api/faqs/app`.
*   **Display:** Similar to Public view (Answers rendered from Markdown using `react-markdown`), potentially styled to match the dashboard.

#### 3. Admin List View (`/admin/faqs`)
*   **Layout:** Admin Layout.
*   **Components:**
    *   **Visual List:** Renders FAQs similarly to the Public/App view (Accordion style).
    *   **Drag & Drop:** Uses `@hello-pangea/dnd` (or `dnd-kit`) to allow reordering of questions.
    *   **Actions:** Edit and Delete buttons visible on each FAQ item.
    *   **Filters:** Filter by Audience (tabs for PUBLIC vs APP).
*   **UX:** "What You See Is What You Get" management interface.

#### 4. Admin Detail/Edit View (`/admin/faqs/:id` or `/admin/faqs/new`)
*   **Form Fields:**
    *   Question (Text Input)
    *   Answer (Markdown-compatible WYSIWYG Editor using `MDXEditor`)
    *   Audience (Dropdown/Radio: PUBLIC, APP)
*   **Validation:** All fields required.

## 5. Security & Permissions
*   **Public Route:** Rate limiting should be applied to prevent scraping.
*   **App Route:** Must verify a valid JWT/Session.
*   **Admin Routes:** Middleware must strictly enforce `Admin` or `SuperAdmin` roles.

## 6. Testing Strategy
### Backend Unit Tests
*   **Service Layer:**
    *   Verify CRUD operations.
    *   Test `audience` filtering (ensure PUBLIC doesn't return APP records and vice versa).
    *   Test Soft Delete logic (ensure `deletedAt` is set and filtered out in standard queries).
    *   Test Reordering logic (ensure order updates correctly).
*   **Controller Layer:**
    *   Verify correct HTTP status codes (200, 201, 403, 404).
    *   Verify request body validation.
    *   Ensure RBAC guards are correctly applied to Admin routes.

### Frontend Testing Preparation
*   **Component Mocks:**
    *   **MDXEditor:** Since `MDXEditor` relies on browser-specific APIs, it requires a mock for unit/integration tests.
    *   **Mock Implementation:** Create a simplified mock component (e.g., a textarea) that accepts `markdown` and `onChange` props to simulate editor interactions in Jest/Vitest.
    *   **Drag & Drop:** Mock the DnD context providers to test list rendering without drag interactions.


## 7. Execution Checklist
### Phase 1: Backend Core
- [ ] Implement Backend Service and Controller logic (including reorder endpoint).
- [ ] Add API Access Control Guards (RBAC).
- [ ] Write Backend Unit Tests (Service & Controller).

### Phase 2: Frontend Setup & Read Views
- [ ] Install Frontend Dependencies (`@mdxeditor/editor`, `react-markdown`, `@hello-pangea/dnd`).
- [ ] Create Test Mock for `MDXEditor`.
- [ ] Create Frontend API Client methods for FAQs.
- [ ] Build Public FAQ Component.
- [ ] Build App FAQ Component.

### Phase 3: Admin Management
- [ ] Build Admin List View (Reorderable Visual List).
- [ ] Build Admin Create/Edit Form.

### Phase 4: Integration & QA
- [ ] Update Navigation (NavBar and Sidebar) logic.
- [ ] QA Testing (Public, User, and Admin flows).
