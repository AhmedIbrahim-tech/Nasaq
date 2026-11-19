# Decision Log — NASAQ Project
### Client & Operating Company: Sharm Photographer

> **Lifecycle States:** `OPEN` -> `IN_REVIEW` -> `APPROVED` / `REJECTED`  
> **Classification Labels:** `APPROVED`, `OPEN`, `PROPOSAL`, `EVIDENCE`, `INFERENCE`  
> **Official Product Name:** **NASAQ (نسق)**  
> **Operating Company:** **Sharm Photographer**  
> **Rule:** No code or architecture may assume an unapproved rule. Every approved decision becomes immutable baseline.

---

## 1. Decision Registry Summary

| Decision ID | Domain Area | Short Description | Status | Target Date | Resolution / Impact |
|---|---|---|---|---|---|
| **DEC-001** | Scope Boundary | Customer Booking & Photography Features | `APPROVED — PERMANENTLY EXCLUDED` | 19 Nov 2026 | **Permanently Excluded:** The software is strictly an Internal Employee Attendance & Workforce Management System. Customer bookings, hotel reservations, photography scheduling, cameras/equipment, and media galleries are 100% permanently excluded. |
| **DEC-002** | Attendance Scope | Dual Attendance Actions: Check-in & Check-out in MVP | `APPROVED` | 19 Nov 2026 | **Approved:** Both Check-in (arrival) and Check-out (departure) are mandatory MVP features. Captures server time, links with attendance records, and enables admin review of incomplete records without unapproved penalties. |
| **DEC-003** | Schedule Policy | Configurable Attendance Time Windows & Default Schedule | `APPROVED` | 19 Nov 2026 | **Approved:** Attendance windows are fully configurable by Admin/Manager with audit trail. Defaults: 07:00–08:00 Green (+1), 08:00–09:00 Configurable (Unset), 09:00–10:00 Normal (0), 10:00–11:00 Late (Red), 11:00–12:00 Configurable (Unset), 12:00 Cutoff. Never hardcode schedules. |
| **DEC-004** | Attendance Rules | Check-in After Cutoff & Post-Shift End Governance | `APPROVED` | 19 Nov 2026 | **Approved:** Between Cutoff & Shift End: Employee can check in, marked Present, receives Black Card, notified immediately. After Shift End: Self-service locked, handled via admin review only. Shift end is configurable. Black Card != unexcused absence. |
| **DEC-005** | Geo Policy | Dual GPS Location Validation for Check-in & Check-out | `APPROVED` | 19 Nov 2026 | **Approved:** Point-in-time GPS coordinates and geofence validation against assigned worksite apply to BOTH Check-in and Check-out operations. Continuous background GPS tracking is permanently excluded. |
| **DEC-006** | Exception Handling | GPS Exception Handling: Non-Blocking Submission to Pending Review | `APPROVED` | 19 Nov 2026 | **Approved:** If GPS is unavailable, inaccurate, or outside geofence, employee can still submit. Records server time, GPS diagnostics, sets status to `Pending Review`, displays clear message, and queues for admin review. Never silently discarded. |
| **DEC-007** | Points & Review | Pending Review Holding & Retroactive Evaluation at Original Time | `APPROVED` | 19 Nov 2026 | **Approved:** While Pending Review: zero points/penalties awarded. If Approved: original Check-in timestamp determines classification & points. Check-out approval does NOT generate arrival points. If Rejected: mandatory admin reason, zero points awarded, full audit logged. |
| **DEC-008** | Target Platform | Employee UI Form Factor: Responsive Next.js PWA | `APPROVED` | 19 Nov 2026 | **Approved:** The employee application will use a responsive Progressive Web App (PWA) based on the existing Next.js frontend. Features web manifest, service worker offline shell, installability, Arabic RTL / English LTR support, strictly zero background GPS tracking, and zero GPS requests on startup. |
| **DEC-009** | Geofence Spec | Worksite radius (meters) & minimum GPS accuracy thresholds | `OPEN` | Phase 0 Alignment | Determines exact acceptable GPS precision in meters (`PROPOSAL`: 150m radius, 50m accuracy threshold) |
| **DEC-010** | Attendance Rules | Boundary seconds rules (e.g. 10:00:00 inclusive vs exclusive) | `OPEN` | Phase 0 Alignment | Standardizes on boundary rules (`PROPOSAL`: half-open intervals `[start, end)`) |
| **DEC-011** | Disciplinary Math | Clarify Black Penalty Paradox (`1 × 1,000 = 0 EGP` on demo screen) | `OPEN` | Phase 0 Alignment | Determines exact payroll impact for unexcused absences (`EVIDENCE`: video formula) |
| **DEC-012** | Financial Nature | Binding Payroll Deductions vs Informational Disciplinary Scores | `OPEN` | Phase 0 Alignment | Governs export integration with finance/accounting (250 EGP Red, 1,000 EGP Black in video) |
| **DEC-013** | Points Economy | Green Points consumption model (Burn upon redeem vs. Milestone) | `OPEN` | Phase 0 Alignment | Prevents dual-spending between penalties and rewards (`PROPOSAL`: double-entry ledger debit) |
| **DEC-014** | Reward Program | 30 Green Points Reward: Monthly cycle vs Cumulative bank | `OPEN` | Phase 0 Alignment | Defines point expiration and lifecycle |
| **DEC-015** | Payout Logistics | Reward Currency & Disbursement: USD vs EGP, Manual vs API | `OPEN` | Phase 0 Alignment | Simplifies wallet payout handling (InstaPay / Vodafone Cash in video) |
| **DEC-016** | Leave Handling | Retrospective Leave approval & automated penalty reversal | `OPEN` | Phase 0 Alignment | Determines retroactive absence reconciliation logic |
| **DEC-017** | Roles & Access | 4-Tier Business Roles & Direct Supervisor Assignment Model | `RESOLVED` | Phase 2 Execution | Standardized Clean Architecture RBAC matrix with privilege escalation prevention & approved 1-to-many direct supervisor scoping |
| **DEC-018** | Check-out Rules | Forgotten Check-out Handling & Finalization Policy | `OPEN` | Phase 0 Alignment | Defines how unclosed shifts are finalized at day end (`PROPOSAL`: non-punitive incomplete status) |
| **DEC-019** | Check-out Rules | Early Departure Policy & Impact on Attendance Classification | `OPEN` | Phase 0 Alignment | Determines if early check-out triggers alert or status change (`PROPOSAL`: non-punitive metadata) |
| **DEC-020** | Check-out Rules | Working Hours Calculation & Break Tracking | `OPEN` | Phase 0 Alignment | Determines whether net shift duration is calculated/displayed (`PROPOSAL`: elapsed presence only) |
| **DEC-021** | Check-out Rules | Check-out Impact on Points System (Green/Red/Black) | `OPEN` | Phase 0 Alignment | Clarifies whether check-out generates/modifies points (`PROPOSAL`: zero point impact) |
| **DEC-022** | Schedule Config | Initial classification for configurable intervals (08-09, 11-12) | `OPEN` | Phase 0 Alignment | Initial default classification remains UNSET until configured by Admin/Manager |
| **DEC-023** | Exception Policy | Absence Classification & Disciplinary Policy for Rejected Exceptions | `OPEN` | Phase 0 Alignment | Rejection does NOT automatically create Black Penalty; requires explicit absence policy definition |
| **DEC-024** | Operations | Post-Shift Absence Finalization Timeline and Procedure | `OPEN` | Phase 0 Alignment | Defines procedure for closing shifts after shift end passes without check-in |

---

## 2. Detailed Decision Sheets

### DEC-001: Customer Booking & Photography Functionality Scope
- **Date Decided:** 19 November 2026
- **Decision Status:** `APPROVED — PERMANENTLY EXCLUDED`
- **Owner Resolution:** The project owner confirmed that "Sharm Photographer" is solely the company name. The software is exclusively an internal employee attendance and workforce management system. Customer photo booking, hotel reservations, client CRM, photo session scheduling, equipment/media management, and all photography-related features are permanently out of scope. They are NOT deferred; they are permanently excluded.
- **Architectural Impact:** No booking entities, interfaces, tables, or modules will be created or planned.

### DEC-002: Check-in & Check-out Dual Attendance Integration in MVP
- **Date Decided:** 19 November 2026
- **Decision Status:** `APPROVED`
- **Owner Resolution:** Both employee Check-in (arrival) and Check-out (departure) are essential core features of the initial MVP. Check-in performs server-time stamping, GPS geofence validation, arrival window classification, and points/penalty events. Check-out captures departure timestamp using server time, links with the existing attendance record and shift, and enables administrator oversight of incomplete records without unapproved penalties.

### DEC-003: Configurable Attendance Time Windows & Default Schedule
- **Date Decided:** 19 November 2026
- **Decision Status:** `APPROVED`
- **Owner Resolution:** Attendance schedules must be dynamically configurable by Admin or Manager via the Admin Console. Schedules must never be hardcoded. Every modification records the acting user and timestamp in the audit log.
- **Initial Default Schedule:**
  - `07:00 – 08:00`: Green (+1 Green Point)
  - `08:00 – 09:00`: Configurable (Default unset — `DEC-022` OPEN)
  - `09:00 – 10:00`: Normal (On-Time, 0 points)
  - `10:00 – 11:00`: Red (Red Penalty)
  - `11:00 – 12:00`: Configurable (Default unset — `DEC-022` OPEN)
  - `12:00`: Attendance Cutoff (Configurable)
  - `Configurable`: Shift End

### DEC-004: Attendance After Cutoff & Post-Shift End Governance
- **Date Decided:** 19 November 2026
- **Decision Status:** `APPROVED`
- **Owner Resolution:**
  - **Between Cutoff and Shift End:** Employee can still submit check-in. The system records the actual attendance timestamp, marks attendance status as **Present** (not Absent), assigns a **Black Card**, and displays an immediate notice to the employee. A Black Card is a punctuality marker for a present employee and does NOT automatically imply an unexcused absence or monetary deduction.
  - **After Shift End:** Self-service check-in is permanently closed for the expired shift. The employee cannot register independently; the case must be submitted to or resolved through administrative review (`DEC-024` OPEN).
  - **Configurability:** Shift end time must be fully configurable per schedule template.

### DEC-005: Dual GPS Location Validation for Check-in and Check-out
- **Date Decided:** 19 November 2026
- **Decision Status:** `APPROVED`
- **Owner Resolution:** Point-in-time GPS coordinate capture and geofence validation against assigned worksite coordinates apply to both Check-in (arrival) and Check-out (departure) operations. Continuous background location tracking is permanently excluded.

### DEC-006: GPS Exception Handling (Non-Blocking Submission to Pending Review)
- **Date Decided:** 19 November 2026
- **Decision Status:** `APPROVED`
- **Owner Resolution:** If GPS is unavailable (disabled/error/accuracy failure) or the employee is outside the assigned geofence during either Check-in or Check-out:
  1. The system allows the employee to submit the attendance operation (never silently discarded or hard-blocked).
  2. Records authoritative server timestamp.
  3. Stores available GPS coordinates/telemetry and failure reason code.
  4. Sets operation status to `Pending Review`.
  5. Displays an informative message to the employee.
  6. Automatically queues the case in the Administrator Review Queue.

### DEC-007: Pending Review Points Holding & Retroactive Evaluation
- **Date Decided:** 19 November 2026
- **Decision Status:** `APPROVED`
- **Owner Resolution:**
  - While an operation is `Pending Review`: Zero Green points are awarded, and zero Red or Black penalties are generated. The original attendance timestamp is preserved.
  - **Upon Admin Approval of Check-in:** The original attendance event is accepted. Arrival classification and point/penalty rules are evaluated based on the **original submission timestamp**, NOT the approval timestamp.
  - **Upon Admin Approval of Check-out:** The departure event is approved and recorded. Check-out does NOT evaluate arrival classification and does NOT generate arrival points (`DEC-021` OPEN).
  - **Upon Admin Rejection:** Operation is marked rejected with a mandatory administrative justification reason. Zero points are awarded. A rejected Check-in does NOT automatically create an unexcused absence or Black Penalty (`DEC-023` OPEN). Full audit history is logged.

### DEC-008: Employee Application Delivery Platform (Responsive PWA)
- **Date Decided:** 19 November 2026
- **Decision Status:** `APPROVED`
- **Owner Resolution:** The employee application will be implemented as a responsive Progressive Web App (PWA) based on the existing Next.js frontend template. The application includes a Web App Manifest, Service Worker for basic offline application shell caching, installability metadata, and a mobile-first responsive layout.
- **Security & Architectural Boundaries:**
  1. Strictly zero caching of authenticated API endpoints or responses.
  2. Strictly zero caching of personal employee records, attendance history, or tokens in the service worker.
  3. Strictly zero background GPS tracking.
  4. Strictly zero GPS permission requests upon application startup (GPS requested point-in-time only during explicit Check-in or Check-out).
  5. Native bi-directional layout: Arabic RTL and English LTR.

### DEC-017: Approved 4-Tier Business Role Hierarchy & Direct Supervisor Assignment Model
- **Date Decided:** 19 November 2026
- **Decision Status:** `RESOLVED / APPROVED`
- **Owner Resolution:** Approved the canonical 4-tier business roles and the Direct Supervisor Assignment model for NASAQ:
  1. `SuperAdmin`: Full system control & administrative access; highest authority.
  2. `Admin`: Manages employee records; administrative access per approved permissions; cannot grant or escalate anyone to SuperAdmin.
  3. `Supervisor`: Accesses and monitors employees within their assigned direct supervision scope; no unrestricted or global administrative access.
  4. `Employee`: Accesses own account and personal employee info only; cannot view others' records.
- **Approved Direct Supervisor Model Rules:**
  - **1-to-Many Direct Relationship:** Each employee can have at most one directly assigned supervisor at a time; a supervisor can manage multiple employees.
  - **Administrative Authority:** Only `SuperAdmin` and `Admin` have authority to assign, modify, or clear an employee's supervisor.
  - **Server-Side Scoped Visibility:** Supervisors can view ONLY their directly assigned employees in lists, details, and attendance queries.
  - **Fail-Closed Unassigned Employee Protection:** An employee without an assigned supervisor (`SupervisorId == null`) MUST NOT appear in any supervisor's employee list; direct query attempts by supervisors return 403 Forbidden.
  - **Cross-Supervisor Isolation:** Supervisors cannot access employees assigned to another supervisor (filtered from list; 403 Forbidden on detail query).
  - **Boundary & Anti-Escalation Rules:**
    - Employees cannot assign or change their own supervisors.
    - Supervisors cannot assign employees to themselves or to other supervisors.
    - Self-supervision is strictly prohibited (`SupervisorId != Employee.Id`).
    - Candidates for supervisor assignment must have an active employee record and a linked user account possessing `Supervisor`, `Admin`, or `SuperAdmin` role.
  - **Persistence & Integrity:** Configured with `DeleteBehavior.Restrict` on `Employee.SupervisorId` to prevent SQL Server cascade cycles, combined with soft-deletion (`IsActive = false`).
- **Architectural & Security Mandate:**
  - Strictly ZERO `Owner` role, `Owner` alias, or `Owner` permission bypass.
  - All role and scoping checks are strictly enforced server-side in CQRS query/command handlers.

