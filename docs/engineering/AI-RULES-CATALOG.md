# NASAQ — AI Engineering Rules Catalog

This catalog documents the active engineering rules and quality standards governing all AI agents and developers working on the **NASAQ** Employee Attendance & Workforce Management System.

---

## 1. Rule Index

| Rule File | Scope | Summary |
|---|---|---|
| [ai-safety.md](file:///.agents/rules/ai-safety.md) | Universal | 12 Golden Safety Rules: Analyze First, Strict Architecture, Zero Unnecessary Refactoring, Template Purity. |
| [architecture.md](file:///.agents/rules/architecture.md) | Universal | Clean Architecture layers, Next.js feature slicing, and **Centralized File Storage & Media Architecture**. |
| [backend-dotnet.md](file:///.agents/rules/backend-dotnet.md) | Backend (.NET 10) | C# 13 standards, **CQRS Direct Binding Policy**, **Code Comments & Global Usings Policy**, **Centralized File Storage**, and **Unit of Work & Post-Commit Rules**. |
| [database-efcore.md](file:///.agents/rules/database-efcore.md) | Database | EF Core migrations, configuration conventions, index strategies, shared Identity/UnitOfWork transactions, and safe rollback. |
| [security-auth.md](file:///.agents/rules/security-auth.md) | Security | 4-tier RBAC (`SuperAdmin`, `Admin`, `Supervisor`, `Employee`), JWT authentication, token rotation, supervisor scoping. |
| [frontend-nextjs.md](file:///.agents/rules/frontend-nextjs.md) | Frontend (Next.js 16) | Next.js App Router, feature modules, Redux Toolkit, and PWA integration. |
| [design-system-i18n.md](file:///.agents/rules/design-system-i18n.md) | Frontend | Official Modernize UI/UX design reference, 34 permanent rules (UI-001 to UI-034), application shell geometry, authentic profile dropdown, self-service photo architecture, settings persistence (`nasaq.ui.preferences.v1`), CSS logical properties, Stylis double-flip prevention, flex gap architecture, bi-directional Arabic RTL / English LTR, global red required field asterisks (`error.main`), semantic danger close button vs neutral cancel, calendar date-only timezone integrity, shared expandable table details with LTR isolation, next-intl keys. |
| [testing-quality.md](file:///.agents/rules/testing-quality.md) | Quality | Verification gates: 0 compiler warnings, import integrity, translation validation, testing freeze rules, and post-freeze verification checklist. |

---

## 2. Core Architectural Policies (Rule Highlights)

### 2.1 CQRS Direct Binding Policy (`backend-dotnet.md` §2.3)
- Prefer direct model binding to MediatR Commands and Queries (`[FromBody]`, `[FromQuery]`, `[FromForm]`, `[FromRoute]`).
- Prohibit redundant intermediate Request DTOs that merely duplicate Command/Query properties.
- Retain Request Models only by exception (security boundaries, server-managed properties, or distinct public API contracts).
- Route IDs and authenticated `CurrentUserId` claims must remain authoritative.

### 2.2 Centralized File Storage Architecture (`backend-dotnet.md` §10, `architecture.md` §5)
- All file operations centralized through `IFileService` and `FileService` (storage & metadata), `IFileValidationService` (extension, size, magic-byte signatures), and `IFileAccessAuthorizer` (record-level authorization).
- General endpoints live in `FilesController` (`/api/v1/files/upload`, `/api/v1/files`, `/api/v1/files/{id}`, `/api/v1/files/{id}/download`).
- Handlers call `IFileService.SaveAsync` directly. `IFormFile` is explicitly permitted within Application Commands and Handlers.
- `Employee.ProfilePhoto` stores `Guid?` referencing `StoredFiles.Id` (never binary content in business tables).
- Physical files remain on disk outside database and web root with GUID-based names.

### 2.3 Unit of Work & Transaction Lifecycle (`backend-dotnet.md` §11, `database-efcore.md` §5)
- Shared scoped `ApplicationDbContext` between Identity and application entities.
- Start transactions before Identity/business mutations; check every `IdentityResult`.
- Database rollback via `UnitOfWork.RollbackAsync()` is authoritative; manual Identity deletion compensation after rollback is prohibited.
- `RegisterPostCommitAction` strictly requires an active transaction (`HasActiveTransaction == true`); post-commit callbacks execute sequentially after confirmed commit.
- `NotificationService`: Uses post-commit actions inside transactions; persists and awaits directly with error logging outside transactions. Never opens unnecessary database transactions solely to dispatch SignalR events.

### 2.4 Code Comments & Global Usings Policy (`backend-dotnet.md` §9)
- **Self-documenting code is the default:** Code must express intent through clear naming and clean structure.
- **Prohibited:** Routine XML documentation (`/// <summary>`), redundant explanations of what code does, and decorative `#region` blocks.
- **Allowed by Exception:** Explaining **WHY** for non-obvious business logic, security guards (e.g. anti-escalation), or technical workarounds (e.g. `DeleteBehavior.Restrict`).
- **Global Usings:** Each project manages an authoritative `GlobalUsings.cs`. Redundant file-level `using` directives for globally imported namespaces are strictly eliminated.

### 2.5 Official UI/UX Design Reference: Modernize (`design-system-i18n.md` §1)
- **Primary Design Reference:** The purchased `modernize/` directory is the permanent, official UI/UX design reference for all current and future frontend development.
- **Read-Only Blueprint:** The `modernize/` template directory is strictly read-only and immutable.
- **High-Fidelity Migration:** Inspect source implementations first. Prefer reusing or adapting authentic Modernize components, styles, layouts, and assets (`ModernizeDataTable`, `ModernizeStatsCards`, `ModernizeTableToolbar`, `Breadcrumb` with `ChatBc.png`).
- **Expressive Iconography:** Enforce colorful, professional icons (`@tabler/icons-react` / `@mui/icons-material`) with semantic color mapping; prohibit arbitrary monochrome icons.
- **Domain Separation:** Modernize is a design reference, not a business domain reference. Foreign concepts (e-commerce, orders, tenant sales, marketing) are strictly prohibited in NASAQ. NASAQ interfaces exclusively represent Employee Attendance & Workforce Management.
- **Centralized Shared Components:** Maintain reusable presentation components under `src/shared/components/` rather than duplicating Modernize code inside individual feature modules. Full bi-directional Arabic RTL and English LTR compatibility is mandatory.
- **Permanent UI Standards (RULE UI-001 through UI-018):**
  - **UI-001 (Modernize Reference):** `modernize/` is mandatory benchmark; preserve geometry, border-radius, and typography.
  - **UI-002 (Bidi Mirroring):** Strict logical property enforcement (`marginInlineStart`, `insetInlineStart`, `textAlign: start`); prohibit hardcoded physical left/right CSS.
  - **UI-003 (Arabic Pluralization):** Zero naive string concatenation; strictly use `formatArabicPlural` (0, 1, 2, 3-10, 11+).
  - **UI-004 (Direction-Aware Anchoring):** Popovers and action menus dynamically flip horizontal anchor origin based on direction (`isRtl ? "left" : "right"`).
  - **UI-005 (Bidi Table Pagination):** Arabic pagination formatted as `{from}–{to} من {count}` with isolated LTR spans for numbers.
  - **UI-006 (Numeric Isolation):** Numbers, codes, phone numbers, and coordinates must be wrapped with `direction: ltr` or `unicode-bidi: isolate`.
  - **UI-007 (Primary Create Placement):** Add/Create action resides on same row as Overview section heading; never duplicated in table toolbar.
  - **UI-008 (Toolbar Standards):** 38x38px icon buttons, 8px border radius, icon-only refresh with translated tooltip, direction-aware column menu, disabled bulk delete when 0 selected with dynamic tooltip.
  - **UI-009 (Row Density & Comfort):** Row height ~62px (body `py: 2.1, px: 2.25`, font `14px`, line-height `1.5`), header height 52px (`py: 1.85, px: 2.25`).
  - **UI-010 (Selected Row Styling):** 3px primary accent start border, subtle alpha background in light and dark mode.
  - **UI-011 (Concise Overview & Rich Expansion):** Main table displays essential identifying columns; secondary attributes live in expandable accordion panel.
  - **UI-012 (Meaningful Summary Metrics):** 4 contextually relevant operational cards with responsive flex layout and animated skeleton loaders.
  - **UI-013 (Destruction Safety):** Confirmation dialogs for single and bulk delete with error styling, clear warnings, and dynamic grammatical pluralization.
  - **UI-014 (Accessibility & Dark Mode):** WCAG AA 4.5:1 contrast, explicit 1px divider borders in dark mode.
  - **UI-015 (Four-Mode Parity):** Every view verified in AR Light, AR Dark, EN Light, EN Dark.
  - **UI-016 (Zero Layout Shifts):** Identical heights and paddings between Cairo and Plus Jakarta Sans.
  - **UI-017 (Symmetrical Spacing):** No hardcoded asymmetrical margins or paddings across directions.
  - **UI-018 (Shared Architecture):** All modules consume shared components (`ModernizeDataTable`, `ModernizeStatsCards`, `ModernizeTableToolbar`, `ConfirmActionDialog`).
  - **UI-019 (Modernize Shell & Sidebar Geometry):** 270px width (80px mini), transparent/subtle background, solid `primary.main` active navigation with white text/icons and shadow, unselected hover subtle alpha, zero non-standard pill borders.
  - **UI-020 (Sidebar Footer Account Panel):** Real user photo via `useAuthenticatedPhotoUrl` or dynamic colored initials avatar, full display name, secondary role label, power/logout button, direct link to `/profile`, matching Modernize geometry.
  - **UI-021 (Application Branding):** Genuine NASAQ branding (`NasaqBrand`) with dynamic light/dark mode support; strict prohibition of third-party template wordmarks (e.g. Modernize logo).
  - **UI-022 (User Profile Dropdown Standards):** Compact 360px Modernize paper layout, authentic user data (photo, name, email, role), genuine actions only (My Profile, Theme Settings), zero fake dummy links (`#tasks`, `#inbox`), zero commercial ads, explicit loading state on logout.
  - **UI-023 (Settings & Customizer Direction Parity):** Floating Fab visibility in both AR and EN (`insetInlineEnd: "25px"`, `bottom: "25px"`, `zIndex: 1250`) so it is never obscured by the desktop RTL sidebar; drawer dynamically anchored opposite sidebar (`isRtl ? "left" : "right"`).
  - **UI-024 (Display Language Dropdown):** Compact 220px Modernize popover, circular flag icons, Arabic/English labels, checkmark indicator for active language, zero clutter.
  - **UI-025 (CSS Logical Properties & Stylis Double-Flip Prohibition):** Use CSS Logical Properties (`insetInlineEnd`, `marginInlineEnd`, `paddingInlineStart`, `borderInlineStart`, `textAlign: start`) for all directional layouts; prohibit manual direction ternaries that Stylis reverses in RTL.
  - **UI-026 (Global Flex Gap Architecture & Adjacent Control Spacing):** Standardize flexbox `gap` across button pairs, toolbars, switchers, and dialog actions; enforce `useFlexGap: true` on `MuiStack` and reset sibling margins in `MuiDialogActions`.
  - **UI-027 (Icon-to-Text Spacing & Adornment Alignment):** Consistent 8px separation between icons and labels (`MuiButton`, `MuiAlert`, `NavItem`, `.MuiInputAdornment-positionStart`); direction-independent margin reset.
  - **UI-028 (Notification Toast & Overlay Direction Standard):** Floating toast container anchored via `insetInlineEnd: { xs: 16, sm: 24 }` (top-right in EN, top-left in AR), `borderInlineStart: 4px solid ...` accent border, flex gap layout, and non-overlapping close button.
  - **UI-029 (Modernize Design Fidelity & Palette Architecture):** Dark Mode palettes must preserve the authentic Modernize token hierarchy (`BLUE_THEME` background: `default: '#2A3447'`, `paper: '#2A3447'`, `dark: '#2A3547'`; `baseDarkTheme`: `background: '#171c23'`). Never inject arbitrary pitch-black (`#14181f`) or mismatched dark gray overrides into core layout surfaces. Active navigation items (`NavItem`) enforce flat Modernize styling with `boxShadow: 'none'` (zero glowing heavy neon drop shadows). Sidebar footer account panel (`Profile.tsx`) utilizes authentic `secondary.light` container background (`#1C455D` in dark mode, `#E8F7FF` in light mode) with safe text truncation and auto inline-start power button positioning.
  - **UI-030 (Operational Dashboard Presentation & Anti-Placeholder Policy):** The root dashboard (`DashboardView.tsx`) must represent a genuine, localized NASAQ workforce management operational shell. Strictly prohibit generic starter-template architecture placeholders and un-isolated mock financial/attendance figures. Provide a localized Welcome Banner with the authenticated user's name, role chips, and current system date; responsive Quick Access cards linking to real active routes (`/employees`, `/locations`, `/profile`, `/notifications`); genuine system security & status KPIs; and operational platform guidelines with complete bilingual parity (`ar.json` and `en.json`).
  - **UI-031 (Global Required Field Asterisk Standard):** Every required field indicator (`*`) must globally render in `theme.palette.error.main` across all forms, dialogs, drawers, and labels in both Light and Dark modes (`MuiCssBaseline`, `MuiFormLabel`, `MuiInputLabel`, `CustomFormLabel`).
  - **UI-032 (Semantic Close Button Danger Styling vs Neutral Cancel):** Dedicated Close buttons (`IconX`, "Close" / "إغلاق") must use danger styling (`color: 'error.main'`, hover `alpha(error.main, 0.08)`, 32-36px hit area; text variant `variant="outlined" color="error"` via `DialogCloseButton`). Strict semantic distinction from neutral Cancel actions (`variant="outlined" color="inherit"`).
  - **UI-033 (Calendar Date-Only Integrity & Timezone Shift Prevention):** Date-only domain properties (`HireDate`, `DateOfBirth`) represent calendar dates without time components. Prohibit raw `toISOString().split('T')[0]` or uncalibrated `toLocaleDateString()`. Use `toDateInputValue` for forms and `formatDateOnly` for tables/details.
  - **UI-034 (Shared Expandable Table Details & LTR Isolation Architecture):** Expandable row details across data tables must use Modernize multi-card grid layout with colored icon badge, localized label, strong typography, strict LTR isolation for phone numbers and coordinates (`formatCoordinates`), Arabic grammatical pluralization (`formatPluralNumber`), and standardized action buttons.
  - **UI-035 (Authenticated Profile Photo & Avatar Architecture):** Unauthenticated download URLs (`Router.Files.Download(...)`) must never be passed directly to `<Avatar src="...">` or HTML `<img>` elements due to missing JWT Bearer tokens causing 401 Unauthorized errors. All profile photos and employee avatars across the application must consume the `<ProfilePhotoAvatar>` component (`@/shared/components/avatar`) and `useAuthenticatedPhotoUrl`. Handlers must call `broadcastPhotoInvalidation` when photos are updated or removed to ensure immediate event-driven cross-component cache synchronization without full page reloads, and synchronize Redux `auth.user` state. Server-side physical deletion of replaced photos must occur strictly post-commit.
  - **UI-036 (Canonical Dialog Architecture & Viewport Clipping Prevention):** All form-driven modal dialogs must use `PaperProps={{ component: "form", onSubmit: handleSubmit, sx: { maxHeight: "calc(100vh - 96px)", display: "flex", flexDirection: "column", overflow: "hidden" } }}` with `DialogTitle` (`flexShrink: 0`), `DialogContent` (`flex: "1 1 auto", overflowY: "auto", minHeight: 0`), and `DialogActions` (`flexShrink: 0, borderTop: 1, borderColor: "divider"`). Prohibit nesting intermediate `<form>` containers inside `Dialog` that expand to natural height and push `DialogActions` off-screen on scaled displays.

---

## 3. Business Modules Implementation Status

### 3.1 MOD-02: Employees & Workforce Directory
- Full CRUD, bulk delete, supervisor hierarchy, employee code generation, activation toggles, profile photos.

### 3.2 MOD-03: Work Locations & Geofences
- Full CRUD, GPS coordinates, circular geofence radius (meters), accuracy thresholds, activation toggles, employee assignment.

### 3.3 MOD-04: Work Schedules & Shifts
- Shift definitions (`WorkShift`: daytime, overnight crossing midnight, grace minutes, cutoff times).
- Weekly schedules (`WorkSchedule`, `WorkScheduleDay`: working days vs rest days, default fallback).
- Employee assignments (`EmployeeScheduleAssignment`: effective date ranges, conflict detection).

### 3.4 MOD-05: Attendance Engine
- GPS-verified check-in and check-out (`AttendanceRecord`, `GeofenceService`: Haversine formula).
- Shift resolution (`ShiftResolutionService`: schedule lookup, overnight detection, arrival classification).
- Verification workflow (`Verified` inside geofence vs `PendingReview` with failure reasons).

### 3.5 MOD-06: Points & Penalties Engine
- Policy-driven configuration (`PointRule`: Green rewards, Red penalties, Black disciplinary infractions).
- Auditable immutable transaction ledger (`PointTransaction`: signed points, source events, timestamps).
- Automated evaluation (`IPointCalculationEngine`: arrival rewards/penalties, shift completion, strict idempotency).
- Administrative reversal workflow with offsetting reversal ledger entries.

