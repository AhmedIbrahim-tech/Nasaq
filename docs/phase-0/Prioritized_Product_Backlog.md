# Prioritized Product Backlog — Sharm Photographer

> **Priority Framework:**  
> - **P0 (MVP):** Core operations, attendance tracking, disciplinary enforcement, leave governance, admin controls.  
> - **P1 (Post-MVP):** Rewards payout tracking, notification center, advanced exportable reporting.  
> - **P2 (Future):** Automated payroll disbursement APIs, advanced analytics, native device sensors.

---

## 1. P0 Backlog (MVP Core)

| Story ID | Epic | User Story | Minimum Acceptance Criteria |
|---|---|---|---|
| **US-001** | IAM | As an **Employee**, I want to securely log in with my credentials so that I can access my attendance portal. | Single-session token generation, secure password hashing, role enforcement, responsive mobile layout. |
| **US-002** | Attendance | As an **Employee**, I want to see today's shift status, scheduled times, check-in status, and check-out CTA on my home screen. | Displays assigned work location, current arrival/departure window, GPS status, check-in button (if not checked in), check-out button (after checked in), and departure confirmation. |
| **US-003** | Attendance | As an **Employee**, I want to check in during open arrival windows so that my attendance is validated against the configured schedule and worksite geofence. | Reads device coordinates, calculates distance to site center, validates geofence, creates single arrival record, assigns configured classification (Early/Normal/Late), posts eligible points. |
| **US-004** | Attendance | As an **Employee**, I want to check in if I arrive after the cutoff but before shift end so that I am marked Present rather than Absent. | Checks in between Cutoff and Shift End, captures server timestamp, sets status to `Present`, assigns a `Black Card` (punctuality marker; does NOT imply unexcused absence), displays immediate notice to employee. |
| **US-005** | Attendance | As an **Employee**, I want clear guidance if I attempt to check in after shift end so that I know self-service is closed and can request admin review. | Checks in after Shift End, blocks self-service check-in (`DEC-004`), displays notice: "Shift ended; attendance must be reviewed by administrator", provides action to submit for review (`DEC-024` OPEN). |
| **US-006** | Attendance | As an **Employee**, I want to submit my check-in or check-out even if GPS is unavailable or outside geofence so that my timestamp is recorded for administrative review. | Non-blocking submission (`DEC-006`), stores authoritative server timestamp and GPS diagnostics, transitions affected operation to `Pending Review`, displays clear message, queues case for admin review. Zero points awarded while pending (`DEC-007`). |
| **US-007** | Attendance | As an **Employee**, I want to explicitly check out upon shift completion so that my departure timestamp and location are officially recorded. | Explicit employee trigger, captures server timestamp and GPS coordinates (`DEC-005`), validates geofence (or routes to Pending Review if geo fails — `DEC-006`), links to active attendance record, marks completed. Zero points deducted (`DEC-021` OPEN). |
| **US-008** | Attendance | As an **Employee**, I want to view my past attendance history showing both check-in and check-out timestamps, shift statuses, and review decisions. | Chronological list of past dates, check-in and check-out times, status badges (Early, On-Time, Late, Present with Black Card, Pending Review, Incomplete, Absent, Leave), and pagination. Separates Check-in and Check-out review states. |
| **US-009** | Points | As an **Employee**, I want to see my current Green, Red, and Black point counters and detailed transaction ledger. | Live balance cards, scrollable transaction log with event type, delta (+/-), date, reason, and effective balance. Reflects held points while records are in Pending Review. |
| **US-010** | Points | As an **Employee**, I want to redeem my Green Points to clear active Red penalties or eligible Black penalties so that my deductions are removed. | Validates point sufficiency (1 Green for 1 Red; 5 Green for 1 Black Penalty for unexcused absence; Black Card redemption rules remain subject to policy approval), atomic ledger debit (`DEC-013` OPEN), status update of penalty to `waived_by_points`. |
| **US-011** | Leaves | As an **Employee**, I want to submit a leave request with a date range and optional notes so that I can schedule time off. | Start date <= End date validation, duplicate range check, status set to `Pending`, immediate confirmation receipt. Retrospective reversal policy remains OPEN (`DEC-016`). |
| **US-012** | Leaves | As an **Admin**, I want to review pending leave requests and approve or reject them so that shift coverage is maintained. | Pending queue filter, detailed view with staff history, one-tap Approve/Reject with optional rejection reason. |
| **US-013** | Schedules | As an **Admin/Manager**, I want to configure shift working days, time windows, classifications, cutoffs, and shift ends so that attendance rules match operational needs. | Editable time windows (Early, Normal, Late, Configurable, Cutoff, Shift End), configurable classifications, continuous interval validation, immutable audit log of editor & timestamp (`DEC-003`). Intervals 08:00–09:00 and 11:00–12:00 remain UNSET until configured (`DEC-022` OPEN). Never hardcoded. |
| **US-014** | Locations | As an **Admin**, I want to manage worksites, GPS coordinates, and geofence radius so that staff are correctly localized. | Interactive map picker, latitude/longitude validation, configurable radius (150m proposed default — `DEC-009` OPEN), accuracy threshold (50m proposed default — `DEC-009` OPEN), activate/deactivate toggle. |
| **US-015** | Operations | As an **Admin**, I want to review the GPS Exception Queue (Pending Review) and approve or reject attendance records by operation type. | List of pending exceptions with GPS diagnostics and failure reason. **Check-in Approve:** accepts event, evaluates classification at original timestamp, applies approved points (`DEC-007`). **Check-out Approve:** accepts departure timestamp, does NOT generate arrival points (`DEC-021` OPEN). **Reject:** requires mandatory reason, awards zero points, does NOT automatically create a Black Penalty (`DEC-023` OPEN). Full audit logging. |
| **US-016** | Points | As an **Admin**, I want to manually award or deduct points for staff with a mandatory written reason so that exceptions can be handled fairly. | Employee selector, point type, integer delta, mandatory reason input, permanent audit trail logging. |
| **US-017** | Operations | As an **Admin**, I want a daily attendance monitoring grid displaying both check-in and check-out times, GPS distance, and complete vs incomplete vs pending status. | Real-time tabular grid, multi-column sorting, search by employee name, filter by worksite, check-in status, missing check-out flag, and pending review state. |
| **US-018** | Operations | As an **Admin**, I want to review and correct incomplete attendance records (e.g. forgotten check-out) with a mandatory reason so that records are accurate without applying unapproved penalties. | Displays incomplete record queue, manual departure time input, mandatory written rationale, immutable audit logging, no automatic point penalty. |
| **US-019** | Audit | As an **Admin/Owner**, I want an immutable audit log of all managerial actions (point adjustments, record corrections, policy edits, exception decisions) so that accountability is guaranteed. | Chronological log of actor, action, target entity, before/after snapshot, IP address, and timestamp. |
| **US-020** | Workforce | As an **Admin/SuperAdmin**, I want to manage employee profiles, provision system user accounts, and assign direct supervisors so that operational hierarchy and server-side data scoping are strictly enforced. | Direct supervisor assignment (1-to-many), server-side scoped queries (Supervisors view only assigned staff; unassigned hidden fail-closed), self-supervision prevention, active role validation, full audit trail. |
| **US-025** | Workforce | As an **Admin**, I want to optionally upload a profile photo when creating an employee so that staff identities are visually verifiable with transactional rollback safety. | Single API request & single Save action, optional image preview and selection (JPG, PNG, WebP up to 10MB), atomic UoW transaction, stored in `StoredFiles` under employee GUID directory, compensation cleanup of physical files on failure, unapplied EF Core migration. |

---

## 2. P1 Backlog (Post-MVP High Value)

| Story ID | Epic | User Story | Minimum Acceptance Criteria |
|---|---|---|---|
| **US-021** | Rewards | As an **Employee**, I want to track my progress toward the 30 Green Points reward and submit a payout request with my InstaPay / Vodafone Cash details. | Dynamic progress bar (x/30), unlock button when balance >= 30, payment method dropdown, masked phone number input, point reservation lock. |
| **US-022** | Rewards | As an **Admin/Finance**, I want to review submitted reward claims, verify payment details, and mark payouts as Approved/Paid. | Claim queue, status transitions (Pending -> Approved -> Paid), audit record, final deduction of reserved points. |
| **US-023** | Notifications | As an **Employee**, I want to receive in-app notifications when my leave is approved, a penalty is incurred, or a reward is processed. | Bell icon with unread badge count, notification list, tap-to-navigate to relevant detail view. |
| **US-024** | Reporting | As an **Admin/Owner**, I want to export monthly attendance and deduction summary sheets to Excel/CSV for payroll processing. | Date range picker, staff breakdown, check-in/out timestamps, total early days, total late days, active deductions sum, one-click CSV export. |

---

## 3. Engineering Implementation, Verification & Closure Audit Status (21 Nov 2026)

### Consolidated Audit Report: [FINAL-CLOSURE-REPORT.md](file:///d:/Projects/NASAQ/docs/reviews/final-closure/FINAL-CLOSURE-REPORT.md)

### Detailed Independent Review Reports:
1. **MOD-04 Schedules & Shifts:** [MOD-04-SHIFTS-REVIEW.md](file:///d:/Projects/NASAQ/docs/reviews/final-closure/MOD-04-SHIFTS-REVIEW.md) — **READY FOR CLOSURE**
2. **MOD-05 Attendance Engine:** [MOD-05-ATTENDANCE-REVIEW.md](file:///d:/Projects/NASAQ/docs/reviews/final-closure/MOD-05-ATTENDANCE-REVIEW.md) — **READY FOR CLOSURE (Core Operations)**
3. **MOD-06 Points & Penalties:** [MOD-06-POINTS-REVIEW.md](file:///d:/Projects/NASAQ/docs/reviews/final-closure/MOD-06-POINTS-REVIEW.md) — **READY FOR CLOSURE**
4. **Profile Photos Immediate Sync:** [PROFILE-PHOTOS-REVIEW.md](file:///d:/Projects/NASAQ/docs/reviews/final-closure/PROFILE-PHOTOS-REVIEW.md) — **VERIFIED FIXED & CLOSED**
5. **Profile Data Synchronization:** [PROFILE-DATA-REVIEW.md](file:///d:/Projects/NASAQ/docs/reviews/final-closure/PROFILE-DATA-REVIEW.md) — **VERIFIED FIXED & CLOSED**
6. **Unexpected Logout Elimination:** [AUTH-LOGOUT-REVIEW.md](file:///d:/Projects/NASAQ/docs/reviews/final-closure/AUTH-LOGOUT-REVIEW.md) — **VERIFIED FIXED & CLOSED**
7. **CRUD Table Refresh & Anti-Flicker:** [CRUD-REFRESH-REVIEW.md](file:///d:/Projects/NASAQ/docs/reviews/final-closure/CRUD-REFRESH-REVIEW.md) — **VERIFIED FIXED & CLOSED**

### P0 User Stories Verified Status Matrix:
| Story ID | Domain Area | Implemented? | Tested? | Status | Verified Evidence |
|---|---|---|---|---|---|
| **US-001** | IAM | Yes | Yes | **CLOSED** | JWT rotation, secure sessions, RBAC |
| **US-002** | Attendance Status | Yes | Yes | **CLOSED** | `AttendanceStatusCard.tsx`, `GetCurrentAttendanceStatus` |
| **US-003** | Arrival Check-in | Yes | Yes | **CLOSED** | Test `WorkflowA` in `IntegratedWorkflowsTests.cs` |
| **US-004** | Check-in After Cutoff (DEC-004) | Yes | Yes | **CLOSED** | Test `WorkflowF` in `IntegratedWorkflowsTests.cs` |
| **US-005** | Post-Shift End Notice (DEC-004) | Yes | Yes | **CLOSED** | `ShiftResolutionService.cs` |
| **US-006** | Non-blocking GPS Exception (DEC-006) | Yes | Yes | **CLOSED** | Test `WorkflowC` in `IntegratedWorkflowsTests.cs` |
| **US-007** | Departure Check-out (DEC-002) | Yes | Yes | **CLOSED** | Test `WorkflowA` & `WorkflowG` |
| **US-008** | Attendance History | Yes | Yes | **CLOSED** | `GetMyAttendanceHistoryQuery`, `AttendanceHistoryTable` |
| **US-009** | Points Counters & Ledger | Yes | Yes | **CLOSED** | `GetMyPointsSummaryQuery`, `PointsLedgerTable` |
| **US-010** | Points Redemption | Partial | Pending Policy | **OPEN** | Dependent on owner policy approval (`DEC-013`, `DEC-014`) |
| **US-011** | Submit Leave Request (MOD-07) | Yes | Yes | **CLOSED** | `LeaveManagementTests.cs` |
| **US-012** | Review Leave Request (MOD-07) | Yes | Yes | **CLOSED** | `LeaveManagementTests.cs` |
| **US-013** | Configure Schedules & Shifts (MOD-04) | Yes | Yes | **CLOSED** | `ShiftResolutionTests.cs`, `/schedules` |
| **US-014** | Manage Worksites & Geofences (MOD-03) | Yes | Yes | **CLOSED** | `GeofenceServiceTests.cs`, `/locations` |
| **US-015** | Admin Exception Review Queue | Foundations in DB | Blocked by MOD-09 | **PENDING MOD-09** | Records held in `PendingReview`; UI queue belongs to MOD-09 |
| **US-016** | Manual Point Adjustments / Reversals | Yes | Yes | **CLOSED** | Test `WorkflowE` in `IntegratedWorkflowsTests.cs` |
| **US-017** | Attendance Monitoring Grid | Yes | Yes | **CLOSED** | `GetAttendanceRecordsQuery`, `/attendance` |
| **US-018** | Incomplete Attendance Review | Foundations in DB | Blocked by MOD-09 | **PENDING MOD-09** | Belongs to administrative exception review in MOD-09 |
| **US-019** | Immutable Audit Trail | Yes | Yes | **CLOSED** | `AuditSaveChangesInterceptor.cs` |
| **US-020** | Workforce & Supervisors (MOD-02) | Yes | Yes | **CLOSED** | `AuthorizationTests.cs` (Scenarios 1-12) |
| **US-025** | Profile Photo Rollback & Storage | Yes | Yes | **CLOSED** | `EmployeeProfilePhotoTests.cs` (10/10 Passed) |
