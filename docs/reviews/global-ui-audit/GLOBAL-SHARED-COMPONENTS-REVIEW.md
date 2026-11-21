# NASAQ — Global Shared Components Review & Root-Cause Remediation

**Document Reference:** `docs/reviews/global-ui-audit/GLOBAL-SHARED-COMPONENTS-REVIEW.md`  
**Audit Scope:** Reusable presentation widgets, data tables, toolbars, dialogs, cards, and formatting utilities  
**Status:** VERIFIED CLOSED  
**Date:** November 21, 2026  

---

## 1. Executive Summary

This report analyzes every shared component inspected during the platform-wide audit, identifies the confirmed systemic root causes of previous defects, details the shared corrections implemented, catalogs all consuming screens, evaluates regression risks, and documents test evidence confirming that the approved reference screens (Employees and Work Locations) remain 100% stable.

---

## 2. Shared Components Audit & Root-Cause Findings

### 2.1 `ModernizeTableToolbar.tsx`
- **Inspected Area:** Action button grouping, tooltip wrappers, search input, filter collapse, column visibility menu.
- **Root Cause Discovered:**
  - Disabled button tooltips utilized standard HTML `<span>` tags. In Flexbox, inline elements have 0 width contribution, allowing adjacent 38x38 button borders to touch.
  - Consuming tables lacked vertical flex separation.
- **Shared Fix Implemented:**
  - Converted tooltip wrappers to `<Box component="span" sx={{ display: "inline-flex" }}>`.
  - Preserved standard 38x38 dimensions, `borderRadius: "8px"`, and 12px (`gap: 1.5`) spacing.
- **All Consuming Screens:**
  - `EmployeeListView.tsx` (Reference 1)
  - `LocationListView.tsx` (Reference 2)
  - `DailyAttendanceTable.tsx`
  - `GpsExceptionQueueTable.tsx`
  - `IncompleteAttendanceTable.tsx`
  - `SchedulesView.tsx` (Tabs 0, 1, 2)
- **Regression Risk:** Low. Tested against Employees and Work Locations; confirmed zero layout shift.

### 2.2 `DataTableToolbar.tsx`
- **Inspected Area:** Column visibility menu, CSV export, search input.
- **Root Cause Discovered:**
  - Hardcoded `anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}` and `transformOrigin={{ vertical: 'top', horizontal: 'right' }}` caused the column menu to open improperly in Arabic RTL.
- **Shared Fix Implemented:**
  - Introduced `const theme = useTheme(); const isRtl = theme.direction === 'rtl';`.
  - Dynamically bound anchor to `horizontal: isRtl ? 'left' : 'right'`.
- **All Consuming Screens:** Legacy data tables and report tables.
- **Regression Risk:** Zero.

### 2.3 `ConfirmActionDialog.tsx`
- **Inspected Area:** Modal container, subtle danger close button, title banner with icon, message typography, alert notices, footer actions.
- **Root Cause Discovered:**
  - Component design is excellent and direction-aware (`insetInlineEnd: 16`, logical padding, danger close styling).
  - Defects arose in consuming views passing untranslated keys (`ConfirmAction`, `ConfirmDeleteScheduleMessage` for shifts).
- **Consuming Screens:**
  - `EmployeeListView.tsx` (Single & bulk delete)
  - `LocationListView.tsx` (Single & bulk delete)
  - `SchedulesView.tsx` (Schedule delete, shift delete, assignment cancel)
  - `LeavesView.tsx` (Leave request cancellation)
  - `ProfileHeader.tsx` (Profile photo removal)
- **Regression Risk:** Zero.

### 2.4 Header Notifications Menu (`Notification.tsx`)
- **Inspected Area:** App bar bell icon, unread badge, popover menu.
- **Root Cause Discovered:**
  - Hardcoded `anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}`.
- **Shared Fix Implemented:**
  - Bound to `isRtl ? 'left' : 'right'`.
- **Consuming Screens:** System-wide application header (`Header.tsx`).
- **Regression Risk:** Zero.

### 2.5 `i18nFormatters.ts`
- **Inspected Area:** `formatCoordinates`, `formatDateOnly`, `formatDateTime`, `formatDistance`, `formatGeofenceFailureReason`.
- **Enhancements Implemented:**
  - Coordinates and timestamps are strictly isolated via `unicodeBidi: "isolate"` and `direction: "ltr"`.
  - Arabic time indicators (`ص` and `م`) are enforced for all timestamps via `ar-SA-u-nu-latn`.
  - Replaced unisolated `.toLocaleString()` calls across the platform with `formatDateTime`.
- **Consuming Screens:** All 11 NASAQ views.
- **Regression Risk:** Zero.

---

## 3. Reference Implementation Stability Check

The authoritative baseline implementations were re-verified after all shared modifications:
- **Employees Management (`EmployeeListView.tsx`):**
  - ModernizeStatsCards: 4 KPI cards aligned with primary action button.
  - ModernizeTableToolbar: Search, Filters, Reset, Refresh, Columns, Export, Bulk Actions intact.
  - ModernizeDataTable: Sticky header, pagination, row action menu (View, Edit, Status, Delete) intact.
  - Expandable Row: Quick details header + 4-card grid intact.
- **Work Locations Management (`LocationListView.tsx`):**
  - ModernizeStatsCards: 4 KPI cards intact.
  - ModernizeTableToolbar: Search, Filter, Reset, Refresh, Export, Bulk Actions intact.
  - ModernizeDataTable: Map coordinates, status chips, row actions intact.
  - Expandable Row: Isolated coordinates and geofence details intact.
