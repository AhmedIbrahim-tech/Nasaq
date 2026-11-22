# NASAQ — Global Shared Direction Components & Infrastructure Review

**Project:** `D:\Projects\NASAQ`  
**Review Type:** Architecture, Shared Components, Theme Direction & Bidirectional Infrastructure  
**Authoritative References:** Employees Management (`EmployeeListView.tsx`) & Work Locations Management (`LocationListView.tsx`)

---

## 1. Application Direction Architecture Overview

NASAQ employs a unified, multi-tiered direction architecture ensuring bidirectional (Arabic RTL / English LTR) consistency across the entire client:

```text
[CustomizerContext] ──► Centralized localStorage (`nasaq.ui.preferences.v1`)
        │
        ├──► `document.documentElement.setAttribute('dir', activeDir)`
        ├──► `document.documentElement.setAttribute('lang', isLanguage)`
        ├──► `document.dir = activeDir`
        │
        ▼
[NextIntlClientProvider] (locale: 'ar' | 'en')
        │
        ▼
[AppRouterCacheProvider]
  options: {
    key: isRtl ? 'muirtl' : 'muiltr',
    stylisPlugins: isRtl ? [prefixer, rtlPlugin] : [],
    enableCssLayer: true,
  }
        │
        ▼
[ThemeProvider] (theme.direction: 'rtl' | 'ltr')
        │
        ▼
[MUI Components & Shared Data Tables / Dialogs / Cards]
```

### Key Architectural Tenets:
1. **Dynamic Emotion Cache Keying:** `AppRouterCacheProvider` uses `key={activeDir}`, forcing a clean CSS stylesheet mount when switching between Arabic and English, preventing stale flipped styles.
2. **Stylis RTL Plugin:** Dynamically loaded only when `isRtl === true`, automatically reversing standard CSS margins, paddings, and flex layouts without manual double-flipping.
3. **DOM & Accessibility Synchronization:** Both `document.documentElement.dir` and `document.dir` are kept synchronized with `preferences.activeDir`.

---

## 2. Shared Components Inspected & Corrected

### 2.1 `ModernizeDataTable` & `ModernizeTableToolbar`
- **Location:** `src/shared/components/tables/modernize/`
- **Direction Handling:**
  - Column alignment defaults to `isRtl ? "right" : "left"`.
  - Checkbox selection and row expansion indicators adhere to table grid hierarchy.
  - Action menu button is anchored to `isRtl ? "left" : "right"`, opening dropdowns towards the inner table viewport (`anchorOrigin: { horizontal: isRtl ? "left" : "right" }`).
  - Pagination bar (`TablePagination`) explicitly isolates page count tokens from RTL reversal.
  - Toolbar buttons maintain 12px adjacent spacing (`gap: 1.5`), with search inputs and filter badges direction-aware.

### 2.2 `i18nFormatters.ts` — Centralized Date & Number Formatters
- **Location:** `src/shared/utils/i18nFormatters.ts`
- **Root Cause Discovered:**
  - Standard `Intl.DateTimeFormat('ar-SA-u-nu-latn')` and `toLocaleDateString('ar-SA-u-nu-latn')` inject Unicode Right-to-Left Marks (`\u200f`) around slashes and punctuation.
  - When wrapped inside `direction: "ltr"` or monospace typography, the Unicode Bidirectional Algorithm (UBA) resolved slashes as RTL while numbers remained LTR, causing inverted date sequences like `212026/11/` or `2026/11/21، 2:24 ص21`.
- **Shared Correction:**
  - Sanitized `formatDateOnly`, `formatDateTime`, and `formatTimeOnly` by stripping invisible bidi marks (`.replace(/[\u200e\u200f]/g, '')`).
  - Eliminated the need for unneeded `direction: "ltr"` wrappers around date strings.
  - Guaranteed clean, robust date and timestamp output across all modules.

### 2.3 Canonical Expandable Row Architecture (`RULE UI-034`)
- **Pattern Established in:** `EmployeeListView.tsx` and `LocationListView.tsx`
- **Standard Applied Across:** `DailyAttendanceTable.tsx` and `PointsLedgerTable.tsx`
- **Standards Enforced:**
  1. Header stack with Modernize Avatar / Icon Badge, title, isolated employee code, and status chip.
  2. Multi-card Grid (12-column layout, responsive `xs: 12, sm: 6, md: 3`):
     - Soft-tinted icon box (`34x34px` or `38x38px`, `alpha(color, 0.1)`).
     - Localized caption label.
     - Strong value typography (`body2` / `subtitle2`, `fontWeight: 600`).
     - Strict inline LTR isolation (`<span style={{ direction: "ltr", unicodeBidi: "isolate" }}>`) strictly for technical numbers, coordinates, and dials.
  3. Contextual Alert Banners (e.g. Geofence exception reasons, Audit notes) spanning full width (`xs: 12`) with theme error/warning palette tokens.

### 2.4 Tab Groups & Badge Placement
- **Inspected in:** `AdminOperationsView`, `LeavesView`, `PointsView`, `SchedulesView`, `AttendanceView`, `MyProfileView`.
- **Root Cause Discovered:**
  - Wrapping tab icons directly in `<Badge>` placed the badge counter on the top-right of the icon, colliding with the tab label in RTL and violating the 8px icon spacing rule.
- **Shared Correction:**
  - Replaced icon-wrapping badges with clean `Stack` + `Chip` counters placed directly inside the `label` prop.
  - Standardized `gap: 1` (8px icon-to-label separation) across all tab groups.

---

## 3. Regression Testing & Component Consumers

| Component | Consumers Verified | Regression Risk | Verification Status |
| :--- | :--- | :--- | :--- |
| `i18nFormatters.ts` | All modules (Employees, Locations, Leaves, Points, Attendance, Admin, Reports) | Date format shift | **VERIFIED CLEAN** (Clean `DD/MM/YYYY` output) |
| `DailyAttendanceTable.tsx` | Admin Operations Daily Attendance Tab | Layout break | **VERIFIED CLEAN** (Matches reference architecture) |
| `PointsLedgerTable.tsx` | Points & Penalties Ledger Tab | Column misalignment | **VERIFIED CLEAN** (Proper RTL alignment & audit trail) |
| `AdminOperationsView.tsx` | Admin Operations module | Tab badge collision | **VERIFIED CLEAN** (Chips placed in tab labels) |
| `LeavesView.tsx` | Leave Management module | Date range inversion | **VERIFIED CLEAN** (Proper inline isolated date ranges) |
| `LeaveRequestDetailsDialog.tsx` | Leave Management dialogs | Label misalignment | **VERIFIED CLEAN** (Natural RTL reading order) |
| `AttendanceHistoryTable.tsx` | Attendance module | Code alignment | **VERIFIED CLEAN** (Aligned with headers) |
| `customizerContext.tsx` | App shell, all pages | Direction sync failure | **VERIFIED CLEAN** (Full document.dir sync) |
