# NASAQ — Frontend Hooks Architecture Refactor Report
**Priority:** P1 — Architecture Consistency & Separation of Concerns  
**Date:** November 23, 2026  
**Status:** Complete & Fully Verified  

---

## 1. Executive Summary & Architectural Paradigm

The NASAQ frontend has been systematically refactored across all business and core modules to establish a strict separation between presentation rendering and stateful application logic. Prior to this refactoring, many Views and dialog components contained embedded API calls, local error state handling, form validation orchestration, and filter state transitions directly alongside their JSX templates.

The application now strictly enforces the **5-Layer NASAQ Architecture Policy**:

| Layer | Responsibility | Allowed Elements | Prohibited Elements |
| :--- | :--- | :--- | :--- |
| **Views & Components** | UI & Visual Presentation | JSX, MUI components, layout styling, event triggers | API calls, complex state reducers, business calculations |
| **Custom Hooks** (`hooks/`) | State, Behavior & Orchestration | `useState`, `useEffect`, `useCallback`, form handlers, dialog toggles | Raw JSX layouts (except presentation icon wrappers), persistent caching |
| **Services** (`services/`) | API Communication & Transport | Axios client calls, query string formatting, typed DTO mappings | React hooks, UI components, frontend display state |
| **Utilities** (`utils/` / `lib/`) | Pure Reusable Functions | Math, date-time formatting, string sanitizers, pure transformers | React hooks, state mutations, network requests |
| **Backend API** | Authoritative Business Authority | ASP.NET Core CQRS, validation rules, transactional persistence | Client-side assumptions |

---

## 2. Granularity & Governance Principles

1. **Focused Granularity Over Monolithic Mega-Hooks:**
   - Multi-workflow modules (such as Employees, Schedules, and Leaves) avoid monolithic hooks that bundle tables, filters, and all modal forms into one massive hook. Instead, separate hooks are provided for data querying/table state, filtering/pagination, and individual form/action dialogs.
2. **Strict Module Encapsulation (`index.ts`):**
   - Each module exports its hooks via a module-level `hooks/index.ts` and top-level `index.ts`, enabling clean vertical-slice imports (e.g., `import { useEmployees, useEmployeeForm } from '@/modules/employees'`).
3. **Preservation of Bilingual Data-Entry System:**
   - All bilingual input logic—including the secondary language toggle checkbox, auto-fallbacks, and separate Arabic/English form state—remains intact and fully orchestrated within the respective form hooks (`useEmployeeForm`, `useLocationForm`, `useScheduleForm`, `useShiftForm`, `useLeaveTypeForm`).
4. **Attendance GPS Acquisition Safety Guarantee:**
   - Geolocation acquisition in `useAttendanceAction` strictly occurs **only on explicit user click** of the Check-In/Check-Out buttons. Automated background polling, automatic coordinate querying on component mount, and silent GPS triggers remain strictly prohibited.
5. **Zero UI Regressions & Visual Fidelity:**
   - Modernize UI/UX layouts, table geometry, theme tokens, color palettes, responsive cards, and RTL/LTR alignments were 100% preserved.

---

## 3. Module-by-Module Implementation Matrix

| Module | Path | Hook Name | Extracted Responsibilities | Consuming Component(s) |
| :--- | :--- | :--- | :--- | :--- |
| **Employees** | `src/modules/employees/hooks/` | `useEmployees` | Employee listing, pagination, sorting, deletion, bulk deletion orchestration | `views/EmployeeListView.tsx` |
| | | `useEmployeeFilters` | Search query, location/shift/department filter state, debouncing, reset actions | `views/EmployeeListView.tsx` |
| | | `useEmployeeForm` | Bilingual form state (AR/EN), validation, photo avatar upload/preview, submission | `components/EmployeeFormDialog.tsx` |
| **Locations** | `src/modules/locations/hooks/` | `useLocations` | Location list fetching, pagination, status toggling, deletion dialogs | `views/LocationListView.tsx` |
| | | `useLocationFilters` | Search filtering, active status filtering, reset handlers | `views/LocationListView.tsx` |
| | | `useLocationForm` | Bilingual name/address inputs, GPS coordinates, geofence radius slider, submission | `components/LocationFormDialog.tsx` |
| **Schedules & Shifts** | `src/modules/schedules/hooks/` | `useSchedules` | Schedule and Shift catalog data fetching, assignment listing, tab navigation | `views/SchedulesView.tsx` |
| | | `useScheduleFilters` | Schedule search, status filtering, reset handlers | `views/SchedulesView.tsx` |
| | | `useScheduleForm` | Schedule metadata, working days configuration, shift assignment per day | `components/ScheduleFormDialog.tsx` |
| | | `useShiftForm` | Shift name (bilingual), start/end time, grace periods, submission | `components/ShiftFormDialog.tsx` |
| | | `useAssignScheduleForm` | Employee selection, schedule selection, effective date range validation | `components/AssignScheduleDialog.tsx` |
| **Attendance** | `src/modules/attendance/hooks/` | `useAttendance` | Attendance status query, shift details, daily attendance timeline, history | `views/AttendanceView.tsx` |
| | | `useAttendanceAction` | On-demand GPS coordinates acquisition, geofence validation, check-in/out commands | `components/CheckInCard.tsx` |
| **Points & Penalties** | `src/modules/points/hooks/` | `usePoints` | Point rules, balance summary, transaction history, active tab management | `views/PointsView.tsx` |
| | | `usePointRuleForm` | Point rule creation/editing, bilingual description, point values, multipliers | `components/PointRuleFormDialog.tsx` |
| | | `useReverseTransactionForm` | Transaction reversal form, reason validation, audit logging trigger | `components/ReverseTransactionDialog.tsx` |
| **Leaves** | `src/modules/leaves/hooks/` | `useLeaves` | Leave balance, my requests, administrative review queue, leave types catalog | `views/LeavesView.tsx` |
| | | `useLeaveRequestForm` | Leave submission, date range calculation, leave balance validation, attachments | `components/LeaveRequestFormDialog.tsx` |
| | | `useLeaveReview` | Leave approval/rejection workflows, review comments, self-approval prevention | `components/LeaveReviewDialog.tsx` |
| | | `useLeaveTypeForm` | Leave type creation/editing, bilingual labels, paid status, quota limits | `components/LeaveTypeFormDialog.tsx` |
| **Admin Operations** | `src/modules/admin-operations/hooks/` | `useAdminOperations` | Operational summaries, daily attendance, GPS exception queue, incomplete records, manual point adjustment | `views/AdminOperationsView.tsx` |
| **Reports** | `src/modules/reports/hooks/` | `useReports` | Report catalog, active report selection, bilingual lookups, dynamic execution, CSV/PDF/XLSX export | `views/ReportsView.tsx` |
| **User Profile** | `src/modules/core/profile/hooks/` | `useProfile` | User identity state, auth error handling, profile refresh, tab navigation | `views/MyProfileView.tsx` |
| | | `usePersonalInfo` | Personal information editing, phone number, dirty state tracking, save | `components/PersonalInfoTab.tsx` |
| | | `useChangePassword` | Password inputs, visibility toggles, strength validation, confirmation check | `components/SecurityTab.tsx` |

---

## 4. Existing Mature Modules Audited & Aligned

The following modules already contained dedicated `hooks/` architectures and were audited to ensure full compliance:
- **Authentication (`src/modules/auth/hooks/`):**
  - `useAuthSession`: Session state, user identity, token lifecycle.
  - `useLogin`: Login form state, credentials authentication, redirect orchestration.
  - `useLogout`: Session cleanup, token invalidation, local storage clear.
  - `useSessionExpiryWarning`: Token expiry countdown, proactive refresh trigger.
- **Notifications (`src/modules/core/notifications/hooks/`):**
  - `useNotifications`: Notification center state, pagination, read/unread filters.
  - `useHeaderNotifications`: Real-time badge counter and quick-view popover list.
  - `useRealtimeNotifications`: SignalR websocket listener and toast dispatcher.
- **Dashboard (`src/modules/dashboard/hooks/`):**
  - `useDashboard`: Operational workforce metrics, attendance charts, quick stats.

---

## 5. Quality Gate Verification Results

All automated quality gates were executed against the refactored codebase:

1. **TypeScript Type Safety Check:**
   ```bash
   npm --prefix frontend exec -- tsc --noEmit --project frontend/tsconfig.json
   ```
   - **Result:** Exit code `0` (Zero compiler errors across all modules, hooks, views, and components).

2. **Internationalization (i18n) Key Validation:**
   ```bash
   npm --prefix frontend run validate:i18n
   ```
   - **Result:** Exit code `0` (All 3,341 translation keys valid in both `ar.json` and `en.json`).

3. **Next.js Production Build:**
   ```bash
   npm --prefix frontend run build
   ```
   - **Result:** Exit code `0` (Compiled successfully in 13.5s; all 18 application routes statically generated).

4. **Backend Architecture & Domain Unit Tests:**
   ```bash
   dotnet test backend/Tests/Tests.csproj
   ```
   - **Result:** Exit code `0` (Passed: 82, Failed: 0, Skipped: 0, Total: 82).

---

## 6. Verification & Governance Summary

- **Git Status:** 0 Git commits, 0 Git pushes, 0 branch modifications.
- **Database Status:** 0 database migrations, 0 database drops or schema resets.
- **Packages:** 0 external packages installed or modified.
- **UI Architecture:** All Modernize theme tokens, dialog layouts, table widths, and RTL/LTR properties remain strictly preserved.
