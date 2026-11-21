# NASAQ — MOD-07: Leave Management Completion Report

> **Report Location:** `docs/reviews/modules/MOD-07-COMPLETION-REPORT.md`  
> **Generation Date:** 21 November 2026  
> **Target System:** NASAQ (Employee Attendance & Workforce Management System)  
> **Module ID:** MOD-07 — Leave Management  
> **Authoritative Compliance:** Clean Architecture, Next.js 16, Material UI Modernize Design System, Bilingual RTL/LTR.

---

## 1. Module Name & Implementation Status

| Parameter | Specification |
|---|---|
| **Module Identifier** | **MOD-07: Leave Management** |
| **Architectural Layer** | Full-Stack (Clean Architecture Backend + Modular Next.js 16 Frontend) |
| **Primary Domain Scope** | Leave types, submission, conflict prevention, supervisor approval hierarchy, administrative audit history |
| **Implementation Status** | **COMPLETE & VERIFIED** |
| **Automated Test Coverage** | 5 Dedicated Unit/Integration Tests in `Tests.Leaves.LeaveManagementTests` (All Passing) |

---

## 2. Completed Backend and Frontend Features

### 2.1 Backend Features (.NET 10 / C# 13)
- **Domain Modeling:**
  - `LeaveType`: Configurable leave categories (Annual, Sick, Casual, Unpaid, Emergency) with color codes, active toggling, and max days limits.
  - `LeaveRequest`: Complete leave request lifecycle tracking employee, date range, calendar days count, notes, status, and supervisor audit stamps.
  - `LeaveApprovalHistory`: Immutable event ledger capturing submissions, approvals, rejections, cancellations, actor identity, and review comments.
- **CQRS Use Cases (MediatR):**
  - `CreateLeaveTypeCommand`, `UpdateLeaveTypeCommand`, `ToggleLeaveTypeStatusCommand`
  - `GetLeaveTypesQuery`, `GetLeaveTypeByIdQuery`
  - `SubmitLeaveRequestCommand`: Validates valid date intervals, checks against overlapping existing leaves, and calculates total duration.
  - `CancelLeaveRequestCommand`: Allows employees to cancel their own `Pending` requests.
  - `ApproveLeaveRequestCommand`: Enables supervisors/admins to approve pending requests with strict hierarchy scoping and self-approval prevention.
  - `RejectLeaveRequestCommand`: Enables supervisors/admins to reject requests with a mandatory explanation reason.
  - `GetMyLeaveRequestsQuery`: Paginated request history for the authenticated employee.
  - `GetLeaveRequestsQuery`: Management queue filtered by status, employee, department, and scoped by supervisor assignment.
  - `GetLeaveSummaryQuery`: High-level operational metrics (pending approvals, approved count, rejected count).
- **Security & Authorization:**
  - Role-based permissions (`PolicyNames.AdminOnly`, `PolicyNames.SupervisorOrAdmin`, `PolicyNames.EmployeeOnly`).
  - Supervisor scoping rule enforced: Supervisors can only access and approve requests submitted by their assigned direct subordinates.
  - Anti-self-approval rule enforced: Even if an employee has a supervisor or administrative role, they cannot approve or reject their own leave requests.

### 2.2 Frontend Features (Next.js 16 / React 19 / MUI v6)
- **Tabbed Dashboard Architecture (`LeavesView.tsx`):**
  - **Tab 0: My Leaves (`طلبات إجازاتي`):** Employee view displaying summary cards, status badges, action to submit new leave requests, cancellation action, and expandable request details.
  - **Tab 1: Leave Approvals (`اعتمادات الإجازات`):** Managerial review queue displaying pending requests with pending badge count, supervisor action menu, and approval/rejection dialogs.
  - **Tab 2: Leave Types (`أنواع الإجازات`):** Administrative view for configuring corporate leave types, color codes, max days, and active status toggling.
- **Modernize Design System Fidelity:**
  - Integrated `ModernizeDataTable` with expandable row inspection and actions menu.
  - Direction-aware dialogs (`LeaveRequestFormDialog`, `LeaveTypeFormDialog`, `LeaveReviewDialog`, `LeaveRequestDetailsDialog`).
  - 100% Arabic (RTL) and English (LTR) bilingual parity with instant locale switching.

---

## 3. Business Requirements & Decisions Implemented

| Requirement / Decision | Description | Implementation Status |
|---|---|---|
| **US-011** | Employee submits leave request with date range and reason | **COMPLETE** (`SubmitLeaveRequestCommand`) |
| **US-012** | Admin/Supervisor reviews, approves, or rejects leave requests | **COMPLETE** (`ApproveLeaveRequestCommand`, `RejectLeaveRequestCommand`) |
| **US-013** | Supervisor scoping (Supervisors only manage assigned team) | **COMPLETE** (Enforced in `GetLeaveRequestsHandler`) |
| **DEC-010** | Anti-Self-Approval Safeguard | **COMPLETE** (Blocks approving own requests with `ConflictException`) |
| **DEC-016** | Retrospective leave submission vs attendance penalty | **DOCUMENTED OPEN** (Workflow ready; awaiting final HR policy confirmation) |

---

## 4. API Endpoints, Entities & Database Migrations

### 4.1 Entities
- `backend/Domain/Entities/LeaveType.cs`
- `backend/Domain/Entities/LeaveRequest.cs`
- `backend/Domain/Entities/LeaveApprovalHistory.cs`
- `backend/Domain/Enums/LeaveEnums.cs` (`LeaveRequestStatus`, `LeaveApprovalAction`)

### 4.2 Database Migrations
- **Migration Name:** `20261121001955_AddLeaveManagement`
- **Tables Created:**
  - `LeaveTypes` (Primary key `Id`, unique index on `Code`)
  - `LeaveRequests` (Foreign keys to `Employees` and `LeaveTypes`)
  - `LeaveApprovalHistories` (Foreign key to `LeaveRequests`)

### 4.3 REST API Endpoints
```text
POST   /api/v1/leaves/types               - Create leave type [Admin]
PUT    /api/v1/leaves/types/{id}          - Update leave type [Admin]
PATCH  /api/v1/leaves/types/{id}/toggle-status - Toggle leave type active status [Admin]
GET    /api/v1/leaves/types               - Get all leave types [Authorized]
GET    /api/v1/leaves/types/{id}          - Get leave type by ID [Authorized]
POST   /api/v1/leaves/requests            - Submit leave request [Employee]
GET    /api/v1/leaves/requests/my         - Get my leave requests [Employee]
GET    /api/v1/leaves/requests            - Get leaves management queue [Supervisor/Admin]
GET    /api/v1/leaves/requests/{id}       - Get leave request by ID [Authorized]
POST   /api/v1/leaves/requests/{id}/cancel - Cancel own pending leave request [Employee]
POST   /api/v1/leaves/requests/{id}/approve - Approve leave request [Supervisor/Admin]
POST   /api/v1/leaves/requests/{id}/reject - Reject leave request with reason [Supervisor/Admin]
GET    /api/v1/leaves/summary             - Get leave summary statistics [Authorized]
```

---

## 5. Bugs Discovered & Fixes Applied

1. **Date Range Overlap Bug:**  
   - *Issue:* Overlap condition initially only checked if start date was inside existing range.
   - *Fix:* Replaced with standard temporal intersection: `StartDate <= existing.EndDate && EndDate >= existing.StartDate`.
2. **Supervisor Self-Approval Safeguard:**  
   - *Issue:* A supervisor could navigate to the general approval queue and approve their own leave request.
   - *Fix:* Added authoritative check in `ApproveLeaveRequestHandler`: if `request.EmployeeId == currentEmployee.Id`, throw `ConflictException` with message "Supervisors cannot approve their own leave requests".
3. **Supervisor Subordinate Scoping:**  
   - *Issue:* Supervisors without Admin role could potentially see company-wide leave requests.
   - *Fix:* Added mandatory filter `q = q.Where(r => r.Employee.SupervisorId == currentEmployee.Id)` when caller is in `Supervisor` role and not in `Admin`/`SuperAdmin`.

---

## 6. Actual Tests Executed with PASS/FAIL Results

Command executed: `dotnet test backend/Tests/Tests.csproj --filter "FullyQualifiedName~Leaves"`

| Test Name | Duration | Result |
|---|---|---|
| `Tests.Leaves.LeaveManagementTests.LeaveType_Create_Update_Toggle_WorksAndEnforcesUniqueCode` | 38 ms | **PASSED** |
| `Tests.Leaves.LeaveManagementTests.LeaveRequest_Submit_CalculatesDaysCorrectly_And_PreventsOverlap` | 55 ms | **PASSED** |
| `Tests.Leaves.LeaveManagementTests.LeaveRequest_Cancel_OnlyAllowedForPendingAndOwnEmployee` | 651 ms | **PASSED** |
| `Tests.Leaves.LeaveManagementTests.LeaveRequest_Approve_And_Reject_WithSupervisorScopingAndSelfApprovalSafeguards` | 20 ms | **PASSED** |
| `Tests.Leaves.LeaveManagementTests.LeaveSummary_ComputesAccurateCounts` | 29 ms | **PASSED** |

**Summary:** 5 Tests Executed, **5 Passed**, 0 Failed.  
**Platform-Wide Test Suite:** 52 Tests Executed, **52 Passed**, 0 Failed.  
**Frontend TypeScript & Production Build:** `npx tsc --noEmit` + `npm run build` completed with **0 Errors**.

---

## 7. Files Created or Modified

### Backend:
- `backend/Domain/Entities/LeaveType.cs`
- `backend/Domain/Entities/LeaveRequest.cs`
- `backend/Domain/Entities/LeaveApprovalHistory.cs`
- `backend/Domain/Enums/LeaveEnums.cs`
- `backend/Application/Abstractions/ILeaveService.cs`
- `backend/Application/Features/Leaves/` (All Commands, Queries, DTOs, Validators, Handlers)
- `backend/Infrastructure/Services/LeaveService.cs`
- `backend/Infrastructure/Data/Configurations/LeaveTypeConfiguration.cs`
- `backend/Infrastructure/Data/Configurations/LeaveRequestConfiguration.cs`
- `backend/Infrastructure/Data/Configurations/LeaveApprovalHistoryConfiguration.cs`
- `backend/Infrastructure/Data/Migrations/20261121001955_AddLeaveManagement.cs`
- `backend/API/Controllers/LeavesController.cs`
- `backend/Tests/Leaves/LeaveManagementTests.cs`

### Frontend:
- `frontend/src/modules/leaves/types/index.ts`
- `frontend/src/modules/leaves/services/leaves.service.ts`
- `frontend/src/modules/leaves/components/LeaveStatsCards.tsx`
- `frontend/src/modules/leaves/components/LeaveRequestFormDialog.tsx`
- `frontend/src/modules/leaves/components/LeaveTypeFormDialog.tsx`
- `frontend/src/modules/leaves/components/LeaveReviewDialog.tsx`
- `frontend/src/modules/leaves/components/LeaveRequestDetailsDialog.tsx`
- `frontend/src/modules/leaves/views/LeavesView.tsx`
- `frontend/src/app/(Dashboard)/leaves/page.tsx`
- `frontend/src/i18n/messages/ar.json` & `frontend/src/i18n/messages/en.json`

---

## 8. Missing Features, Blockers & Pending Business Decisions

- **DEC-016 (Retrospective Penalty Reversal):**  
  If an employee incurs a Black Card or penalty due to absence, and later has a retrospective leave approved for that day, should the Points engine automatically trigger a reversal transaction?  
  *Current State:* Reversal can be triggered manually via Administrative Reversal (`ReversePointTransactionCommand`). Automatic link awaits final policy sign-off.
- **Accrual Balance Tracking:**  
  Current system tracks requested days vs maximum allowable limit per leave type. Detailed month-by-month accrual balances belong to P2 payroll integration.

---

## 9. Integration Dependencies with Other Modules

- **MOD-01 (IAM):** Authenticated user token, `ICurrentUser`, role/permission authorization.
- **MOD-02 (Employees):** Subordinate-supervisor relationship graph, employee profiles, department scoping.
- **MOD-04 & MOD-05 (Schedules & Attendance):** When generating daily expected shift roster, days with approved leaves are categorized as `Leave` rather than unexcused absences.
- **MOD-06 (Points):** Leave days do not incur absence penalties; points are neutral during approved leave periods.

---

## 10. Final Status

**FINAL STATUS: READY**

MOD-07 is fully implemented across all Clean Architecture layers and the Next.js 16 frontend, verified with 5 automated integration tests, and ready for deployment and production integration review.
