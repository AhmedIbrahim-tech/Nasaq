# Critical Decisions Requiring Project Owner Approval — NASAQ
### Client & Operating Company: Sharm Photographer

> **Document Status:** Aligned & Consistent Baseline (Phase 0 Audit)  
> **Official Product Name:** **NASAQ (نسق)**  
> **Operating Company:** **Sharm Photographer**  
> **Classification Labels:** `APPROVED`, `OPEN`, `PROPOSAL`, `EVIDENCE`, `INFERENCE`  
> **Governance Rule:** Never assume an unapproved rule. Present one decision at a time, provide senior engineering recommendations, and await owner authorization.

---

## 1. Resolved & Closed Critical Decisions

### DEC-001: Customer Booking & Photography Functionality Scope
- **Status:** `APPROVED — PERMANENTLY EXCLUDED` (Resolved 19 Nov 2026)
- **Resolution:** "Sharm Photographer" is solely the company name. The software is strictly an Internal Employee Attendance & Workforce Management System. Customer photo session bookings, hotel reservations, photography scheduling, equipment, galleries, and all customer-facing photography operations are **permanently out of scope**.

### DEC-002: Check-in & Check-out Dual Attendance Integration in MVP
- **Status:** `APPROVED` (Resolved 19 Nov 2026)
- **Resolution:** Both employee Check-in (arrival) and Check-out (departure) are essential core features of the initial MVP. Check-in performs server-time stamping, GPS geofence validation, arrival window classification, and points/penalty events. Check-out captures departure timestamp using server time, links with the existing attendance record and shift, and enables administrator oversight of incomplete records without unapproved penalties.

### DEC-003: Configurable Attendance Time Windows & Default Schedule
- **Status:** `APPROVED` (Resolved 19 Nov 2026)
- **Resolution:** Attendance schedules must be dynamically configurable by Admin or Manager via the Admin Console. Schedules must never be hardcoded. Every modification records the acting user and timestamp in the audit log.
- **Initial Default Schedule:**
  - `07:00 – 08:00`: Green (+1 Green Point)
  - `08:00 – 09:00`: Configurable (Default unset — `DEC-022` OPEN)
  - `09:00 – 10:00`: Normal (On-Time, 0 points)
  - `10:00 – 11:00`: Red (Red Penalty)
  - `11:00 – 12:00`: Configurable (Default unset — `DEC-022` OPEN)
  - `12:00`: Attendance Cutoff (Configurable)
  - `Configurable`: Shift End

### DEC-004: Attendance After Cutoff & Post-Shift End Governance
- **Status:** `APPROVED` (Resolved 19 Nov 2026)
- **Resolution:**
  - **Between Cutoff and Shift End:** Employee can still submit check-in. The system records the actual attendance timestamp, marks attendance status as **Present** (not Absent), assigns a **Black Card**, and displays an immediate notice to the employee. A Black Card is a punctuality marker for a present employee and does NOT automatically imply an unexcused absence or monetary deduction.
  - **After Shift End:** Self-service check-in is permanently closed for the expired shift. The employee cannot register independently; the case must be submitted to or resolved through administrative review (`DEC-024` OPEN).
  - **Configurability:** Shift end time must be fully configurable per schedule template.

### DEC-005: Dual GPS Location Validation for Check-in and Check-out
- **Status:** `APPROVED` (Resolved 19 Nov 2026)
- **Resolution:** Point-in-time GPS coordinate capture and geofence validation against assigned worksite coordinates apply to both Check-in (arrival) and Check-out (departure) operations. Continuous background location tracking is permanently excluded.

### DEC-006: GPS Exception Handling (Non-Blocking Submission to Pending Review)
- **Status:** `APPROVED` (Resolved 19 Nov 2026)
- **Resolution:** If GPS is unavailable (disabled/error/accuracy failure) or the employee is outside the assigned geofence during either Check-in or Check-out:
  1. The system allows the employee to submit the attendance operation (never silently discarded or hard-blocked).
  2. Records authoritative server timestamp.
  3. Stores available GPS coordinates/telemetry and failure reason code.
  4. Sets operation status to `Pending Review`.
  5. Displays an informative message to the employee.
  6. Automatically queues the case in the Administrator Review Queue.

### DEC-007: Pending Review Points Holding & Retroactive Evaluation
- **Status:** `APPROVED` (Resolved 19 Nov 2026)
- **Resolution:**
  - While an operation is `Pending Review`: Zero Green points are awarded, and zero Red or Black penalties are generated. The original attendance timestamp is preserved.
  - **Upon Admin Approval of Check-in:** The original attendance event is accepted. Arrival classification and point/penalty rules are evaluated based on the **original submission timestamp**, NOT the approval timestamp.
  - **Upon Admin Approval of Check-out:** The departure event is approved and recorded. Check-out does NOT evaluate arrival classification and does NOT generate arrival points (`DEC-021` OPEN).
  - **Upon Admin Rejection:** Operation is marked rejected with a mandatory administrative justification reason. Zero points are awarded. A rejected Check-in does NOT automatically create an unexcused absence or Black Penalty (`DEC-023` OPEN). Full audit history is logged.

### DEC-008: Employee UI Target Delivery Platform (Responsive Next.js PWA)
- **Status:** `APPROVED` (Approved for Phase 1 Kickoff)
- **Owner Resolution:** The employee experience will be delivered as a responsive Progressive Web App (PWA) using the Next.js 16 frontend framework.
- **Specifications & Boundaries:** Includes web application manifest, service worker for safe static asset / public shell caching, installability, Arabic RTL / English LTR support, zero background GPS tracking, and no GPS requests during application startup. Zero caching of API responses, tokens, or employee personal data.

---

## 2. Active Unresolved Decisions Requiring Owner Approval

> **Important Constraint:** No business rule, financial penalty, or attendance policy below may be assumed or implemented without explicit owner approval. Recommendations are labeled `PROPOSAL`.

### Category 2: Geofence & Boundary Specifications
- **DEC-009: Worksite Geofence Radius & Minimum GPS Accuracy Thresholds**
  * *Status:* `OPEN`
  * *Question:* What are the exact default values for worksite geofence radius (meters) and minimum acceptable device GPS accuracy radius (meters)?
  * *PROPOSAL:* Default worksite radius to 150 meters and accuracy threshold to 50 meters, maintaining full configurability per worksite.
- **DEC-010: Second Boundary Disambiguation**
  * *Status:* `OPEN`
  * *Question:* What is the exact mathematical boundary rule for seconds (e.g. is 10:00:00 Normal or Late)?
  * *PROPOSAL:* Standardize on half-open intervals `[start, end)`. E.g., `10:00:00` belongs to Late, while `09:59:59` belongs to Normal.

### Category 3: Financial & Disciplinary Rules
- **DEC-011: Black Penalty Disciplinary Math & Formula Paradox**
  * *Status:* `OPEN`
  * *Question:* In the reference video, the Black absence breakdown displays `1 × 1,000 EGP = 0 EGP`. Does an unexcused absence directly incur a 1,000 EGP deduction, or is the first absence in a period forgiven/informational?
  * *EVIDENCE:* Prototype video displays `1 × 1,000 EGP = 0 EGP`.
- **DEC-012: Financial Nature of Penalties (Binding Payroll Deductions vs Informational Scores)**
  * *Status:* `OPEN`
  * *Question:* Are the penalty values (250 EGP for Red, 1,000 EGP for Black) binding payroll deductions subtracted from salary at month-end, or internal performance/disciplinary KPI points?
  * *EVIDENCE:* Prototype video displays deduction amounts; financial integration is not confirmed.

### Category 4: The Points Economy & Redemptions
- **DEC-013: Green Points Consumption & Dual-Spending Prevention Model**
  * *Status:* `OPEN`
  * *Question:* When an employee uses Green points to eliminate an eligible penalty (e.g., 1 Green for 1 Red; 5 Green for 1 Black Penalty), are those Green points permanently burned/debited from their balance, or do they remain valid toward the 30-point cash reward?
  * *PROPOSAL:* Strict double-entry ledger debit (`delta = -1` or `-5`) to prevent double-spending.
- **DEC-014: 30 Green Points Reward Lifecycle & Reset Cycle**
  * *Status:* `OPEN`
  * *Question:* Does claiming the 30 Green points reward consume 30 Green points from the balance, and does the Green point balance reset to zero monthly or accumulate across months?
- **DEC-015: Reward Currency, Parity & Disbursement Logistics**
  * *Status:* `OPEN`
  * *Question:* How is the reward payout calculated and disbursed? Is it pegged to USD ($40) or fixed in EGP (~2,200 EGP)? Are payments executed via manual administrative mobile transfer (InstaPay / Vodafone Cash) and marked "Paid" in the system, or via an automated API?

### Category 5: Operations, Leaves & Roles
- **DEC-016: Retrospective Leave Approvals & Automated Penalty Reversal**
  * *Status:* `OPEN`
  * *Question:* If a leave request is submitted and approved after an unexcused absence penalty has already been generated, does the system automatically create a reversal transaction to restore the employee's standing?
  * *PROPOSAL:* Implement an automated reversal transaction (`reversal_of: TX-XXX`) linked to the leave approval event with full audit logging.
- **DEC-017: Approved 4-Tier Business Role Hierarchy & Direct Supervisor Assignment Model**
  * *Status:* `RESOLVED / APPROVED`
  * *Resolution:* The project owner has approved the definitive 4-tier business role hierarchy and the Direct Supervisor Assignment model:
    1. `SuperAdmin`: Full system control & administrative access; highest system authority.
    2. `Admin`: Manages employee records; administrative access per approved permissions; cannot grant or escalate anyone to SuperAdmin.
    3. `Supervisor`: Accesses and monitors employees within their directly assigned supervision scope; no unrestricted or global administrative access.
    4. `Employee`: Accesses own account and personal employee info only; cannot view others' records.
  * *Direct Supervisor Model Rules:*
    - 1-to-many relationship: each employee can have at most one directly assigned supervisor at a time; a supervisor manages multiple employees.
    - SuperAdmin and Admin have exclusive authority to assign, modify, or clear an employee's supervisor.
    - Server-side scoped visibility: supervisors can view ONLY their directly assigned employees. Employees without an assigned supervisor (`SupervisorId == null`) do not appear in any supervisor's list, and direct query attempts return 403 Forbidden.
    - Self-supervision is strictly prohibited (`SupervisorId != Employee.Id`).
    - Candidates for supervisor must possess active employee records and linked user accounts with `Supervisor`, `Admin`, or `SuperAdmin` roles.
  * *Security Mandate:* Zero Owner role, Owner alias, or Owner permission bypass.

### Category 6: Check-out Specific Unresolved Decisions
- **DEC-018: Forgotten Check-out Handling & Finalization Policy**
  * *Status:* `OPEN`
  * *Question:* How should forgotten check-outs (open records past daily cutoff) be finalized?
  * *PROPOSAL:* Transition status to `incomplete` for administrative review. Admin can enter verified departure time or close at scheduled end with mandatory written reason. Zero automatic financial or point penalties.
- **DEC-019: Early Departure Disciplinary Policy & Attendance Impact**
  * *Status:* `OPEN`
  * *Question:* Does checking out before scheduled shift end incur any penalty, affect classification, or remain purely informational?
  * *PROPOSAL:* In MVP, record departure timestamp and flag as `early_departure` for reporting only. Zero point deductions.
- **DEC-020: Net Working Hours Calculation & Break Tracking**
  * *Status:* `OPEN`
  * *Question:* Should the system compute net working hours (`check_out - check_in`) and track breaks in MVP?
  * *PROPOSAL:* Display total elapsed presence hours as informational data on receipts; defer complex break management to post-MVP.
- **DEC-021: Check-out Impact on Points Economy**
  * *Status:* `OPEN`
  * *Question:* Does check-out have any impact on Green, Red, or Black points?
  * *PROPOSAL:* Check-out should have **zero impact** on the points economy. Point awards and penalties remain strictly tied to arrival punctuality and unexcused absences.
- **DEC-022: Initial Classification of Configurable Intervals (08:00–09:00, 11:00–12:00)**
  * *Status:* `OPEN`
  * *Question:* What should be the initial system assignment for the two default configurable intervals before admin modification?
  * *CURRENT STATE:* Remains **UNSET** until explicitly configured by Admin/Manager per worksite policy (`DEC-003`).

### Category 7: Exception & Absence Policy Decisions (New)
- **DEC-023: Absence Classification & Disciplinary Policy for Rejected Attendance Exceptions**
  * *Status:* `OPEN`
  * *Question:* When an administrator rejects a pending Check-in exception (meaning attendance evidence was not accepted), what specific absence status is assigned (e.g. unexcused absence, review required), and does it generate a Black Penalty?
  * *PROPOSAL:* Do not automatically generate a Black Penalty upon rejection. Transition record to `rejected_attendance` and route to standard absence reconciliation.
- **DEC-024: Post-Shift Absence Finalization Timeline and Administrative Procedure**
  * *Status:* `OPEN`
  * *Question:* When an employee fails to check in before shift end (self-service check-in permanently closes under `DEC-004`), when and how is the unexcused absence officially finalized and recorded in the points ledger?
  * *PROPOSAL:* An automated end-of-day reconciliation job marks unfulfilled shifts as `absent_pending`, allowing a grace window for administrative exception entry before generating disciplinary strikes.
