# NASAQ — Consolidated Integration Baseline Audit
### Comprehensive Read-Only Audit of MOD-01 through MOD-12, Business Rules, Database Migrations, Bilingual Localization & Quality Verification

> **Audit Date & Timestamp:** 21 November 2026, 04:45 AM (Local Time)  
> **Target Workspace:** `D:\Projects\NASAQ`  
> **Auditing Scope:** Full Repository, Database Schema, CQRS Features, Domain Models, DTO Contracts, Business Rules, Internationalization & Automated Tests  
> **Audit Classification:** Authoritative Integration Baseline (Strictly Read-Only)

---

## 1. Executive Summary

This consolidated integration baseline audit was conducted directly on the active repository at `D:\Projects\NASAQ`. Its purpose is to establish an unvarnished, evidence-backed inventory of the current system state across all twelve roadmap modules (**MOD-01** through **MOD-12**), identify physical presence versus missing code, detect unmerged workspaces or untracked assets, examine database migrations against the running SQL Server database (`Nasaq_Dev`), cross-examine approved business decisions against actual implementation code, map Arabic/English business data fields, and distinguish verified executed automated tests from claims made solely in earlier narrative reports.

### Key Audit Findings
1. **Physical Module Presence:** Modules **MOD-01, MOD-02, MOD-03, MOD-04, MOD-05, MOD-06, MOD-07, MOD-09, and MOD-11** are physically implemented in the main workspace across both backend (.NET 10) and frontend (Next.js 16).
2. **Missing Modules:**
   - **MOD-08 (Cash Rewards Program):** **0% physical presence**. No domain entities, no CQRS features, no controllers, no frontend views, no database tables, and no completion report exist.
   - **MOD-12 (Audit Trail & System Integrity):** **0% physical presence**. No dedicated audit trail tables, queries, API endpoints, or frontend views exist (only baseline entity audit interceptor `AuditSaveChangesInterceptor` exists).
   - **MOD-10 (Notifications Center):** **Partially present** (inherited baseline notifications architecture and UI from Phase 0), but lacks dedicated workforce event triggers and has **no formal completion report**.
3. **Workspace Isolation & Git State:** There are **zero** external git worktrees and **zero** separate isolated directories for MOD-08 or MOD-12 on drive `D:\`. All active development is located in `D:\Projects\NASAQ` on branch `main`. The working tree contains substantial uncommitted modifications across 85+ files representing active module implementations.
4. **EF Core Migrations:** Exactly **12 EF Core migrations** exist in code and all **12 are physically applied** to `Nasaq_Dev` on `(localdb)\MSSQLLocalDB`. No unapplied or conflicting migrations exist in the database history.
5. **Critical Business-Rule Discrepancies:**
   - **GPS Check-Out Exception & Loss of Green Points:** When Check-out triggers a GPS exception (`PendingReview`), `record.Status` is marked `PendingReview`. Because `PointCalculationEngine.cs` guards Shift Completion points behind `attendance.Status == AttendanceStatus.Completed`, **zero** pending completion points are recorded. When an admin later approves the GPS exception via `ApproveGpsExceptionHandler.cs`, lines 122–134 search for pending completion points (finding none) and fail to evaluate new points. **Result: The employee permanently loses their completed shift Green Points.**
   - **Approved Leave Exemption Void:** There is **zero** operational integration between MOD-07 (Leave Management) and MOD-05 (Attendance) or MOD-06 (Points). An employee on approved leave has no automatic attendance reconciliation; the attendance engine does not check `LeaveRequests`, exposing employees on approved leaves to erroneous absence penalties or missing check-out flags.
   - **Point Redemption Phantom:** While earlier completion reports claimed `PointEventType.PointsRedemption` was implemented, `PointEnums.cs` contains no such enum member, `PointTransaction` has no point-reservation mechanism, and point redemption logic is completely absent.
6. **Bilingual Business Data Localization:** Migration `20261121020849_AddBilingualBusinessDataLocalization` successfully added Arabic schema columns to `Employee`, `WorkLocation`, `WorkShift`, `WorkSchedule`, `PointRule`, and `LeaveType`. However, **DTO mapping is hardcoded to English** in `AttendanceRecordDto`, `WorkLocationDto`, and `WorkShiftDto`, preventing Arabic values from reaching the frontend attendance and monitoring screens. Furthermore, `Notes`, `ReviewNotes`, `AppNotification`, and `LeaveRequest.Reason` lack bilingual schema fields.
7. **Test Suite Verification:** Exactly **68 automated backend tests** exist in `backend/Tests` and **100% pass (68/68)**. However, narrative reports exaggerated test counts (e.g., claiming 12 distinct tests for MOD-04 where only 3 exist, and 15 tests for MOD-05 where only 6 workflow tests exist). Frontend has **zero** automated unit/e2e tests, relying entirely on static build validation (`next build --webpack`) and translation linting (`validate:i18n`).

---

## 2. Module-by-Module Physical Presence & Status Matrix

| Module ID | Module Name | Backend Scope | Frontend Scope | Database Tables | Completion Report | Actual Physical State |
|---|---|---|---|---|---|---|
| **MOD-01** | Auth, Identity & Core Setup | `AuthController`, `AuthService`, `JwtTokenService`, Identity Stores | `src/modules/auth/`, Login, Password Change | `AspNetUsers`, `AspNetRoles`, `RefreshTokens` | `MOD-01-COMPLETION-REPORT.md` (Present) | **100% COMPLETE & VERIFIED** |
| **MOD-02** | Employee Directory & Management | `EmployeesController`, CQRS Handlers, `Employee.cs` | `src/modules/employees/`, CRUD dialogs, tables | `Employees` | `MOD-02-COMPLETION-REPORT.md` (Present) | **100% COMPLETE & VERIFIED** |
| **MOD-03** | Work Locations & Geofencing | `LocationsController`, `GeofenceService`, `WorkLocation.cs` | `src/modules/locations/`, Locations table, dialogs | `WorkLocations` | `MOD-03-COMPLETION-REPORT.md` (Present) | **100% COMPLETE & VERIFIED** |
| **MOD-04** | Work Schedules & Shifts | `SchedulesController`, `ShiftsController`, `ShiftResolutionService` | `src/modules/schedules/`, shifts & schedules tables | `WorkSchedules`, `WorkShifts`, `WorkScheduleDays`, `EmployeeScheduleAssignments` | `MOD-04-COMPLETION-REPORT.md` (Present) | **100% COMPLETE & VERIFIED** |
| **MOD-05** | Attendance Engine | `AttendanceController`, `CheckInCommand`, `CheckOutCommand`, `AttendanceRecord.cs` | `src/modules/attendance/`, CheckInCard, history table | `AttendanceRecords` | `MOD-05-COMPLETION-REPORT.md` (Present) | **CORE OPERATIONAL (Bug in GPS Checkout Points)** |
| **MOD-06** | Points & Penalties Engine | `PointsController`, `PointCalculationEngine`, `PointRule.cs`, `PointTransaction.cs` | `src/modules/points/`, ledger table, summary cards | `PointRules`, `PointTransactions` | `MOD-06-COMPLETION-REPORT.md` (Present) | **COMPLETE (Missing Redemption)** |
| **MOD-07** | Leave Management & Workflows | `LeavesController`, `LeaveService`, `LeaveType.cs`, `LeaveRequest.cs`, `LeaveApprovalHistory.cs` | `src/modules/leaves/`, leaves view, request & approval dialogs | `LeaveTypes`, `LeaveRequests`, `LeaveApprovalHistories` | `MOD-07-COMPLETION-REPORT.md` (Present) | **COMPLETE (Isolated from Attendance)** |
| **MOD-08** | Cash Rewards Program | **None** (No controllers, CQRS, or entities) | **None** (No routes or components) | **None** | **MISSING** | **0% NOT IMPLEMENTED** |
| **MOD-09** | Admin Operations & Overrides | `AdminOperationsController`, daily operations, GPS approval, incomplete correction, manual points | `src/modules/admin-operations/`, daily table, GPS queue, incomplete queue, dialogs | Shares `AttendanceRecords` & `PointTransactions` | `MOD-09-COMPLETION-REPORT.md` (Present) | **100% COMPLETE & VERIFIED** |
| **MOD-10** | Notifications & Alerts Center | `NotificationsController`, `AppNotification.cs`, `NotificationService.cs` | `src/modules/core/notifications/`, NotificationCenterView | `AppNotifications` | **MISSING** | **PARTIAL (Phase-0 Legacy Only)** |
| **MOD-11** | Operational Reporting & Exports | `ReportsController`, 8 report types catalog, ClosedXML Excel, QuestPDF | `src/modules/reports/`, reports catalog, filter bar, export engine | Shares all domain entities | `MOD-11-COMPLETION-REPORT.md` (Present) | **100% COMPLETE & VERIFIED** |
| **MOD-12** | Audit Trail & System Integrity | **None** (No dedicated audit trail entities or endpoints) | **None** (No audit log UI) | **None** | **MISSING** | **0% NOT IMPLEMENTED** |

---

## 3. Workspace Isolation, Unmerged Changes & Git State

### 3.1 Git Status & Branch Inventory
- **Current Git Branch:** `main` (synchronized with `origin/main` at commit `a7682ab`).
- **Active Git Worktrees:** Exactly 1 worktree (`D:/Projects/NASAQ a7682ab [main]`).
- **External Development Directories:** No separate directories matching `*NASAQ*`, `*MOD08*`, or `*MOD12*` exist anywhere on drive `D:\`.
- **Git Commit / Push Constraint:** Fully respected. **Zero** uncommitted changes have been staged or committed.

### 3.2 Uncommitted Working Tree Analysis
The working tree contains extensive modifications and untracked files representing active development across multiple modules:
- **Modified Core Files (45 files):**
  - Architecture rules (`.agents/rules/architecture.md`, `design-system-i18n.md`, `frontend-nextjs.md`, `AGENTS.md`).
  - Controllers (`ApiControllerBase.cs`, `EmployeesController.cs`, `FilesController.cs`).
  - Shared services (`AuthService.cs`, `CurrentUser.cs`, `FileService.cs`, `FileAccessAuthorizer.cs`).
  - UnitOfWork (`IUnitOfWork.cs`, `UnitOfWork.cs`).
  - Frontend components (Auth dialogs, profile sync components, Modernize design components).
  - Localization dictionaries (`ar.json`, `en.json` — 3,164 synchronized keys).
- **Untracked Modules & Implementations (40+ directories and files):**
  - `backend/Application/Features/AdminOperations/` (MOD-09)
  - `backend/Application/Features/Attendance/` (MOD-05)
  - `backend/Application/Features/Leaves/` (MOD-07)
  - `backend/Application/Features/Points/` (MOD-06)
  - `backend/Application/Features/Reports/` (MOD-11)
  - `backend/Application/Features/Schedules/` & `Shifts/` (MOD-04)
  - `frontend/src/modules/admin-operations/`
  - `frontend/src/modules/attendance/`
  - `frontend/src/modules/leaves/`
  - `frontend/src/modules/points/`
  - `frontend/src/modules/reports/`
  - `frontend/src/modules/schedules/`
  - `backend/Infrastructure/Data/Migrations/` (6 active migration files)

---

## 4. Database Persistence & EF Core Migrations Audit

### 4.1 Migration Alignment Check
A live query of `__EFMigrationsHistory` against `(localdb)\MSSQLLocalDB` (Database: `Nasaq_Dev`) confirmed that all 12 migration files present in `backend/Infrastructure/Data/Migrations/` are physically applied:

| Order | Migration Identifier | Schema Changes Introduced | Status in Database |
|---|---|---|---|
| 1 | `20261119041536_InitialCreate` | Identity users, roles, claims, refresh tokens | **APPLIED** |
| 2 | `20261119152239_AddEmployeeManagement` | `Employees` table with code, name, department, title | **APPLIED** |
| 3 | `20261119160312_AddDirectSupervisorAssignment` | Self-referencing supervisor foreign key on `Employees` | **APPLIED** |
| 4 | `20261119173723_RemoveProfileImageColumn` | Drops inline binary photo column | **APPLIED** |
| 5 | `20261119222333_AddStoredFileMetadata` | `StoredFiles` centralized metadata table | **APPLIED** |
| 6 | `20261120010049_AddEmployeeProfilePhoto` | Foreign key reference from `Employees.ProfilePhoto` to `StoredFiles.Id` | **APPLIED** |
| 7 | `20261120154058_AddWorkLocationsAndGeofences` | `WorkLocations` table with latitude, longitude, radius | **APPLIED** |
| 8 | `20261120220751_AddWorkSchedulesAndShifts` | `WorkSchedules`, `WorkShifts`, `ScheduleDays`, `Assignments` | **APPLIED** |
| 9 | `20261120231416_AddAttendanceEngine` | `AttendanceRecords` table with GPS telemetry | **APPLIED** |
| 10 | `20261120231839_AddPointsAndPenaltiesEngine` | `PointRules` and `PointTransactions` ledger tables | **APPLIED** |
| 11 | `20261121001955_AddLeaveManagement` | `LeaveTypes`, `LeaveRequests`, `LeaveApprovalHistories` | **APPLIED** |
| 12 | `20261121020849_AddBilingualBusinessDataLocalization` | Adds `FullNameAr`, `DepartmentAr`, `JobTitleAr`, `NameAr`, `AddressAr`, `DescriptionAr` | **APPLIED** |

### 4.2 Migration Integrity Verdict
- **Unapplied Migrations:** 0
- **Conflicting Migrations:** 0
- **Missing Migrations for Existing Entities:** 0 (all current entities in `ApplicationDbContext` are fully mapped).
- **Pending Migrations Needed for Future Work:**
  - MOD-08 (Cash Rewards tables: `RewardItem`, `RewardClaim`, `RewardPayout`).
  - MOD-12 (Audit Trail tables: `AuditTrailEntry` / `SecurityLog`).
  - Additional bilingual columns for `Notes`, `ReviewNotes`, `AppNotification`, and `LeaveRequest.Reason`.

---

## 5. Critical Business-Rule Discrepancies & Architectural Gaps

### 5.1 Discrepancy 1: Loss of Completed Shift Green Points on GPS Check-Out Review
- **Governing Rule (`DEC-006` & `DEC-007`):** Geofence breaches on check-in or check-out must not block the employee; they are routed to `PendingReview`. When an administrator approves the pending record, points must be evaluated and finalized using the original server timestamp.
- **Actual Implementation Flaw:**
  1. In `CheckOutHandler.cs` (lines 153–155):
     ```csharp
     record.Status = (record.CheckInStatus == VerificationStatus.Verified && checkOutStatus == VerificationStatus.Verified)
         ? AttendanceStatus.Completed
         : AttendanceStatus.PendingReview;
     ```
     If Check-out GPS was outside the geofence, `record.Status` is `AttendanceStatus.PendingReview`.
  2. In `PointCalculationEngine.cs` (lines 88–90):
     ```csharp
     if (attendance.CheckOutTimeUtc.HasValue && attendance.Status == AttendanceStatus.Completed)
     {
         var completionRule = activeRules.FirstOrDefault(r => r.EventType == PointEventType.CompletedShift);
         // ... generates completion transaction
     }
     ```
     Because `attendance.Status` is `PendingReview`, this condition evaluates to **`false`**. No transaction is created at all—not even with `Status = PendingReview`.
  3. In `ApproveGpsExceptionHandler.cs` (lines 121–134):
     When the administrator approves the Check-out exception, it only looks for pre-existing pending transactions:
     ```csharp
     var pendingCompletionPoints = await _context.PointTransactions
         .Where(t => t.SourceEventId == record.Id &&
                     t.EventType == PointEventType.CompletedShift &&
                     t.Status == PointTransactionStatus.PendingReview)
         .ToListAsync(cancellationToken);
     ```
     Since none was created during checkout, this list is empty. Unlike `CheckIn` approval (which calls `EvaluateAttendanceEventAsync` as a fallback), `CheckOut` approval has no evaluation fallback.
- **Impact:** Any employee whose check-out requires administrative GPS review is permanently deprived of their Shift Completion Green Points upon approval.

### 5.2 Discrepancy 2: Total Disconnect Between Leave Management & Attendance/Points
- **Business Rule Expectation:** An employee on approved leave must be exempt from punctuality and absence deductions. If an employee does not check in on a day covered by an approved leave, they should be marked `ExcusedLeave` (or equivalent) rather than flagged as an unexcused absence, incomplete shift, or missing check-out.
- **Actual Implementation Flaw:**
  - `CheckInHandler.cs` and `CheckOutHandler.cs` contain **zero** queries to `LeaveRequests`.
  - An employee on approved leave can still submit a normal check-in without system recognition of their active leave status.
  - The Incomplete Attendance queue (`GetIncompleteAttendanceHandler.cs`) and Daily Attendance monitoring (`GetDailyAttendanceOperationsHandler.cs`) query solely `AttendanceRecords` and do not join or cross-check `LeaveRequests`.
  - There is no background reconciler or daily batch process to create excused attendance records for employees on approved leave.

### 5.3 Discrepancy 3: Phantom Point Redemption & Ledger Immutability
- **Business Rule Expectation:** MOD-08 Cash Rewards claims require reserving Green Points, locking them against concurrent claims, and recording an auditable deduction upon payout or returning them upon rejection.
- **Actual Implementation Flaw:**
  - `MOD-06-COMPLETION-REPORT.md` claimed that `PointEventType.PointsRedemption` was implemented.
  - Inspection of `Domain/Enums/PointEnums.cs` reveals `PointEventType` ends at `ManualAdjustment = 8`. There is no `PointsRedemption`.
  - `PointTransaction` has no `IsReserved`, `HoldExpiresAtUtc`, or `RedemptionClaimId` properties.
  - Point balances calculated in `GetMyPointsSummaryHandler.cs` simply sum `Finalized` points. There is no concept of `ReservedPoints` or `AvailableForRedemptionPoints`.

### 5.4 Discrepancy 4: Hardcoded English DTOs Bypassing Bilingual Database Fields
- **Business Rule Expectation (`P0 Localization`):** Changing language between Arabic and English must display localized business entity data (Names, Departments, Titles, Locations, Shifts) from the database.
- **Actual Implementation Flaw:**
  - In `AttendanceRecordDto.cs` (lines 71–73):
    ```csharp
    WorkLocationName = record.WorkLocation?.Name,
    WorkShiftName = record.WorkShift?.Name,
    EmployeeName = record.Employee?.FullName,
    ```
    These mappings directly read the default English `Name` / `FullName` properties. They ignore `WorkLocation.NameAr`, `WorkShift.NameAr`, and `Employee.FullNameAr`.
  - In `WorkLocationDto.cs` and `WorkShiftDto.cs`, the DTO contracts completely lack `NameAr` or `AddressAr` fields.
  - As a result, the `/admin-operations` and `/attendance` tables display "Main Branch - Jeddah" and English employee names even when the UI language is switched to Arabic RTL.

---

## 6. Bilingual Business Data Localization Audit

### 6.1 Entity-by-Entity Localization Schema Status

| Domain Entity | English Fields Present | Arabic Fields Present | Localization Helper Methods | Audit Finding |
|---|---|---|---|---|
| **`Employee`** | `FirstName`, `LastName`, `Department`, `JobTitle` | `FirstNameAr`, `LastNameAr`, `DepartmentAr`, `JobTitleAr` | `GetFullName(lang)`, `GetDepartment(lang)`, `GetJobTitle(lang)` | **SCHEMA COMPLETE** (DTOs need wiring) |
| **`ApplicationUser`** | `FullName`, `Department`, `JobTitle` | `FullNameAr`, `DepartmentAr`, `JobTitleAr` | `GetFullName(lang)` | **SCHEMA COMPLETE** |
| **`WorkLocation`** | `Name`, `Address` | `NameAr`, `AddressAr` | `GetName(lang)`, `GetAddress(lang)` | **SCHEMA COMPLETE** (DTO missing fields) |
| **`WorkShift`** | `Name`, `Notes` | `NameAr` | `GetName(lang)` | **PARTIAL** (`NotesAr` missing) |
| **`WorkSchedule`** | `Name`, `Description` | `NameAr`, `DescriptionAr` | `GetName(lang)`, `GetDescription(lang)` | **SCHEMA COMPLETE** |
| **`PointRule`** | `Name`, `Description` | `NameAr`, `DescriptionAr` | `GetName(lang)`, `GetDescription(lang)` | **SCHEMA COMPLETE** |
| **`LeaveType`** | `Name`, `Description` | `NameAr`, `DescriptionAr` | `GetName(lang)`, `GetDescription(lang)` | **SCHEMA COMPLETE** |
| **`AttendanceRecord`** | `Notes`, `ReviewNotes`, `CheckInFailureReason`, `CheckOutFailureReason` | **None** | **None** | **DEFICIENT** (Lacks `NotesAr`, `ReviewNotesAr`) |
| **`PointTransaction`** | `Reason` | **None** | **None** | **DEFICIENT** (Lacks `ReasonAr`) |
| **`LeaveRequest`** | `Reason`, `ReviewNotes` | **None** | **None** | **DEFICIENT** (Lacks `ReasonAr`, `ReviewNotesAr`) |
| **`LeaveApprovalHistory`** | `Comments` | **None** | **None** | **DEFICIENT** (Lacks `CommentsAr`) |
| **`AppNotification`** | `Title`, `Message` | **None** | **None** | **DEFICIENT** (Lacks `TitleAr`, `MessageAr`) |

---

## 7. Audit of Module Reports: Claims vs. Reality

| Review Document | Claimed Status | Verified Physical Reality | Discrepancies & Blocker Details |
|---|---|---|---|
| `MOD-01-COMPLETION-REPORT.md` | COMPLETE | **VERIFIED COMPLETE** | Core Identity, JWT, Profile data sync verified. |
| `MOD-02-COMPLETION-REPORT.md` | COMPLETE | **VERIFIED COMPLETE** | Employee CRUD, self-supervision prevention verified. |
| `MOD-03-COMPLETION-REPORT.md` | COMPLETE | **VERIFIED COMPLETE** | Geofence calculations, worksite management verified. |
| `MOD-04-COMPLETION-REPORT.md` | COMPLETE | **VERIFIED COMPLETE** | Claimed 12 tests; 3 automated tests exist. Feature is functional. |
| `MOD-05-COMPLETION-REPORT.md` | COMPLETE | **PARTIALLY DEFECTIVE** | Claimed 15 tests; 6 exist. Critical bug: GPS checkout approval loses Green Points. |
| `MOD-06-COMPLETION-REPORT.md` | COMPLETE | **PARTIAL** | Claimed `PointsRedemption` in `PointEventType`; actually missing. |
| `MOD-07-COMPLETION-REPORT.md` | COMPLETE | **COMPLETE IN ISOLATION** | Leave submission/approval works, but has zero integration with Attendance. |
| **MOD-08 Completion Report** | *Not Found* | **COMPLETELY MISSING** | Module not yet implemented. |
| `MOD-09-COMPLETION-REPORT.md` | COMPLETE | **VERIFIED COMPLETE** | Admin operations, manual adjustments, GPS queues functional. |
| **MOD-10 Completion Report** | *Not Found* | **COMPLETELY MISSING** | Inherited notifications exist without formal completion report. |
| `MOD-11-COMPLETION-REPORT.md` | COMPLETE | **VERIFIED COMPLETE** | Operational reporting and CSV/Excel/PDF export verified. |
| **MOD-12 Completion Report** | *Not Found* | **COMPLETELY MISSING** | Module not yet implemented. |

---

## 8. Automated Test Suite Audit (Evidence-Based Verification)

Executing `dotnet test backend/Tests/Tests.csproj --no-build` confirmed **68 test cases across 8 test suites** with a **100% Pass Rate**:

```text
Passed!  - Failed: 0, Passed: 68, Skipped: 0, Total: 68, Duration: 4 s - Tests.dll (net10.0)
```

### Breakdown of Executed Automated Tests:
1. **Authorization & Hierarchy (`AuthorizationTests.cs`):** 11 tests passed (Supervision scoping, self-supervision guards, profile sync).
2. **Database Seeding (`DbInitializerTests.cs`):** 2 tests passed (Multi-role default users, initial seed validation).
3. **Work Schedules & Shifts (`ShiftResolutionTests.cs`):** 2 tests passed (Standard day shift, off-day non-working resolution).
4. **Geofencing & Accuracy (`GeofenceServiceTests.cs`):** 10 tests passed (Zero-distance, known geodesic distances, coordinate boundaries, radius checks).
5. **Integrated Attendance & Points Workflows (`IntegratedWorkflowsTests.cs`):** 7 tests passed:
   - `WorkflowA`: Standard attendance generates verified attendance and Green Points.
   - `WorkflowB`: Overnight shift resolves correct shift date and duration across midnight.
   - `WorkflowC`: Geofence breach results in `PendingReview` and holds points.
   - `WorkflowD`: Duplicate check-in rejected with 409 Conflict.
   - `WorkflowE`: Admin reversal creates auditable offsetting transaction.
   - `WorkflowF`: After-cutoff check-in assigns `Present` and Black Card under `DEC-004`.
   - `WorkflowG`: Check-out without prior check-in rejected with 400 Bad Request.
6. **File Storage & Profile Photos (`EmployeeProfilePhotoTests.cs`):** 10 tests passed (Magic bytes validation, size limits, post-commit cleanup, rollback safety).
7. **Leave Management (`LeaveManagementTests.cs`):** 5 tests passed (Overlap prevention, cancellation policies, supervisor approval scoping, summary calculations).
8. **Point Engine Unit Tests (`PointCalculationEngineTests.cs`):** 4 tests passed (On-time Green, late Red, pending review holding, idempotency).
9. **Admin Operations (`AdminOperationsTests.cs`):** 8 tests passed (GPS approval, GPS rejection, incomplete correction, manual signed point adjustments).
10. **Reporting & Exports (`ReportsTests.cs`):** 8 tests passed (Catalog loading, daily attendance KPIs, ClosedXML Excel, QuestPDF generation, CSV sanitization).

---

## 9. Prioritized Next Actions & Remediation Plan

To advance NASAQ toward platform-wide closure and production readiness, subsequent development should proceed in the following strict order of priority:

### Phase 1: Critical Business Rule Fixes (P0)
1. **Fix GPS Check-Out Green Points Loss:**
   - Update `PointCalculationEngine.cs` so that if an attendance record has `CheckOutTimeUtc != null`, it evaluates `CompletedShift` regardless of whether the record is `Completed` or `PendingReview`, placing the resulting transaction in `PointTransactionStatus.PendingReview` when GPS is unverified.
   - In `ApproveGpsExceptionHandler.cs`, add a fallback evaluation call when approving Check-Out if no pre-existing completion points are found.
2. **Integrate Approved Leaves with Attendance Engine:**
   - Update `CheckInHandler.cs` to check active `LeaveRequests` for the date, tagging the session or alerting the user.
   - In Daily Attendance monitoring (`GetDailyAttendanceOperationsHandler.cs`) and Incomplete Attendance (`GetIncompleteAttendanceHandler.cs`), join `LeaveRequests` so employees on approved leaves are marked `ExcusedLeave` rather than absent or incomplete.

### Phase 2: DTO & Business Data Localization (P0)
1. **Localize DTO Contracts:**
   - Update `AttendanceRecordDto.cs` to accept `ICurrentLanguage` or include `WorkLocationNameAr`, `WorkShiftNameAr`, and `EmployeeNameAr`.
   - Update `WorkLocationDto.cs` and `WorkShiftDto.cs` to include Arabic names and addresses.
   - Verify frontend tables display Arabic entity names when the user selects Arabic RTL.

### Phase 3: Missing Roadmap Modules (P1)
1. **Implement MOD-08 (Cash Rewards Program):**
   - Create domain entities: `RewardItem`, `RewardClaim`, `RewardPayout`.
   - Add `PointsRedemption` to `PointEventType`.
   - Implement point reservation/holding logic so points cannot be claimed twice concurrently.
   - Build frontend claims catalog and administrative approval/payout interface.
   - Generate `MOD-08-COMPLETION-REPORT.md`.
2. **Formalize MOD-10 (Notifications Center):**
   - Implement event-driven notifications for attendance GPS exceptions, Black Card assignments, leave status updates, and point adjustments.
   - Generate `MOD-10-COMPLETION-REPORT.md`.
3. **Implement MOD-12 (Audit Trail & System Integrity):**
   - Create append-only `AuditTrailEntry` entity recording Actor, Action, Entity, Old Values, New Values, Reason, and Timestamp.
   - Build administrative audit log viewer in frontend with tamper-evident filtering.
   - Generate `MOD-12-COMPLETION-REPORT.md`.
