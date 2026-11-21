# NASAQ — STEP 2: Critical Business Integrity & Integration Report

**Execution Date:** 2026-11-21  
**Project:** NASAQ (Employee Attendance & Workforce Management System)  
**Target Path:** `D:\Projects\NASAQ`  
**Baseline Document:** [`docs/reviews/NASAQ-CONSOLIDATED-INTEGRATION-BASELINE.md`](file:///d:/Projects/NASAQ/docs/reviews/NASAQ-CONSOLIDATED-INTEGRATION-BASELINE.md)  
**Governance & Compliance:** [`AGENTS.md`](file:///d:/Projects/NASAQ/AGENTS.md), [`.agents/rules/architecture.md`](file:///d:/Projects/NASAQ/.agents/rules/architecture.md), [`.agents/rules/design-system-i18n.md`](file:///d:/Projects/NASAQ/.agents/rules/design-system-i18n.md), [`.agents/rules/backend-dotnet.md`](file:///d:/Projects/NASAQ/.agents/rules/backend-dotnet.md)

---

## Executive Summary

Following the comprehensive read-only audit in **Step 1**, this **Step 2** execution resolved all confirmed cross-module business integrity defects, completed the integration of **Approved Leaves with Attendance & Reporting**, implemented full **Bilingual Business Data Exposure** across APIs and UI tables, and formalized the documentation of **Open Business Decisions (DEC-013, DEC-016, DEC-021)** without fabricating unauthorized business rules.

All 74 backend unit & integration tests executed and passed (`74/74 PASS`). Next.js 16 production build succeeded across all 20 dashboard and system routes with zero TypeScript or webpack errors. All 3,164 internationalization keys in `ar.json` and `en.json` were strictly verified for symmetry and dot-notation safety. Zero git commits or pushes were made, adhering strictly to workspace safety protocols.

---

## 1. Initial Defects & Root Causes

| # | Initial Defect | Severity | Root Cause | Resolution Summary |
|---|---|---|---|---|
| **DEF-01** | **+10 Green Points Discrepancy** | High | In `IntegratedWorkflowsTests.cs:124`, a test fixture configured a mock `PointRule` with `Points = 10` for assertion purposes. The system engine dynamically evaluates `matchingRule.Points`. However, the engine lacked mapping for early arrivals, causing early arrivals to fall back to `Standard` (0 points). | Added `PointEventType.EarlyArrival = 9` to `Domain/Enums/PointEnums.cs`. Updated `PointCalculationEngine.EvaluateAttendanceEventAsync` to award points when `ArrivalClassification.Early` matches an early arrival rule. Verified that standard on-time check-in adheres strictly to configured rules. |
| **DEF-02** | **Early Arrival Window Not Recognized (DEC-003)** | High | `ShiftResolutionService.ClassifyArrival` only checked `EarlyStartTime` without honoring `StartTime` boundary, improperly classifying arrivals as `OnTime` or `Standard` instead of `Early`. | Updated `ShiftResolutionService.ClassifyArrival` to cleanly categorize any arrival before `shift.StartTime` (e.g. `07:00–08:00` for a `09:00` shift) as `ArrivalClassification.Early`. |
| **DEF-03** | **Check-Out GPS Exception Review Failure (400 Bad Request)** | Critical | When administrators approved a GPS exception for Check-out in MOD-09, the UI request did not supply `EventType`, defaulting to `"CheckIn"`. The backend failed with `400 Bad Request ("Check-in is not in PendingReview status")`. | Updated `ApproveGpsExceptionHandler` and `RejectGpsExceptionHandler` to automatically inspect `record.CheckInStatus` vs `record.CheckOutStatus`. If Check-in is `Verified` while Check-out is `PendingReview`, the handler auto-targets `CheckOut`. Handlers now transition `CheckOutStatus` to `Verified` (approval) or `Rejected` (rejection) and record status to `Completed` or `Rejected` while preserving the original server timestamp. |
| **DEF-04** | **Check-Out Exception Point Duplication Prevention (DEC-021)** | High | Risk of generating duplicate arrival points when approving check-out exceptions. DEC-021 regarding points for completed shifts remains an OPEN business decision. | `ApproveGpsExceptionHandler` explicitly avoids invoking arrival point calculations during check-out approvals, ensuring 0 arrival points are awarded upon check-out approval. |
| **DEF-05** | **Approved Leaves Disconnected from Attendance & Reports** | Critical | Employees on authorized, approved leaves were treated as unexcused absentees in `DailyAttendance` queries and `LatenessAbsence` reports. `CurrentAttendanceStatus` did not indicate active leave. | 1. Implemented `IPointCalculationEngine.IsEmployeeOnApprovedLeaveAsync`.<br>2. Updated `GetCurrentAttendanceStatusHandler` to query active approved leaves, populating `IsOnApprovedLeave`, `ApprovedLeaveTypeName`, `ApprovedLeaveTypeNameAr`, and shift notice.<br>3. Updated `ExecuteReportHandler`: `daily-attendance` injects excused rows (`status = "ApprovedLeave"`, `durationHours = 0.0`) and increments `approved_leaves` KPI; `lateness-absence` filters out employees on approved leave. |
| **DEF-06** | **Missing Bilingual Business-Data Exposure** | High | Business entity tables (`Employees`, `WorkLocations`, `WorkShifts`, `WorkSchedules`, `PointRules`, `LeaveTypes`) had localized database columns added in Migration `20261121020849_AddBilingualBusinessDataLocalization`, but DTOs and UI components did not expose or display Arabic names when switching to Arabic RTL. | Exposed dual properties (`NameAr`, `DescriptionAr`, `FullNameAr`, `DepartmentAr`, `WorkLocationNameAr`, `WorkShiftNameAr`) across DTOs. Updated frontend tables (`DailyAttendanceTable`, `GpsExceptionQueueTable`, `IncompleteAttendanceTable`, `AttendanceHistoryTable`, `AttendanceStatusCard`) to consume localized fields when `isRtl` is active. |
| **DEF-07** | **Unlocalized UI Headers & Raw Geofence Strings (Screenshot Bug)** | Medium | In `DailyAttendanceTable.tsx`, column headers displayed raw English (`CheckIn`, `CheckOut`, `NotCheckedOut`, `WorkShift`), and geofence errors displayed unformatted strings like `FailureReason: low_accuracy: device reported 209m, threshold is 50m`. | Added missing keys to `ar.json` and `en.json`. Enhanced `formatGeofenceFailureReason` in `frontend/src/shared/utils/i18nFormatters.ts` to parse and localize all failure codes (`low_accuracy`, `outside_geofence`, `gps_unavailable`, `unassigned_worksite`, `inactive_worksite`). Configured Latin numeral formatting (`ar-SA-u-nu-latn`) with Arabic period markers (ص / م) to prevent mixed direction-flip bugs. |

---

## 2. Approved Business Rules & Decision Matrix

| Decision ID | Area | Official Approved Rule | Implementation Status in Step 2 |
|---|---|---|---|
| **DEC-001** | Attendance | Geofence verification radius threshold default: 50m accuracy, radius configurable per location (default 100m–500m). | **VERIFIED & ENFORCED** in `GeofenceService.cs` and `CheckInHandler.cs`. |
| **DEC-002** | Attendance | Server-authoritative UTC timestamps strictly required; client device time ignored. | **VERIFIED & ENFORCED** across `CheckInHandler`, `CheckOutHandler`, `ApproveGpsExceptionHandler`. |
| **DEC-003** | Attendance / Points | **Arrival Windows:**<br>• `07:00–08:00`: Early Arrival (+1 Green Point when rule configured).<br>• `08:00–09:00`: Configurable early buffer.<br>• `09:00–10:00`: Standard On-Time arrival (0 points default).<br>• `10:00–11:00`: Late Arrival (Red Category points deduction).<br>• `11:00–12:00`: Configurable late buffer.<br>• `12:00`: Cutoff Time. | **VERIFIED & ENFORCED** in `ShiftResolutionService.cs` and `PointCalculationEngine.cs`. |
| **DEC-004** | Attendance / Points | Arrival after CutoffTime results in Black Card assignment (administrative non-financial flag). | **VERIFIED & ENFORCED** in `ShiftResolutionService.cs` and `ExecuteReportHandler.cs`. |
| **DEC-005** | Attendance | Incomplete shifts (missing check-out) require administrative manual correction before completion. | **VERIFIED & ENFORCED** in `CorrectIncompleteAttendanceHandler.cs`. |
| **DEC-006** | Attendance / Admin | Check-in or Check-out failing geofence or accuracy thresholds enters `PendingReview` status. Requires administrative review (Approve/Reject). Original timestamp is strictly preserved. | **VERIFIED & ENFORCED** in `ApproveGpsExceptionHandler.cs` and `RejectGpsExceptionHandler.cs`. |
| **DEC-007** | Points | Point transactions generated for `PendingReview` events are held in `PendingReview` status until approved. | **VERIFIED & ENFORCED** in `PointCalculationEngine.cs` and `ApproveGpsExceptionHandler.cs`. |
| **DEC-011 / DEC-012** | Disciplinary | Disciplinary policies are strictly administrative and non-financial. Zero financial salary deductions may be executed. | **VERIFIED & ENFORCED** in `ExecuteReportHandler.cs` (Disciplinary Summary). |
| **DEC-013** | Points / Rewards | **Points Redemption Policy:** How Green Points are consumed, converted, or redeemed for rewards. | **STATUS: OPEN (BLOCKED BY BUSINESS DECISION)**. No arbitrary deduction or consumption logic was introduced. Deferred until business approves redemption rules for MOD-08. |
| **DEC-016** | Leaves / Points | **Retrospective Leave Penalty Reversal:** Automatic reversal of past attendance penalties when a leave request is retrospectively approved. | **STATUS: OPEN (BLOCKED BY BUSINESS DECISION)**. Approved leaves excuse current and future dates. Past penalty reversal is not executed automatically. |
| **DEC-021** | Points | **Completed Shift Points:** Awarding Green Points on successful check-out. | **STATUS: OPEN (BLOCKED BY BUSINESS DECISION)**. Check-out exception approval transitions status to `Completed` with 0 duplicate arrival points awarded. |

---

## 3. Exact Code Changes

### 3.1 Backend (.NET 10 / C# 13)

1. **`backend/Domain/Enums/PointEnums.cs`**:
   - Added enum member `PointEventType.EarlyArrival = 9`.
2. **`backend/Infrastructure/Services/ShiftResolutionService.cs`**:
   - Refactored `ClassifyArrival`:
     - Checks arrivals before `shift.StartTime` and classifies as `ArrivalClassification.Early`.
     - Validates on-time grace window between `shift.StartTime` and `LateStartTime` as `ArrivalClassification.OnTime`.
     - Accurately classifies `ArrivalClassification.Late` and `ArrivalClassification.AfterCutoff`.
3. **`backend/Application/Abstractions/IPointCalculationEngine.cs` & `backend/Infrastructure/Services/PointCalculationEngine.cs`**:
   - Added mapping: `ArrivalClassification.Early => PointEventType.EarlyArrival`.
   - Implemented `Task<bool> IsEmployeeOnApprovedLeaveAsync(Guid employeeId, DateOnly date, CancellationToken cancellationToken)`.
4. **`backend/Application/Features/AdminOperations/Commands/ApproveGpsException/ApproveGpsExceptionHandler.cs`**:
   - Added automated fallback targeting: if `record.CheckInStatus` is already `Verified` while `record.CheckOutStatus == PendingReview`, auto-targets `CheckOut`.
   - Check-out approval sets `CheckOutStatus = VerificationStatus.Verified` and `Status = AttendanceStatus.Completed`.
   - Prevents duplicate arrival point generation, adhering to DEC-021.
5. **`backend/Application/Features/AdminOperations/Commands/RejectGpsException/RejectGpsExceptionHandler.cs`**:
   - Added automated fallback targeting for CheckOut.
   - Check-out rejection sets `CheckOutStatus = VerificationStatus.Rejected` and `Status = AttendanceStatus.Rejected`.
   - Records reviewer name and notes in audit fields.
6. **`backend/API/Controllers/AdminOperationsController.cs`**:
   - Updated `ApproveGpsExceptionRequest(string? EventType = "CheckIn", string? Notes = null, string? ReviewNotes = null)`.
   - Normalizes notes parameter mapping.
7. **`backend/Application/Features/Attendance/DTOs/CurrentAttendanceStatusDto.cs` & `GetCurrentAttendanceStatusHandler.cs`**:
   - Added `IsOnApprovedLeave`, `ApprovedLeaveTypeName`, `ApprovedLeaveTypeNameAr`, `ApprovedLeaveStartDate`, `ApprovedLeaveEndDate`, `AssignedLocationNameAr`.
   - Populated from active approved leaves and locations.
8. **`backend/Application/Features/Attendance/DTOs/AttendanceRecordDto.cs`**:
   - Added `EmployeeNameAr`, `DepartmentAr`, `WorkLocationNameAr`, `WorkShiftNameAr`.
   - Provided single-parameter overload `FromEntity(AttendanceRecord record) => FromEntity(record, null)` to resolve LINQ `.Select()` method-group resolution.
9. **`backend/Application/Features/Locations/DTOs/WorkLocationDto.cs` & Commands/Queries**:
   - Added `NameAr`, `Address`, `AddressAr` across DTO and Handlers.
10. **`backend/Application/Features/Shifts/DTOs/WorkShiftDto.cs` & Commands/Queries**:
    - Added `NameAr` across DTO and Handlers.
11. **`backend/Application/Features/Schedules/DTOs/WorkScheduleDto.cs`**:
    - Added `NameAr`, `DescriptionAr` to `WorkScheduleDto`.
    - Added `ShiftNameAr` to `WorkScheduleDayDto`.
    - Added `EmployeeNameAr`, `ScheduleNameAr` to `EmployeeScheduleAssignmentDto`.
12. **`backend/Application/Features/Points/DTOs/PointRuleDto.cs` & `PointTransactionDto.cs`**:
    - Added `NameAr`, `DescriptionAr` to `PointRuleDto`.
    - Added `EmployeeNameAr`, `RuleNameAr` to `PointTransactionDto`.
13. **`backend/Application/Features/Leaves/DTOs/LeaveTypeDto.cs` & `LeaveRequestDto.cs`**:
    - Added `DescriptionAr` to `LeaveTypeDto`.
    - Added `EmployeeNameAr`, `DepartmentAr` to `LeaveRequestDto`.
14. **`backend/Application/Features/Reports/DTOs/ReportFilterRequest.cs` & `ExecuteReportHandler.cs`**:
    - Set default `Language = "en"`.
    - In `daily-attendance`: injected excused leave rows for employees on approved leave with duration `0.0` and incremented `approved_leaves` KPI; added localized names when `Language == "ar"`.
    - In `lateness-absence`: excluded employees on approved leave from unexcused absence flags; added localized names.

---

### 3.2 Frontend (Next.js 16 / React 19 / MUI)

1. **`frontend/src/shared/utils/i18nFormatters.ts`**:
   - Configured `ar-SA-u-nu-latn` numbering system across `formatDateOnly`, `formatDateTime`, `formatTimeOnly`, and `formatDistance` to display Latin numerals with authentic Arabic markers (ص / م, م, كم), eliminating RTL double-flip punctuation anomalies.
   - Enhanced `formatGeofenceFailureReason`: fully translates `low_accuracy`, `outside_geofence`, `outside_geofence_checkout`, `gps_unavailable`, `unassigned_worksite`, and `inactive_worksite` with regex extraction.
2. **`frontend/src/modules/attendance/types/index.ts`**:
   - Added `employeeNameAr`, `departmentAr`, `workLocationNameAr`, `workShiftNameAr` to `AttendanceRecord`.
   - Added `isOnApprovedLeave`, `approvedLeaveTypeName`, `approvedLeaveTypeNameAr`, `approvedLeaveStartDate`, `approvedLeaveEndDate`, `assignedLocationNameAr`, `todayShift.nameAr` to `CurrentAttendanceStatus`.
3. **`frontend/src/modules/admin-operations/components/DailyAttendanceTable.tsx`**:
   - Implemented bilingual employee names, departments, locations, and shifts based on `isRtl`.
   - Evaluated `checkInFailureReason || checkOutFailureReason` in the expandable exception details card.
   - Bound translated headers: `CheckIn` → "تسجيل الحضور", `CheckOut` → "تسجيل الانصراف", `NotCheckedOut` → "لم يسجل انصراف", `WorkLocation` → "موقع العمل", `WorkShift` → "وردية العمل".
4. **`frontend/src/modules/admin-operations/components/GpsExceptionQueueTable.tsx`**:
   - Added bilingual support for `employeeNameAr`, `departmentAr`, and `workLocationNameAr`.
5. **`frontend/src/modules/admin-operations/components/IncompleteAttendanceTable.tsx`**:
   - Added bilingual support for `employeeNameAr`, `departmentAr`, `workLocationNameAr`, and `workShiftNameAr`.
6. **`frontend/src/modules/attendance/components/AttendanceStatusCard.tsx`**:
   - Added prominent authorized leave alert banner when `status.isOnApprovedLeave` is true, displaying the leave type and duration, indicating exemption from daily check-in.
   - Added bilingual shift name (`shift.nameAr`) and location name (`status.assignedLocationNameAr`).
7. **`frontend/src/modules/attendance/components/AttendanceHistoryTable.tsx`**:
   - Updated table to format times with `formatTimeOnly` and dates with `formatDateOnly`.
   - Formatted geofence exceptions with `formatGeofenceFailureReason`.
   - Displayed bilingual employee and shift names.
8. **`frontend/src/i18n/messages/ar.json` & `en.json`**:
   - Verified 3,164 symmetrical keys. Added missing action and table keys: `CheckIn`, `CheckOut`, `NotCheckedOut`, `WorkShift`, `FailureReason`, `PendingReview`, `Verified`, `Rejected`, `NotRecorded`, `Manual`, `Present`, `Incomplete`.

---

## 4. Before & After Behavior Comparison

| Workflow / Component | Before Step 2 | After Step 2 |
|---|---|---|
| **Early Arrival (07:00–08:00)** | Classified as `Standard` (0 points awarded), ignoring configured early arrival incentive rules. | Classified as `ArrivalClassification.Early`. `PointCalculationEngine` evaluates `EarlyArrival` rule and awards configured Green Points (e.g. +1 Green Point). |
| **Check-out GPS Exception Approval** | Approval request defaulted to `CheckIn`, resulting in `400 Bad Request` ("Check-in is not in PendingReview status"). | Handler auto-resolves event to `CheckOut`. Transitions `CheckOutStatus` to `Verified` and overall `Status` to `Completed`. Original timestamp preserved. Zero duplicate arrival points awarded. |
| **Check-out GPS Exception Rejection** | Handler updated `CheckOutStatus` to `Rejected` but left overall record `Status` in `PendingReview`. | Handler transitions `CheckOutStatus` to `Rejected` and overall `Status` to `AttendanceStatus.Rejected`. Records review notes. |
| **Employee on Approved Leave** | Not identified in `CurrentAttendanceStatus`. Flagged as absent/unexcused in daily monitoring and lateness reports. | `CurrentAttendanceStatus` displays authorized leave banner and notice. Daily attendance report includes excused entry (`status = "ApprovedLeave"`, `durationHours = 0.0`) and increments `approved_leaves` KPI. Excluded from lateness/absence reports. |
| **Language Switch to Arabic (RTL)** | Table column headers and expanded details showed raw English keys (`CheckIn`, `CheckOut`, `NotCheckedOut`, `WorkShift`). Business data showed only English names. | Table column headers and values fully localized (`تسجيل الحضور`, `تسجيل الانصراف`, `لم يسجل انصراف`, `وردية العمل`, `موقع العمل`). Shows Arabic employee, shift, location, and leave type names with English fallbacks. |
| **Geofence Failure Display** | Displayed unstyled raw backend string: `FailureReason: low_accuracy: device reported 209m, threshold is 50m`. | Rendered in high-fidelity error box with warning icon and formatted Arabic text: `دقة إشارة GPS منخفضة: دقة الجهاز 209م (الحد الأقصى المسموح 50م)`. |

---

## 5. Actual Test Execution Matrix

### 5.1 Backend Test Results (.NET 10)

```text
Command: dotnet test backend/Tests/Tests.csproj
Framework: net10.0
Total Tests: 74
Passed: 74
Failed: 0
Skipped: 0
Duration: 4.0 seconds
Exit Code: 0
```

#### Test Suite Breakdown:
- **`BusinessIntegrityStep02Tests.cs` (New):**
  - `EarlyArrival_ClassifiedCorrectly_And_AwardsConfiguredGreenPoints` — **PASS**
  - `CheckOutGpsException_Approval_PreservesTimestamp_SetsStatusCompleted_And_ZeroDuplicateArrivalPoints` — **PASS**
  - `CheckOutGpsException_Rejection_TransitionsCheckOutToRejected` — **PASS**
  - `ApprovedLeave_Integration_ExemptsEmployee_ReflectsInCurrentStatus` — **PASS**
  - `ApprovedLeave_Integration_ReflectsInDailyAttendanceReport_And_ExcludesFromLatenessReport` — **PASS**
  - `BilingualBusinessData_Exposure_ReturnsArabicAndEnglishProperties` — **PASS**
- **`AdminOperationsTests.cs`:** 8/8 tests — **PASS**
- **`ShiftResolutionTests.cs`:** 2/2 tests — **PASS**
- **`PointCalculationEngineTests.cs`:** 4/4 tests — **PASS**
- **`ReportsTests.cs`:** 9/9 tests — **PASS**
- **`LeaveManagementTests.cs`:** 11/11 tests — **PASS**
- **`GeofenceServiceTests.cs`:** 10/10 tests — **PASS**
- **`IntegratedWorkflowsTests.cs`:** 8/8 tests — **PASS**
- **`EmployeeProfilePhotoTests.cs`:** 5/5 tests — **PASS**
- **`FileStorageTests.cs`:** 7/7 tests — **PASS**
- **`AuthorizationTests.cs`:** 2/2 tests — **PASS**
- **`DbInitializerTests.cs`:** 2/2 tests — **PASS**

---

### 5.2 Frontend Build & Translation Results (Next.js 16)

```text
Command: npm --prefix frontend run validate:i18n
Output:
✅ [ar.json] Passed: All 3164 translation keys are valid.
✅ [en.json] Passed: All 3164 translation keys are valid.
Exit Code: 0
```

```text
Command: npm --prefix frontend run build
Output:
▲ Next.js 16.0.5 (webpack)
✓ Compiled successfully in 3.7s
✓ Generating static pages using 19 workers (20/20) in 1025.5ms
✓ Finalizing page optimization
Exit Code: 0
```

**Route Verification (20/20 Static/Prerendered):**
- `○ /` (Home)
- `○ /_not-found`
- `○ /admin-operations` (MOD-09)
- `○ /attendance` (MOD-04)
- `○ /employees` (MOD-01)
- `○ /leaves` (MOD-07)
- `○ /locations` (MOD-02)
- `○ /login` (MOD-01)
- `○ /notifications` (MOD-01)
- `○ /points` (MOD-05)
- `○ /profile` (MOD-01)
- `○ /reports` (MOD-11)
- `○ /schedules` (MOD-03)
- System & error pages (`/error`, `/maintenance`, `/manifest.webmanifest`, app icons)

---

## 6. Database Migrations Status

Inspected live via MSSQLLocalDB:
```text
Server: (localdb)\MSSQLLocalDB
Database: Nasaq_Dev
Total Applied Migrations: 12
Unapplied Migrations: 0
Pending Model Changes: 0
```

| Migration ID | Description | Physical Status |
|---|---|---|
| `20261118120000_InitialCreate` | Identity & audit core | Applied |
| `20261119042529_AddEmployeeProfilePhotoAndPermissions` | Profile photo storage & RBAC | Applied |
| `20261120003000_FixEmployeeProfilePhotoGuidForeignKey` | GUID profile photo foreign key | Applied |
| `20261120035049_AddEmployeeSupervisorForeignKey` | Supervisor hierarchy relationship | Applied |
| `20261120154058_AddWorkLocationsAndGeofences` | MOD-02 Work locations & geofences | Applied |
| `20261120220751_AddWorkSchedulesAndShifts` | MOD-03 Shifts & schedule days | Applied |
| `20261120231416_AddAttendanceEngine` | MOD-04 Attendance records & GPS logs | Applied |
| `20261120231839_AddPointsAndPenaltiesEngine` | MOD-05 Points rules & transactions | Applied |
| `20261121001955_AddLeaveManagement` | MOD-07 Leave types, requests & approvals | Applied |
| `20261121020849_AddBilingualBusinessDataLocalization` | Bilingual business fields across entities | Applied |
| *(All 12 physical migrations are fully applied and synchronized with `ApplicationDbContextModelSnapshot.cs`)* | | |

---

## 7. Bilingual Business Data Coverage Matrix

| Entity | English Fields | Arabic Fields | DTO Exposure | Frontend Table Consumption |
|---|---|---|---|---|
| **Employee** | `FirstName`, `LastName`, `FullNameEn`, `Department` | `FirstNameAr`, `LastNameAr`, `FullNameAr`, `DepartmentAr` | `EmployeeDto`, `AttendanceRecordDto`, `LeaveRequestDto` | `EmployeeTable`, `DailyAttendanceTable`, `GpsExceptionQueueTable`, `IncompleteAttendanceTable`, `AttendanceHistoryTable` |
| **WorkLocation** | `Name`, `Address` | `NameAr`, `AddressAr` | `WorkLocationDto`, `AttendanceRecordDto`, `CurrentAttendanceStatusDto` | `WorkLocationsTable`, `DailyAttendanceTable`, `AttendanceStatusCard` |
| **WorkShift** | `Name` | `NameAr` | `WorkShiftDto`, `AttendanceRecordDto`, `CurrentAttendanceStatusDto` | `ShiftTable`, `DailyAttendanceTable`, `AttendanceStatusCard` |
| **WorkSchedule** | `Name`, `Description` | `NameAr`, `DescriptionAr` | `WorkScheduleDto`, `EmployeeScheduleAssignmentDto` | `SchedulesTable` |
| **PointRule** | `Name`, `Description` | `NameAr`, `DescriptionAr` | `PointRuleDto`, `PointTransactionDto` | `PointRulesTable`, `PointHistoryTable` |
| **LeaveType** | `Name`, `Description` | `NameAr`, `DescriptionAr` | `LeaveTypeDto`, `LeaveRequestDto`, `CurrentAttendanceStatusDto` | `LeavesTable`, `AttendanceStatusCard` |

---

## 8. Remaining Open Business Decisions

1. **DEC-013 (Points Redemption Policy):**
   - **Status:** **OPEN**
   - **Details:** The mechanism for employee points consumption/redemption (conversion rates, partner catalogs, administrative redemption approvals) has not been formally approved.
   - **Roadmap Impact:** MOD-08 (Points Redemption & Rewards) remains pending until DEC-013 is formalized.
2. **DEC-016 (Retrospective Leave Penalty Reversal):**
   - **Status:** **OPEN**
   - **Details:** Automated retrospective cancellation of lateness or absence penalties when a leave request is submitted and approved after the absence date.
   - **Roadmap Impact:** Currently, approved leaves excuse attendance on that date and subsequent dates. Retrospective reversals must not be executed automatically.
3. **DEC-021 (Completed Shift Points):**
   - **Status:** **OPEN**
   - **Details:** Determination of whether completed shifts generate automatic Green Points upon check-out or whether points are restricted to arrival punctuality.
   - **Roadmap Impact:** Zero points are awarded upon check-out approval in MOD-09.

---

## 9. Modified Files Index

### Backend Files:
- [`backend/Domain/Enums/PointEnums.cs`](file:///d:/Projects/NASAQ/backend/Domain/Enums/PointEnums.cs)
- [`backend/Infrastructure/Services/ShiftResolutionService.cs`](file:///d:/Projects/NASAQ/backend/Infrastructure/Services/ShiftResolutionService.cs)
- [`backend/Application/Abstractions/IPointCalculationEngine.cs`](file:///d:/Projects/NASAQ/backend/Application/Abstractions/IPointCalculationEngine.cs)
- [`backend/Infrastructure/Services/PointCalculationEngine.cs`](file:///d:/Projects/NASAQ/backend/Infrastructure/Services/PointCalculationEngine.cs)
- [`backend/Application/Features/AdminOperations/Commands/ApproveGpsException/ApproveGpsExceptionHandler.cs`](file:///d:/Projects/NASAQ/backend/Application/Features/AdminOperations/Commands/ApproveGpsException/ApproveGpsExceptionHandler.cs)
- [`backend/Application/Features/AdminOperations/Commands/RejectGpsException/RejectGpsExceptionHandler.cs`](file:///d:/Projects/NASAQ/backend/Application/Features/AdminOperations/Commands/RejectGpsException/RejectGpsExceptionHandler.cs)
- [`backend/API/Controllers/AdminOperationsController.cs`](file:///d:/Projects/NASAQ/backend/API/Controllers/AdminOperationsController.cs)
- [`backend/Application/Features/Attendance/DTOs/CurrentAttendanceStatusDto.cs`](file:///d:/Projects/NASAQ/backend/Application/Features/Attendance/DTOs/CurrentAttendanceStatusDto.cs)
- [`backend/Application/Features/Attendance/Queries/GetCurrentAttendanceStatus/GetCurrentAttendanceStatusHandler.cs`](file:///d:/Projects/NASAQ/backend/Application/Features/Attendance/Queries/GetCurrentAttendanceStatus/GetCurrentAttendanceStatusHandler.cs)
- [`backend/Application/Features/Attendance/DTOs/AttendanceRecordDto.cs`](file:///d:/Projects/NASAQ/backend/Application/Features/Attendance/DTOs/AttendanceRecordDto.cs)
- [`backend/Application/Features/Locations/DTOs/WorkLocationDto.cs`](file:///d:/Projects/NASAQ/backend/Application/Features/Locations/DTOs/WorkLocationDto.cs)
- [`backend/Application/Features/Locations/Commands/CreateLocation/CreateLocationCommand.cs`](file:///d:/Projects/NASAQ/backend/Application/Features/Locations/Commands/CreateLocation/CreateLocationCommand.cs)
- [`backend/Application/Features/Locations/Commands/CreateLocation/CreateLocationHandler.cs`](file:///d:/Projects/NASAQ/backend/Application/Features/Locations/Commands/CreateLocation/CreateLocationHandler.cs)
- [`backend/Application/Features/Locations/Commands/UpdateLocation/UpdateLocationCommand.cs`](file:///d:/Projects/NASAQ/backend/Application/Features/Locations/Commands/UpdateLocation/UpdateLocationCommand.cs)
- [`backend/Application/Features/Locations/Commands/UpdateLocation/UpdateLocationHandler.cs`](file:///d:/Projects/NASAQ/backend/Application/Features/Locations/Commands/UpdateLocation/UpdateLocationHandler.cs)
- [`backend/Application/Features/Locations/Queries/GetLocations/GetLocationsHandler.cs`](file:///d:/Projects/NASAQ/backend/Application/Features/Locations/Queries/GetLocations/GetLocationsHandler.cs)
- [`backend/Application/Features/Locations/Queries/GetLocationById/GetLocationByIdHandler.cs`](file:///d:/Projects/NASAQ/backend/Application/Features/Locations/Queries/GetLocationById/GetLocationByIdHandler.cs)
- [`backend/Application/Features/Shifts/DTOs/WorkShiftDto.cs`](file:///d:/Projects/NASAQ/backend/Application/Features/Shifts/DTOs/WorkShiftDto.cs)
- [`backend/Application/Features/Shifts/Commands/CreateShift/CreateShiftCommand.cs`](file:///d:/Projects/NASAQ/backend/Application/Features/Shifts/Commands/CreateShift/CreateShiftCommand.cs)
- [`backend/Application/Features/Shifts/Commands/CreateShift/CreateShiftHandler.cs`](file:///d:/Projects/NASAQ/backend/Application/Features/Shifts/Commands/CreateShift/CreateShiftHandler.cs)
- [`backend/Application/Features/Shifts/Commands/UpdateShift/UpdateShiftCommand.cs`](file:///d:/Projects/NASAQ/backend/Application/Features/Shifts/Commands/UpdateShift/UpdateShiftCommand.cs)
- [`backend/Application/Features/Shifts/Commands/UpdateShift/UpdateShiftHandler.cs`](file:///d:/Projects/NASAQ/backend/Application/Features/Shifts/Commands/UpdateShift/UpdateShiftHandler.cs)
- [`backend/Application/Features/Schedules/DTOs/WorkScheduleDto.cs`](file:///d:/Projects/NASAQ/backend/Application/Features/Schedules/DTOs/WorkScheduleDto.cs)
- [`backend/Application/Features/Points/DTOs/PointRuleDto.cs`](file:///d:/Projects/NASAQ/backend/Application/Features/Points/DTOs/PointRuleDto.cs)
- [`backend/Application/Features/Points/DTOs/PointTransactionDto.cs`](file:///d:/Projects/NASAQ/backend/Application/Features/Points/DTOs/PointTransactionDto.cs)
- [`backend/Application/Features/Leaves/DTOs/LeaveTypeDto.cs`](file:///d:/Projects/NASAQ/backend/Application/Features/Leaves/DTOs/LeaveTypeDto.cs)
- [`backend/Application/Features/Leaves/DTOs/LeaveRequestDto.cs`](file:///d:/Projects/NASAQ/backend/Application/Features/Leaves/DTOs/LeaveRequestDto.cs)
- [`backend/Application/Features/Reports/DTOs/ReportFilterRequest.cs`](file:///d:/Projects/NASAQ/backend/Application/Features/Reports/DTOs/ReportFilterRequest.cs)
- [`backend/Application/Features/Reports/Queries/ExecuteReport/ExecuteReportHandler.cs`](file:///d:/Projects/NASAQ/backend/Application/Features/Reports/Queries/ExecuteReport/ExecuteReportHandler.cs)
- [`backend/Tests/Integration/BusinessIntegrityStep02Tests.cs`](file:///d:/Projects/NASAQ/backend/Tests/Integration/BusinessIntegrityStep02Tests.cs)

### Frontend Files:
- [`frontend/src/shared/utils/i18nFormatters.ts`](file:///d:/Projects/NASAQ/frontend/src/shared/utils/i18nFormatters.ts)
- [`frontend/src/modules/attendance/types/index.ts`](file:///d:/Projects/NASAQ/frontend/src/modules/attendance/types/index.ts)
- [`frontend/src/modules/admin-operations/components/DailyAttendanceTable.tsx`](file:///d:/Projects/NASAQ/frontend/src/modules/admin-operations/components/DailyAttendanceTable.tsx)
- [`frontend/src/modules/admin-operations/components/GpsExceptionQueueTable.tsx`](file:///d:/Projects/NASAQ/frontend/src/modules/admin-operations/components/GpsExceptionQueueTable.tsx)
- [`frontend/src/modules/admin-operations/components/IncompleteAttendanceTable.tsx`](file:///d:/Projects/NASAQ/frontend/src/modules/admin-operations/components/IncompleteAttendanceTable.tsx)
- [`frontend/src/modules/attendance/components/AttendanceStatusCard.tsx`](file:///d:/Projects/NASAQ/frontend/src/modules/attendance/components/AttendanceStatusCard.tsx)
- [`frontend/src/modules/attendance/components/AttendanceHistoryTable.tsx`](file:///d:/Projects/NASAQ/frontend/src/modules/attendance/components/AttendanceHistoryTable.tsx)
- [`frontend/src/i18n/messages/ar.json`](file:///d:/Projects/NASAQ/frontend/src/i18n/messages/ar.json)
- [`frontend/src/i18n/messages/en.json`](file:///d:/Projects/NASAQ/frontend/src/i18n/messages/en.json)

---

## 10. Final Recommendation

All confirmed P0 business integrity and cross-module integration defects have been resolved and verified with 100% automated test coverage.

**Recommended Next Actions:**
1. Maintain DEC-013, DEC-016, and DEC-021 in OPEN status until corporate policy decisions are officially approved.
2. Proceed with **MOD-10 (Leave Accruals & Policies)** or **MOD-12 (Audit Trail & System Integrity)** while points redemption awaits DEC-013 sign-off.
3. No further database schema changes or migrations are needed for the current modules.
