---
trigger: glob
globs: "**/frontend/src/theme/**/*.ts, **/frontend/src/theme/**/*.tsx, **/frontend/src/i18n/**/*.ts, **/frontend/src/i18n/**/*.json, **/frontend/src/shared/components/**/*.tsx"
---

# Design System & Internationalization (i18n) Standards

This rule defines styling conventions, theme token usage, RTL layout handling, and internationalization standards for `core-starter`.

---

## 1. Material UI (MUI v6) & Modernize Design Tokens

- **Zero Hardcoded Colors:** Never write raw HEX, RGB, or HSL color literals directly in component `sx` props or inline CSS (e.g., avoid `color: "#5D87FF"`). Always reference semantic palette tokens:
  ```tsx
  // Correct
  <Typography sx={{ color: "primary.main", bgcolor: "background.paper" }}>
  // Avoid
  <Typography sx={{ color: "#5D87FF", bgcolor: "#FFFFFF" }}>
  ```
- **Theme Palettes:** Pre-configured theme palettes are defined in `frontend/src/theme/`:
  - `LightThemeColors.tsx` for light mode.
  - `DarkThemeColors.tsx` for dark mode.
  - Customizer preferences (theme mode, direction, border radius) are managed via `frontend/src/theme/customizerContext.tsx` and persisted in `localStorage`.
- **Spacing:** Always use the MUI theme spacing multiplier (e.g., `sx={{ p: 2, m: 1 }}` maps to 16px and 8px).
- **Typography:** Use semantic typography variants (`h1` through `h6`, `subtitle1`, `body1`, `body2`, `caption`). Do not manually redefine font sizes or line heights inside components unless building specialized data displays.

---

## 2. Bi-directional Layout (RTL & LTR)

- **First-Class RTL Support:** CoreStarter supports both Left-to-Right (English) and Right-to-Left (Arabic) layouts natively.
- **Direction Switching:** Controlled via `theme/Rtl.tsx` using `stylis-plugin-rtl` and stored in `localStorage` under `corestarter_dir` (`"rtl"` | `"ltr"`).
- **Direction-Aware Styling:**
  - Avoid using hardcoded directional CSS properties like `margin-left` or `right: 0` in styles where alignment should flip.
  - Use logical MUI spacing properties:
    - Use `mr` / `ml` or prefer `start` / `end` concepts.
    - For icons alongside text, ensure margins automatically adjust based on text direction.
  - Test layouts in both directions before completing UI work.

---

## 3. Bilingual Localization (Arabic & English)

- **Supported Locales:** Defined in `frontend/src/i18n/config.ts`:
  - `ar`: Arabic (`messages/ar.json`)
  - `en`: English (`messages/en.json`)
- **No Hardcoded UI Strings:** **Every single user-facing string** (labels, button texts, table headers, error messages, placeholders, tooltips) must be translated and retrieved via the translation system.
- **Key Parity:** Both `ar.json` and `en.json` must have identical key hierarchies. When adding a new key to `en.json`, you must provide the corresponding Arabic translation in `ar.json`.
- **Validation Script:** Always run the automated translation verification script after updating localization dictionaries:
  ```bash
  npm run validate:i18n
  ```
  This script verifies that no missing keys exist between languages.

---

## 4. Reusable Shared Components (`src/shared/components/`)

- Prefer reusing existing presentation components in `src/shared/components/` over creating duplicates:
  - `cards/`: `BlankCard.tsx`, `DashboardCard.tsx`
  - `container/`: `PageContainer.tsx`
  - `dialogs/`: Standard confirmation and modal dialogs
  - `feedback/`: Empty states, skeleton loaders, and alerts
  - `tables/`: Data tables with pagination and sorting
  - `forms/`: Pre-styled form controls, selects, and text inputs
- Every shared component should be accessible, responsive across breakpoints (`xs`, `sm`, `md`, `lg`, `xl`), and direction-agnostic.

---

## 5. Application Shell Branding, Layout & Navigation Standards

- **RULE UI-019 (Modernize Shell & Sidebar Geometry):**
  - Desktop sidebar width must remain strictly 270px (80px mini sidebar collapsed).
  - Background must use `background.paper` or subtle neutral theme styling without harsh borders.
  - Active navigation items MUST use authentic Modernize styling: solid `primary.main` fill, white typography and icons (`color: "common.white"`), soft drop shadow (`boxShadow: (theme) => \`0 4px 12px ${alpha(theme.palette.primary.main, 0.35)}\``), and 8px border radius (`borderRadius: "8px"`).
  - Unselected items must use soft alpha hover (`alpha(primary.main, 0.08)`). Arbitrary vertical line pills, left/right edge indicators, or high-contrast border rectangles are strictly prohibited.
- **RULE UI-020 (Sidebar Footer Account Panel):**
  - Must display authenticated user's actual profile photo via `useAuthenticatedPhotoUrl` or dynamic colored initials avatar when null.
  - Must display user's full display name, secondary role label (`caption` variant), and power/logout button.
  - Clicking the account info region must navigate directly to `/profile`.
  - Prohibit hardcoded demo names ("Mathew Anderson", etc.) or static placeholder images.
- **RULE UI-021 (Application Branding & Logo Purity):**
  - Application branding must use `NasaqBrand` component rendering the official NASAQ identity across Light and Dark modes.
  - Hardcoded template wordmarks (such as `dark-logo.svg` or `light-logo.svg` drawing "Modernize") are strictly prohibited.
- **RULE UI-022 (User Profile Header Dropdown):**
  - Profile menu popover must use compact 360px Modernize paper layout.
  - Header section must render actual authenticated user photo, full name, email, and role badge.
  - Menu options must be genuine operational links only: **My Profile** (`/profile`) and **Theme Settings** (invoking `openCustomizer()`).
  - Prohibit fake or dead demo items (`#inbox`, `#tasks`, `#notes`), mock unread badges, and commercial upgrade banners ("Unlimited Access").
  - Logout action must show a progress spinner during execution and handle API token revocation gracefully.
- **RULE UI-023 (Settings & Customizer Direction Parity):**
  - The floating Settings/Customizer action button (Fab) must use logical positioning `insetInlineEnd: "25px"`, `bottom: "25px"`, and an elevated `zIndex: 1250`.
  - In Arabic RTL, the Fab automatically anchors to `left: 25px` (opposite the right-anchored RTL desktop sidebar), preventing it from being covered or hidden.
  - The settings drawer must anchor dynamically opposite the desktop sidebar (`isRtl ? "left" : "right"`).
  - All Customizer sections, switches, and radio groups must be fully localized in Arabic and English.
- **RULE UI-024 (Display Language Dropdown):**
  - Language switcher in Header must use a compact 220px Modernize popover.
  - Each language option must show a circular flag icon (30x30px), localized title, and an active checkmark indicator.
  - Language change must update both `i18n` locale and `customizerContext` atomically and persist across page reloads.

---

## 6. Profile Photo Architecture & UI Synchronization

- **Self-Service Photo Management:**
  - Dedicated endpoint `PUT /api/v1/employees/me/photo` accepts `photo` (`IFormFile`) or `removePhoto` (`bool`).
  - Managed by `UpdateMyProfilePhotoCommand` orchestrating `IFileService`, `IFileValidationService`, and `StoredFiles`.
  - Enforces 5MB file size limit and strict image MIME/magic-byte validation (`.jpg`, `.jpeg`, `.png`, `.webp`).
- **Authenticated Media Retrieval:**
  - Standard HTML `<img>` and raw `<Avatar src="...">` tags omit Authorization Bearer headers and fail with 401 Unauthorized against protected APIs.
  - Components must use the `useAuthenticatedPhotoUrl(photoId)` hook to fetch binary blobs with Bearer headers and create temporary `blob:` URLs with automatic cache eviction.
- **Live Reactive Synchronization:**
  - Successful photo upload or removal must immediately update the Redux `auth` slice (`updateUserProfile({ profilePhoto })`).
  - Photo changes must reflect immediately across the Header profile avatar, Sidebar footer account avatar, Profile dropdown, and Profile page banner without a page refresh.
- **Transactional Safety & Two-Phase Replacement:**
  - When replacing a photo, update `Employee.ProfilePhoto` and insert the new `StoredFiles` record within the database transaction.
  - Physical deletion of the old image file must occur strictly post-commit to guarantee zero file loss if database persistence fails.

---

## 7. Centralized UI Preferences Persistence

- **Versioned Key Schema:**
  - UI settings must be persisted in `localStorage` under the single versioned key `nasaq.ui.preferences.v1`.
  - Structure:
    ```json
    {
      "version": 1,
      "activeDir": "rtl" | "ltr",
      "activeMode": "light" | "dark",
      "activeTheme": "BLUE_THEME",
      "activeLayout": "vertical" | "horizontal",
      "isCardShadow": true,
      "isBorderRadius": 7,
      "isCollapse": false
    }
    ```
- **SSR-Safety & Deterministic Hydration:**
  - Read from `localStorage` only after mounting (`useEffect` or client-side check) to prevent Next.js hydration mismatches.
  - Fall back safely to default preferences (`activeDir: "rtl"`, `activeMode: "light"`, `activeTheme: "BLUE_THEME"`, `isBorderRadius: 7`).
- **Reactive Multi-Tab Synchronization:**
  - Listen for the `storage` event to synchronize UI preferences across browser tabs in real time.
- **Legacy Migration:**
  - Automatically migrate legacy standalone keys (`corestarter_dir`, `corestarter_mode`) into the unified preference object on startup.

---

## 8. Platform-Wide RTL Spacing, Icon Alignment & UI Consistency Standards

- **RULE UI-025 (CSS Logical Properties & Stylis Double-Flip Prohibition):**
  - All directional layouts, margins, paddings, borders, and absolute positions must use CSS Logical Properties (`insetInlineEnd`, `insetInlineStart`, `marginInlineStart`, `marginInlineEnd`, `paddingInlineStart`, `paddingInlineEnd`, `borderInlineStart`, `textAlign: 'start' | 'end'`).
  - Prohibit manual direction ternaries like `isRtl ? { left: X, right: 'auto' } : { right: X, left: 'auto' }` or `isRtl ? 'left' : 'right'` on CSS positional or margin properties because `stylis-plugin-rtl` flips physical properties a second time, reversing their intended direction in RTL.
- **RULE UI-026 (Global Flex Gap Architecture & Adjacent Control Spacing):**
  - Adjacent buttons, toolbar icon buttons, switcher clusters, and dialog action groups must use modern CSS Flexbox `gap` instead of adjacent sibling margins.
  - MUI `Stack` must default to `useFlexGap: true` in `Components.tsx` to prevent adjacent sibling margin crowding.
  - Dialog action button rows (`MuiDialogActions`) must enforce `gap: "12px"` and explicitly clear sibling margin selectors (`"& > :not(style) ~ :not(style)": { margin: "0 !important" }`).
  - Toolbar icon buttons and action groups must maintain a minimum 10-12px (`gap: 1.25` to `gap: 1.5`) breathing space.
- **RULE UI-027 (Icon-to-Text Spacing & Adornment Alignment):**
  - Buttons (`MuiButton`), alert banners (`MuiAlert`), and list items (`NavItem`) must maintain a clean 8px (`gap: "8px"` or `marginInlineEnd: "8px"`) separation between icons and adjacent text labels.
  - Input adornments (`.MuiInputAdornment-positionStart`, `.MuiInputAdornment-positionEnd`) must use `marginInlineEnd: "8px !important"` and `marginInlineStart: "8px !important"` respectively without manual `[dir='rtl']` overrides that get double-flipped.
- **RULE UI-028 (Notification Toast & Overlay Direction Standard):**
  - Floating toast containers (`NotificationProvider`) must use logical positioning `insetInlineEnd: { xs: 16, sm: 24 }`, ensuring toasts appear at the inline-end (top-right in LTR, top-left in RTL).
  - Toasts (`NotificationToast`) must use `borderInlineStart: 4px solid ...` for the accent severity border, `<Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>` for layout, `textAlign: 'start'`, and clean non-negative margin close button styling.
- **RULE UI-029 (Modernize Design Fidelity & Palette Architecture):**
  - Dark Mode palettes must preserve the authentic Modernize token hierarchy (`BLUE_THEME` background: `default: '#2A3447'`, `paper: '#2A3447'`, `dark: '#2A3547'`; `baseDarkTheme`: `background: '#171c23'`). Never inject arbitrary pitch-black (`#14181f`) or mismatched dark gray overrides into core layout surfaces (Drawer, Header, Cards, Breadcrumb).
  - Sidebar and Mobile Drawer must inherit `theme.palette.background.paper` and `theme.palette.divider` for borders.
  - Active navigation items (`NavItem`) must use authentic Modernize flat design: `backgroundColor: theme.palette.primary.main`, `color: 'white'`, `marginBottom: '2px'`, with `boxShadow: 'none'` (zero glowing heavy neon drop shadows). Unselected items must use `theme.palette.text.secondary`, with hover state `backgroundColor: theme.palette.primary.light` and `color: theme.palette.primary.main`.
  - Sidebar account profile footer (`Profile.tsx`) must use authentic Modernize container proportions: `m: 2.5, p: 1.5, borderRadius: isBorderRadius || 8`, `bgcolor: 'secondary.light'` (`#1C455D` in Dark Mode, `#E8F7FF` in Light Mode), with safe text container truncation (`minWidth: 0, flex: 1`) and `marginInlineStart: 'auto'` on the power button to prevent name overflow across languages.
- **RULE UI-030 (Operational Dashboard Presentation & Anti-Placeholder Policy):**
  - The root dashboard (`DashboardView.tsx`) must represent a genuine, localized NASAQ workforce management operational shell.
  - Strictly prohibit generic starter-template architecture placeholders (e.g. "CoreStarter Template Foundation", "Backend Core .NET 10", "Frontend Shell Next.js 16", "SignalR Hub Connected") and fake or un-isolated financial/attendance mock data.
  - The dashboard must provide a localized Welcome Banner with the authenticated user's name, role chips, and current system date; responsive Quick Access cards linking to real active routes (`/employees`, `/locations`, `/profile`, `/notifications`); genuine system security & status KPIs; and operational platform guidelines with complete bilingual parity (`ar.json` and `en.json`).
- **RULE UI-031 (Global Required Field Asterisk Standard):**
  - Every required field indicator (`*`) must globally render in `theme.palette.error.main` across all forms, dialogs, drawers, and labels in both Light and Dark modes.
  - Configured globally via `MuiCssBaseline`, `MuiFormLabel.styleOverrides.asterisk`, `MuiInputLabel.styleOverrides.asterisk`, and `CustomFormLabel` (`& .asterisk, & span.asterisk: { color: error.main !important }`).
  - Prohibit white, gray, or neutral unstyled asterisks across all existing and future business modules.
- **RULE UI-032 (Semantic Close Button Danger Styling vs. Neutral Cancel Standard):**
  - Dedicated Close buttons (`IconX`, "Close" / "إغلاق") must use danger styling: icon buttons use `color: 'error.main'`, subtle background hover `bgcolor: alpha(error.main, 0.08)`, and accessible touch target (`32-36px`); text Close buttons use `variant="outlined" color="error"`.
  - Shared `DialogCloseButton` component (`@/shared/components/buttons/DialogCloseButton`) must be used for modal dialog headers, drawers, and inspect panels.
  - Strict semantic distinction from neutral Cancel actions: Cancel buttons in forms and confirm dialogs represent aborting an operation without changes and MUST use neutral secondary styling (`variant="outlined" color="inherit"`). They must never be colored red. Red is strictly reserved for destructive execution (e.g. Delete, Terminate) or closing/dismissing dialogs.
- **RULE UI-033 (Calendar Date-Only Integrity & Timezone Shift Prevention):**
  - Date-only domain properties (such as `HireDate`, `DateOfBirth`) represent calendar dates without time components.
  - Prohibit raw `toISOString().split('T')[0]` or uncalibrated `new Date(val).toLocaleDateString()`, which cause off-by-one day discrepancies across timezones (e.g. UTC+3 displaying 2024-05-14 instead of 2024-05-15, or vice-versa).
  - Use `toDateInputValue(value)` from `@/shared/utils/i18nFormatters` for all HTML `<input type="date">` / form bindings.
  - Use `formatDateOnly(value, locale)` from `@/shared/utils/i18nFormatters` for tables, cards, and details dialogs.
  - For timestamps with time, use `formatDateTime(value, locale)` ensuring localized date and time without raw English AM/PM tokens in Arabic RTL.
- **RULE UI-034 (Shared Expandable Table Details & LTR Isolation Architecture):**
  - Expandable row details across Modernize data tables (Employees, Work Locations, etc.) must use a consistent multi-card grid layout with:
    1. Modernize icon badge (`36x36px` to `40x40px`, soft alpha palette background, themed color).
    2. Localized label (`caption` variant, `text.secondary`).
    3. Strong value typography (`body2` or `subtitle2` with `fontWeight: 600`).
    4. Strict LTR isolation (`direction: 'ltr'`, `unicodeBidi: 'isolate'`) for phone numbers, international dials, and GPS coordinates (`formatCoordinates(lat, lng)`).
    5. Localized numeric values with Arabic grammatical pluralization (via `formatPluralNumber`).
    6. Standardized action buttons (`View Details`, `Edit`) aligned at the end of the details panel.
- **RULE UI-035 (Authenticated Profile Photo & Avatar Architecture):**
  - **Prohibition of Raw API URLs in Avatars:** Unauthenticated download URLs (`Router.Files.Download(...)`) must NEVER be passed directly to `<Avatar src="...">` or HTML `<img>` elements. Browser native image loaders do not attach the JWT `Authorization: Bearer <token>` header, resulting in `401 Unauthorized` responses and silent fallback to broken initial states.
  - **Shared Component Mandate:** All profile photos and employee avatars across the application must consume the enterprise `<ProfilePhotoAvatar>` component (`@/shared/components/avatar`).
  - **Capabilities:** Standardizes authenticated blob fetching via `useAuthenticatedPhotoUrl`, in-flight request deduplication across parallel mounted components (Header, Sidebar, Dropdown, Table cells), blob cache seeding on local file upload previews (`src` prop), and graceful Modernize-styled initials/icon fallbacks.
  - **Event-Driven Cache Synchronization:** When a photo is uploaded, replaced, or removed (or an employee record deleted), handlers must invoke `broadcastPhotoInvalidation(photoId)` to dispatch a synchronized cross-component cache clearance across all active views without requiring a page reload.
  - **Auth Redux Synchronization:** When an authenticated user updates their own employee profile photo, `dispatch(updateUserProfile({ profilePhoto: ... }))` must be called to update the global user state across the application shell immediately.
  - **Post-Commit Lifecycle:** Server-side physical deletion of replaced or removed photo files must occur strictly after the database transaction has committed successfully.
- **RULE UI-036 (Canonical Dialog Architecture & Viewport Clipping Prevention):**
  - **Prohibition of Intermediate `<form>` Containers:** Never nest an intermediate `<form style={{ display: 'flex', flexDirection: 'column' }}>` directly inside MUI `<Dialog>`. In CSS Flexbox, unconstrained intermediate form wrappers calculate to intrinsic content height (~850px+), expanding the dialog paper beyond the browser viewport and pushing `<DialogActions>` off the bottom of the screen on scaled laptop displays (125%/150%).
  - **PaperProps Form Pattern:** All form-driven dialogs must configure the MUI Paper element as the form component:
    ```tsx
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm" // or md
      fullWidth
      PaperProps={{
        component: "form",
        onSubmit: handleSubmit,
        sx: {
          maxHeight: "calc(100vh - 96px)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        },
      }}
    >
    ```
  - **Flex Layout Hierarchy:**
    - `<DialogTitle>`: `flexShrink: 0`, `p: 2.5` with dedicated close button (`DialogCloseButton`).
    - `<DialogContent dividers>`: `flex: "1 1 auto"`, `overflowY: "auto"`, `minHeight: 0`, `p: 3`. All form controls reside here.
    - `<DialogActions>`: `flexShrink: 0`, `flex: "0 0 auto"`, `borderTop: 1`, `borderColor: "divider"`, `px: 3`, `py: 2`, `gap: 1.5`.
  - **Guaranteed Button Visibility:** This structure guarantees that `DialogContent` scrolls smoothly when form fields exceed available screen height, while `DialogActions` (Cancel / Submit) remains permanently pinned, fully visible, and accessible at the bottom of the dialog.
