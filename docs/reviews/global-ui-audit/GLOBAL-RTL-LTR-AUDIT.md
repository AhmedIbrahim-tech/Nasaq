# NASAQ — Global RTL/LTR Layout & Direction Audit Report

**Document Reference:** `docs/reviews/global-ui-audit/GLOBAL-RTL-LTR-AUDIT.md`  
**Audit Scope:** Platform-wide layout direction, bidirectional text isolation, popover anchoring, and expandable rows  
**Status:** VERIFIED CLOSED  
**Date:** November 21, 2026  

---

## 1. Executive Summary

A comprehensive platform-wide audit was conducted across all 11 functional modules and shared layouts of NASAQ. The audit inspected CSS flex directions, grid item orderings, menu and popover anchor points, bidirectional text isolation, date/time formatting, and numeric display safety in both Arabic (RTL) and English (LTR).

---

## 2. Platform-Wide Route Direction Audit Results

| Route | View Component | Arabic RTL Evaluation | English LTR Evaluation | Direction-Safe Exception Fields | Audit Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/` | `DashboardView.tsx` | Clean right-to-left cards, KPI stats, charts mirror properly | Standard left-to-right flow | Metric counts isolated | **VERIFIED CLOSED** |
| `/login` | `SideLoginView.tsx` | Brand panel, form alignment, input icons anchored correctly | Left-anchored standard Modernize login | Email / username LTR isolated | **VERIFIED CLOSED** |
| `/employees` | `EmployeeListView.tsx` *(Ref 1)* | Authoritative RTL reference: stats, toolbar, table, action menus | Standard LTR reference | Employee codes, phone numbers, hire dates isolated | **VERIFIED CLOSED** |
| `/locations` | `LocationListView.tsx` *(Ref 2)* | Authoritative RTL reference: coordinates isolated via `unicodeBidi: "isolate"` | Standard LTR reference | GPS coordinates: `formatCoordinates` isolated | **VERIFIED CLOSED** |
| `/schedules` | `SchedulesView.tsx` | Tabs, stats, 3 data tables, action menus, dialogs respect RTL | Standard LTR structure | Shift duration numbers, times (AM/PM vs ص/م) | **VERIFIED CLOSED** |
| `/attendance` | `AttendanceView.tsx` | Terminals, status cards, history table, and upgraded expanded details respect RTL | Standard LTR structure | Distances (`formatDistance`), coordinates | **VERIFIED CLOSED** |
| `/points` | `PointsView.tsx` | Summary KPI cards, points ledger, rules table, and upgraded expanded details respect RTL | Standard LTR structure | Point values (`+1`, `-2`), timestamp UTC | **VERIFIED CLOSED** |
| `/leaves` | `LeavesView.tsx` | Stats, tabs, request dialog with `renderValue` gap, details dialog respect RTL | Standard LTR structure | Date ranges, document file links | **VERIFIED CLOSED** |
| `/admin-operations` | `AdminOperationsView.tsx` | Tabs with badges, toolbar action spacing, table, and expanded details respect RTL | Standard LTR structure | Lat/Lng, device distance, device accuracy | **VERIFIED CLOSED** |
| `/reports` | `ReportsView.tsx` | Filter panel, summary KPIs, dynamic columns, CSV export buttons respect RTL | Standard LTR structure | Aggregated counts, hours, percentages | **VERIFIED CLOSED** |
| `/notifications` | `NotificationsCenterView.tsx` | Notification cards, unread badges, filter chips, delete/read actions respect RTL | Standard LTR structure | Relative timestamps | **VERIFIED CLOSED** |
| `/profile` | `ProfileView.tsx` | Profile header, tab panels, photo remove confirm, change password respect RTL | Standard LTR structure | Employee code, email, dates | **VERIFIED CLOSED** |

---

## 3. Popover, Menu & Dropdown Anchoring Corrections

### 3.1 Header Notifications Dropdown (`Notification.tsx`)
- **Defect:** Hardcoded `anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}` caused the notification menu to open towards the physical right in Arabic RTL, overflowing the screen edge.
- **Correction:** Dynamically bound to `horizontal: isRtl ? 'left' : 'right'`.
- **Outcome:** Menu opens gracefully aligned to the notification bell icon in both RTL and LTR.

### 3.2 Shared Table Column Visibility Menu (`DataTableToolbar.tsx`)
- **Defect:** Hardcoded `horizontal: 'right'` in `anchorOrigin` and `transformOrigin`.
- **Correction:** Updated to `horizontal: isRtl ? 'left' : 'right'`.
- **Outcome:** Clean popover alignment across all consuming tables.

### 3.3 Data Table Action Menus (`ModernizeDataTable.tsx`)
- **Inspection:** Verified that lines 561-562 already utilize `anchorOrigin={{ vertical: "bottom", horizontal: isRtl ? "left" : "right" }}` and `transformOrigin={{ vertical: "top", horizontal: isRtl ? "left" : "right" }}`. Menu opens inward towards the table center without viewport clipping.

---

## 4. Expandable Details Rows (RTL vs LTR)

All 5 expandable tables across NASAQ now strictly adhere to the approved Modernize bidirectional standard:
1. `EmployeeListView.tsx`: Quick details header + 4-card grid (`xs: 12, sm: 6, md: 3`).
2. `LocationListView.tsx`: Quick details header + 4-card grid (`xs: 12, sm: 6, md: 3`).
3. `DailyAttendanceTable.tsx`: Quick details header + 4-card grid + isolated GPS coordinates + friendly failure alert box.
4. `AttendanceHistoryTable.tsx`: Upgraded from legacy text stacks to 4 colorful icon cards with border and border-radius 12px.
5. `PointsLedgerTable.tsx`: Upgraded from plain gray box to 4 colorful icon cards with internal GUID masking and locale-aware timestamp formatting.

---

## 5. Bidirectional Text Isolation Standards

The following elements are explicitly isolated using CSS `unicodeBidi: "isolate"` and `direction: "ltr"`:
- **GPS Coordinates:** `formatCoordinates(lat, lng)`
- **Employee Codes:** `EMP-001`, `EMP-SUPER01`
- **Phone Numbers:** `+966 50 123 4567`
- **Timestamps:** `formatDateTime(date, isRtl)`
- **Table Pagination Count:** `<span style={{ direction: "ltr", display: "inline-block" }}>`
