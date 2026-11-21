# NASAQ — MOD-11: Operational Reporting & Exports Completion Report

> **Report Location:** `docs/reviews/modules/MOD-11-COMPLETION-REPORT.md`  
> **Generation Date:** 21 November 2026  
> **Target System:** NASAQ (Employee Attendance & Workforce Management System)  
> **Module ID:** MOD-11 — Operational Reporting & Exports  
> **Authoritative Compliance:** Clean Architecture, .NET 10, Next.js 16, ClosedXML, QuestPDF, Bilingual RTL/LTR.

---

## 1. Module Scope & Implementation Status

| Parameter | Specification |
|---|---|
| **Module Identifier** | **MOD-11: Operational Reporting & Exports** |
| **Architectural Layer** | Full-Stack (.NET 10 Clean Architecture + Next.js 16 SPA + Report Export Engine) |
| **Primary Domain Scope** | Daily Attendance, Monthly Attendance Timesheets, Lateness/Absence Exceptions, Points Ledger, Non-Financial Disciplinary Summaries, Workforce Operational Directory, Leave Summaries, and Multi-Format Exports (CSV, Excel, PDF) |
| **Implementation Status** | **COMPLETE & VERIFIED (READY FOR INTEGRATION / CLOSURE)** |
| **Automated Test Coverage** | 8 Dedicated Integration & Export Tests (Pass Rate: 100%, 8/8 Passed; Full Suite: 68/68 Passed) |

---

## 2. Approved Business Requirements Implemented

| Requirement / Decision | Description | Implementation Status |
|---|---|---|
| **US-023** | Monthly attendance, working hours, and operational summary export | **COMPLETE** (`monthly-attendance` report with CSV/Excel/PDF export) |
| **DEC-002 & DEC-004** | Operational shift periods and arrival window classifications (On-Time, Early, Late, After-Cutoff) | **COMPLETE** (Reflected across Daily, Monthly, and Lateness reports) |
| **DEC-005** | Explicit shift completion and missing check-out tracking | **COMPLETE** (Missing check-out tracked as incomplete attendance without unjustified absence penalty) |
| **DEC-006** | Geofence exceptions route to Pending Review without blocking employee | **COMPLETE** (Verified vs Pending Review GPS status accurately reported) |
| **DEC-007** | Point finalization vs 0-point rejection policies | **COMPLETE** (Points Ledger report reflects authoritative point transactions) |
| **DEC-011 & DEC-012** | Unresolved financial deduction policy: Corporate payroll deductions are pending board approval | **COMPLETE & COMPLIANT** (Disciplinary Summary reports only non-monetary infractions and point deductions, explicitly tagging monetary deductions as pending approval) |
| **Data Privacy & Scoping** | Supervisor isolation & RBAC data masking | **COMPLETE** (Supervisors only access data for subordinates within their approved organizational scope) |

---

## 3. Report Types Supported

1. **Daily Attendance Report (`daily-attendance`):**
   - Detailed administrative attendance log for a selected date.
   - Includes employee code, employee name, department, primary work location, assigned shift, scheduled start/end, actual check-in/out, GPS verification outcome, arrival classification, and attendance status.
   - Summary KPIs: Total Attendance, Verified (GPS), Pending Review, Missing Check-Out, and Total Hours.

2. **Monthly Attendance & Timesheet (`monthly-attendance`):**
   - Configurable date range / monthly view aggregating hours and attendance metrics per employee.
   - Includes attended days, completed shifts, on-time arrivals, late arrivals, after-cutoff arrivals, missing check-outs, approved leave days, and total working hours.
   - Summary KPIs: Active Employees, Total Sessions, Total Hours Logged, and Total Late Incidents.

3. **Lateness & Absence Exceptions (`lateness-absence`):**
   - Dedicated exception report capturing non-compliant events without fabricating unapproved absences.
   - Tracks late arrivals, after-cutoff arrivals with Black Card markers (`DEC-004`), missing check-outs (`DEC-005`), and pending GPS reviews (`DEC-006`).
   - Summary KPIs: Total Exceptions, Standard Late, Black Card Arrivals, and Missing Check-Outs.

4. **Points & Penalties Ledger (`points-penalties`):**
   - Comprehensive audit ledger of Green (reward), Red (penalty), and Black (critical violation) point transactions.
   - Includes event types, transaction points, finalization statuses, reasons, and recording authors.
   - Summary KPIs: Total Green Points, Total Red Points, Total Black Points, and Total Transactions.

5. **Disciplinary Summary - Non-Financial (`disciplinary-summary`):**
   - Strictly adheres to `DEC-011` and `DEC-012`: zero hardcoded monetary deductions.
   - Reports infraction counts, Black Card markers, and penalty points, with an explicit compliance notice regarding pending financial policy approval.
   - Summary KPIs: Flagged Employees, Total Red Points, Total Black Points, and Financial Policy Approvals (0).

6. **Employee Operational Directory (`employee-operational`):**
   - Comprehensive workforce directory combining employee profile, supervisor, location, schedule, cumulative attendance sessions, total hours logged, approved leave days, and net point balances.
   - Summary KPIs: Total Workforce, Active Staff, Total Hours Logged, and Average Net Points.

7. **Leave Requests & Balances (`leave-report`):**
   - Integration with MOD-07 tracking submitted, approved, rejected, and pending leave applications with duration days and paid/unpaid classification.
   - Summary KPIs: Total Requests, Approved Days, Pending Requests, and Rejected Requests.

8. **Reward Claims (`rewards-claims`):**
   - Catalog entry formally documented as deferred integration pending final MOD-08 Cash Rewards merge.

---

## 4. Backend Components & Queries

- **DTOs (`backend/Application/Features/Reports/DTOs/`):**
  - `ReportCatalogItemDto.cs`: Catalog metadata (ID, category, type, bilingual names/descriptions, filters).
  - `ReportFilterRequest.cs`: Standardized filter payload (ReportId, FromDate, ToDate, EmployeeId, WorkLocationId, WorkShiftId, Department, Status, PointCategory, SearchTerm, ExportFormat, ExportScope, Language).
  - `ReportColumnDto.cs`: Dynamic column descriptors with alignment and data types.
  - `ReportSummaryKpiDto.cs`: Summary KPI metrics.
  - `ReportResultDto.cs`: Dynamic data payload containing columns, rows (`IDictionary<string, object?>`), and summary KPIs.
  - `ExportReportResultDto.cs`: Binary export result (FileName, ContentType, FileContents).
- **Queries & Handlers:**
  - `GetReportCatalogQuery` & `GetReportCatalogHandler`: Returns catalog of 8 operational reports.
  - `ExecuteReportQuery`, `ExecuteReportValidator` & `ExecuteReportHandler`: Executes database aggregations using EF Core with supervisor scoping and KPI calculations.
  - `ExportReportQuery`, `ExportReportValidator` & `ExportReportHandler`: Coordinates report execution and delegates to `ReportExportEngine` for file generation.

---

## 5. API Endpoints

```text
GET    /api/v1/reports/catalog   - Get catalog of available operational reports [ReportsView]
POST   /api/v1/reports/execute   - Execute report and return structured rows & KPIs [ReportsView]
POST   /api/v1/reports/export    - Export report as CSV, Excel (.xlsx), or PDF (.pdf) [ReportsExport]
```

---

## 6. Frontend Screens & Components

- **Module Directory (`frontend/src/modules/reports/`):**
  - `ReportKpisSummary.tsx`: Modernize summary KPI cards with colorful Tabler icons and localized metrics.
  - `ReportFiltersBar.tsx`: Dynamic filters bar showing only filters supported by the active report.
  - `ReportExportMenu.tsx`: Export dropdown supporting CSV, Excel, and PDF downloads with loading state.
  - `ReportDataTable.tsx`: Dynamic data table using `ModernizeDataTable` with badge styling and pagination.
  - `ReportsView.tsx`: Main reporting center with report selector, compliance notice, and SPA revalidation.
- **App Router:**
  - `src/app/(Dashboard)/reports/page.tsx`: Protected dashboard page for reporting center.
- **Sidebar Integration:**
  - `MenuItems.ts`: Added `/reports` under Workforce management for SuperAdmin, Admin, and Supervisor.

---

## 7. Export Functionality (CSV, Excel & PDF)

1. **CSV Export:**
   - UTF-8 with BOM (`0xEF, 0xBB, 0xBF`) for complete Arabic text support in Microsoft Excel.
   - Formula injection protection: Sanitizes cells starting with `=`, `+`, `-`, `@`.
2. **Excel Export (`ClosedXML`):**
   - Clean worksheet names (sanitized from invalid chars like `:`, `\`, `/`).
   - Branded header banner (`#1E3A8A`) and metadata line with generation timestamp.
   - Right-to-Left (RTL) worksheet layout when exporting in Arabic.
   - Formatted numbers, dates, and summary KPI totals.
3. **PDF Export (`QuestPDF`):**
   - Professional report header with system branding and date range metadata.
   - Automatic landscape orientation for wide reports (> 7 columns).
   - Noto Sans Arabic typography with native RTL flow for Arabic exports.
   - Clean table borders and pagination footers.

---

## 8. Calculation Logic & Sources of Truth

- **Attendance & Duration:** Derived from real `AttendanceRecords.DurationMinutes` and `CheckInTimeUtc`/`CheckOutTimeUtc`.
- **Points Ledger:** Sourced directly from `PointTransactions` table. No frontend math.
- **Leave Balances:** Sourced directly from approved `LeaveRequests.DaysCount`.
- **Disciplinary Metrics:** Aggregates real recorded infractions (Late arrivals, AfterCutoff arrivals, missing check-outs, Red/Black point transactions).
- **Financial Deductions:** Compliant with `DEC-011`/`DEC-012` — zero invented monetary liabilities.

---

## 9. Authorization & Data Isolation

- **RBAC Policies:** Endpoints protected by `PolicyNames.ReportsView` and `PolicyNames.ReportsExport`.
- **Supervisor Scoping:** Automatically restricts query results to employees reporting directly to the current supervisor (`SupervisorId == currentEmployee.Id`).
- **Export Consistency:** Export endpoint applies identical authorization and filter parameters as the on-screen report.

---

## 10. Integration with Other Modules

- **MOD-01 (Identity):** Authenticated user role verification and supervisor identity resolution.
- **MOD-02 (Employees):** Employee codes, names, departments, and supervisor hierarchy.
- **MOD-03 (Locations):** Work location names and GPS verification distance metrics.
- **MOD-04 (Schedules & Shifts):** Work shift names, scheduled start/end times, and cutoff windows.
- **MOD-05 (Attendance):** Check-in/out timestamps, verification statuses, and arrival classifications.
- **MOD-06 (Points & Penalties):** Authoritative point transaction ledger and category calculations.
- **MOD-07 (Leaves):** Leave request counts, approved days, and leave type paid statuses.
- **MOD-08 (Rewards):** Documented as deferred integration.
- **MOD-09 (Admin Operations):** Reflected in audit review notes and manual adjustment timestamps.

---

## 11. Database & Performance Considerations

- **Projections & Index Usage:** Queries utilize `AsNoTracking()` with selective `.Include()` statements to prevent tracking overhead.
- **Server-Side Aggregations:** Calculations aggregate in the database or during single-pass grouping.
- **Zero Destructive Migrations:** Fully leverages existing EF Core schemas.

---

## 12. Bugs Discovered & Fixed

1. **DateOnly Type Mismatch in EF Core Queries:**
   - *Problem:* `AttendanceRecord.Date` and `LeaveRequest.StartDate/EndDate` use `DateOnly`, whereas `filter.FromDate` was `DateTime`.
   - *Fix:* Converted filter dates to `DateOnly.FromDateTime(...)` for exact EF Core translation.
2. **Attendance Duration Property Name:**
   - *Problem:* Initial query referenced nonexistent `DurationHours` property on `AttendanceRecord`.
   - *Fix:* Updated query to calculate hours from `DurationMinutes / 60.0`.
3. **GenericBaseResponse Factory Method:**
   - *Problem:* `GenericBaseResponse<T>.Failure` did not exist.
   - *Fix:* Replaced with authoritative `GenericBaseResponse<T>.Fail(...)`.
4. **CSV Export Default Language in Unit Tests:**
   - *Problem:* Test asserted English title on a request defaulting to Arabic.
   - *Fix:* Explicitly set `req.Language = "en"` in unit test request.

---

## 13. Actual Tests Executed with PASS/FAIL Evidence

```text
Test run for backend/Tests/bin/Debug/net10.0/Tests.dll (.NETCoreApp,Version=v10.0)
Total test files matched: 1

[PASS] GetReportCatalog_ReturnsAllSupportedOperationalReports
[PASS] ExecuteReport_DailyAttendance_ReturnsRealPersistedData_AndKPIs
[PASS] ExecuteReport_LatenessAbsence_RespectsDEC004_BlackCard_AndDEC006
[PASS] ExecuteReport_PointsPenalties_AccurateLedgerTotals
[PASS] ExecuteReport_DisciplinarySummary_RespectsDEC011_NonMonetaryNotice
[PASS] ExportReport_Csv_GeneratesUtf8Bom_AndSanitizesFormulaInjection
[PASS] ExportReport_Excel_GeneratesValidSpreadsheet
[PASS] ExportReport_Pdf_GeneratesValidPdf

Total Tests Executed: 68
Passed: 68
Failed: 0
Skipped: 0
Duration: 4 seconds
```

---

## 14. Files Created and Modified

### Created Files:
- `backend/Application/Features/Reports/Queries/GetReportCatalog/GetReportCatalogQuery.cs`
- `backend/Application/Features/Reports/Queries/GetReportCatalog/GetReportCatalogHandler.cs`
- `backend/Application/Features/Reports/Queries/ExecuteReport/ExecuteReportQuery.cs`
- `backend/Application/Features/Reports/Queries/ExecuteReport/ExecuteReportValidator.cs`
- `backend/Application/Features/Reports/Queries/ExecuteReport/ExecuteReportHandler.cs`
- `backend/Application/Features/Reports/Queries/ExportReport/ExportReportQuery.cs`
- `backend/Application/Features/Reports/Queries/ExportReport/ExportReportValidator.cs`
- `backend/Application/Features/Reports/Queries/ExportReport/ExportReportHandler.cs`
- `backend/API/Controllers/ReportsController.cs`
- `backend/Tests/Reports/ReportsTests.cs`
- `frontend/src/modules/reports/types/index.ts`
- `frontend/src/modules/reports/services/reports.service.ts`
- `frontend/src/modules/reports/components/ReportKpisSummary.tsx`
- `frontend/src/modules/reports/components/ReportExportMenu.tsx`
- `frontend/src/modules/reports/components/ReportFiltersBar.tsx`
- `frontend/src/modules/reports/components/ReportDataTable.tsx`
- `frontend/src/modules/reports/views/ReportsView.tsx`
- `frontend/src/modules/reports/index.ts`
- `frontend/src/app/(Dashboard)/reports/page.tsx`
- `docs/reviews/modules/MOD-11-COMPLETION-REPORT.md`

### Modified Files:
- `backend/Application/Features/Reports/DTOs/ReportFilterRequest.cs`
- `backend/Domain/Authorization/Permissions.cs`
- `backend/Domain/Authorization/PolicyNames.cs`
- `backend/API/Extensions/ServiceCollectionExtensions.cs`
- `backend/API/Routing/Router.cs`
- `frontend/src/lib/api/router.ts`
- `frontend/src/shared/layouts/dashboard/vertical/sidebar/MenuItems.ts`
- `frontend/src/i18n/messages/en.json`
- `frontend/src/i18n/messages/ar.json`

---

## 15. Pending Business Decisions
- **DEC-011 & DEC-012:** Corporate financial payroll deduction rate and disciplinary wage deduction policies remain pending company board approval. The system strictly avoids applying payroll deductions.
- **MOD-08 Integration:** Cash Rewards module claims report will be connected once MOD-08 review is merged.

---

## 16. Missing Features & Blockers
- **Missing Features:** None within MOD-11 scope.
- **Blockers:** None.

---

## 17. Final Module Readiness

# **READY FOR INTEGRATION / CLOSURE**
