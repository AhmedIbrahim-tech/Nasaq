# NASAQ — Global UI Issues & Defect Remediation Matrix

**Document Reference:** `docs/reviews/global-ui-audit/GLOBAL-UI-ISSUES-MATRIX.md`  
**Audit Scope:** Entire NASAQ Platform (`frontend/src/`)  
**Status:** VERIFIED CLOSED  
**Date:** November 21, 2026  

---

## 1. Executive Summary

This matrix documents every discovered UI consistency, spacing, RTL/LTR layout, and dialog defect across the entire NASAQ frontend platform. Every issue is tracked from root cause to physical file correction, affected consumer routes, and regression testing evidence.

---

## 2. Issues Remediation Matrix

| Issue ID | Screen / Route | Component | Original Defect | Root Cause | Severity | Files Modified | Classification | Status | Verification Evidence |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **ISSUE-DEL-01** | `/schedules` | Work Shift / Schedule Delete Dialog | Dialog displayed raw untranslated keys `ConfirmAction` and `ConfirmDeleteScheduleMessage` when deleting a Shift | Missing translation keys in `ar.json`/`en.json`, and single fallback in `SchedulesView.tsx` where deleting a Shift called Schedule message | **P0 (Critical)** | `frontend/src/i18n/messages/ar.json`<br>`frontend/src/i18n/messages/en.json`<br>`frontend/src/modules/schedules/views/SchedulesView.tsx` | Local & i18n | **VERIFIED CLOSED** | `validate:i18n` 3181 keys valid; Shift dialog shows localized question and shift-specific message with double-click protection |
| **ISSUE-DEL-02** | `/schedules` | Schedule Assignment Cancel Dialog | Missing assignment-specific cancel title and message | Dialog defaulted to schedule deletion message | **P1 (High)** | `frontend/src/i18n/messages/ar.json`<br>`frontend/src/i18n/messages/en.json`<br>`frontend/src/modules/schedules/views/SchedulesView.tsx` | Local & i18n | **VERIFIED CLOSED** | Assignment cancellation uses `DeleteAssignmentQuestion` ("إلغاء تعيين الجدول؟") and `ConfirmDeleteAssignmentMessage` |
| **ISSUE-RTL-01** | All Routes | App Header Notifications Menu | Notifications popover opened towards the physical right in Arabic RTL, anchoring incorrectly | Hardcoded `anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}` without `isRtl` check | **P0 (Critical)** | `frontend/src/shared/layouts/dashboard/vertical/header/Notification.tsx` | Shared Layout | **VERIFIED CLOSED** | Updated to `horizontal: isRtl ? 'left' : 'right'`; opens with correct direction-aware anchor |
| **ISSUE-RTL-02** | Shared Tables | `DataTableToolbar` Column Menu | Column toggle menu anchored to physical right in RTL | Hardcoded `horizontal: 'right'` in `anchorOrigin` and `transformOrigin` | **P1 (High)** | `frontend/src/shared/components/tables/DataTableToolbar.tsx` | Shared Component | **VERIFIED CLOSED** | Added `useTheme()` and `horizontal: isRtl ? 'left' : 'right'` |
| **ISSUE-SPC-01** | `/admin-operations` | `ModernizeTableToolbar` | Adjacent toolbar action buttons (Reset, Refresh, Filter, Search) appeared cramped and touching | Tooltip disabled wrapper used bare `<span>` which collapses in Flexbox; table container lacked vertical spacing | **P0 (Critical)** | `frontend/src/shared/components/tables/modernize/ModernizeTableToolbar.tsx`<br>`frontend/src/modules/admin-operations/components/DailyAttendanceTable.tsx` | Shared & Local | **VERIFIED CLOSED** | Replaced `<span>` with `<Box component="span" sx={{ display: "inline-flex" }}>`; wrapped table root in `<Stack spacing={2.5}>` |
| **ISSUE-SPC-02** | `/admin-operations` | `GpsExceptionQueueTable` & `IncompleteAttendanceTable` | Toolbar collided directly with table header | Direct `<Box>` wrapper without vertical flex gap | **P1 (High)** | `frontend/src/modules/admin-operations/components/GpsExceptionQueueTable.tsx`<br>`frontend/src/modules/admin-operations/components/IncompleteAttendanceTable.tsx` | Local Tables | **VERIFIED CLOSED** | Wrapped in `<Stack spacing={2.5}>` ensuring standard 20px gap |
| **ISSUE-EXP-01** | `/admin-operations` | `DailyAttendanceTable` Expanded Details | Expanded details had no Quick Details header; GPS coordinates lacked bidirectional isolation; raw failure strings | Missing header stack with avatar; missing `unicodeBidi: "isolate"` on coordinates | **P0 (Critical)** | `frontend/src/modules/admin-operations/components/DailyAttendanceTable.tsx` | Local Table | **VERIFIED CLOSED** | Added Quick Details header stack with `ProfilePhotoAvatar`, employee code, status chip, monospace isolated GPS coordinates, and friendly alert box |
| **ISSUE-EXP-02** | `/attendance` | `AttendanceHistoryTable` Expanded Details | Expanded row used plain `bgcolor: "action.hover"` and unstyled text stacks | Legacy plain layout instead of modern Modernize 4-card grid | **P1 (High)** | `frontend/src/modules/attendance/components/AttendanceHistoryTable.tsx` | Local Table | **VERIFIED CLOSED** | Upgraded to 4 colorful icon cards (`IconMapPin`, `IconClock`, `IconDeviceLaptop`, `IconFileDescription`) with border and border-radius 12px |
| **ISSUE-EXP-03** | `/points` | `PointsLedgerTable` Expanded Details | Expanded row exposed raw internal GUIDs (`tx.id`, `tx.sourceEventId`, `tx.relatedTransactionId`) and unformatted dates | Exposing internal entity identifiers directly in UI (violates RULE UI-028) | **P0 (Critical)** | `frontend/src/modules/points/components/PointsLedgerTable.tsx` | Local Table | **VERIFIED CLOSED** | Masked/removed internal GUIDs, modernized to 4 colorful icon cards, and formatted timestamps via `formatDateTime(tx.timestampUtc, isRtl)` |
| **ISSUE-FMT-01** | `/employees` | `EmployeeDetailsDialog` Audit Dates | Audit timestamps rendered with raw `.toLocaleString()`, causing Arabic text scrambling | Unisolated browser locale string | **P1 (High)** | `frontend/src/modules/employees/components/EmployeeDetailsDialog.tsx` | Local Dialog | **VERIFIED CLOSED** | Replaced with `formatDateTime(date, isRtl)` with `unicodeBidi: "isolate"` |
| **ISSUE-FMT-02** | `/leaves` | `LeaveRequestDetailsDialog` Review Timestamps | Review timestamp rendered with unisolated `.toLocaleString()` | Missing direction-aware date formatting | **P1 (High)** | `frontend/src/modules/leaves/components/LeaveRequestDetailsDialog.tsx` | Local Dialog | **VERIFIED CLOSED** | Replaced with `formatDateTime(date, isAr)` with `unicodeBidi: "isolate"` |
| **ISSUE-DLG-01** | `/leaves` | `LeaveTypeFormDialog` | Header lacked danger close (X) button | Inconsistent header layout | **P1 (High)** | `frontend/src/modules/leaves/components/LeaveTypeFormDialog.tsx` | Local Dialog | **VERIFIED CLOSED** | Added standard danger close `<IconButton>` matching `LeaveRequestFormDialog` |
| **ISSUE-DLG-02** | `/profile` | `ChangePasswordDialog` | Required fields lacked explicit theme red asterisk | Relied on default MUI unstyled asterisk | **P2 (Medium)** | `frontend/src/modules/core/profile/components/ChangePasswordDialog.tsx` | Local Dialog | **VERIFIED CLOSED** | Added explicit red asterisks `<span style={{ color: 'var(--mui-palette-error-main, #d32f2f)' }}> *</span>` |

---

## 3. Regression Safeguards & Quality Metrics

1. **Reference Pages Untouched:**
   - Employees Management (`EmployeeListView.tsx`) remains authoritative baseline.
   - Work Locations Management (`LocationListView.tsx`) remains authoritative baseline.
2. **Translation Key Integrity:**
   - Total keys in `ar.json` & `en.json`: **3,181 keys** (100% symmetrical, 0 missing).
3. **TypeScript & Static Generation:**
   - Next.js 16 build passed with 20/20 routes statically prerendered without compilation errors.
4. **Backend Test Suite:**
   - 74/74 unit and integration tests PASS.
