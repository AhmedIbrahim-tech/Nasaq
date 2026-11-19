# Sharm Photographer — Scope Document v1.0 (Phase 0 Discovery Baseline)

> **Document Status:** Aligned & Consistent Baseline (Phase 0 Audit)  
> **Source Baseline:** `Sharm_Photographer_System_Master_Blueprint.md` & Video `Download.mp4`  
> **Engineering Base:** CoreStarter (.NET 9 Clean Architecture + Next.js 16)  
> **Company Name:** Sharm Photographer  
> **System Purpose:** Internal Employee Attendance & Workforce Management System

---

## 1. Executive Summary & Product Vision
**Sharm Photographer** is an enterprise-grade internal **Smart Attendance and Workforce Management System** designed exclusively for managing the company's internal employees and operational processes across designated physical work locations (such as affiliated hotel sites and branches in Sharm El-Sheikh).

The platform enforces attendance governance, location compliance, and staff motivation:
- Point-in-time geofenced GPS verification performed at the exact moments of **both Check-in and Check-out** (`DEC-005`). Continuous background location tracking is permanently excluded.
- Non-blocking GPS exception pipeline: GPS accuracy failures and out-of-bounds attempts submit to a **`Pending Review`** holding queue with server timestamps preserved, rather than being discarded or hard-rejected (`DEC-006`).
- Dynamic, configurable attendance schedules managed by Admin or Manager via the Admin Console (never hardcoded), with default baseline windows: 07:00–08:00 (Early: +1 Green), 08:00–09:00 (Configurable: Unset), 09:00–10:00 (Normal: 0 points), 10:00–11:00 (Late: Red), 11:00–12:00 (Configurable: Unset), and 12:00 (Attendance Cutoff) (`DEC-003`).
- Formal after-cutoff attendance rules (`DEC-004`): check-ins between Cutoff and Shift End mark the employee as **Present** with a **Black Card** (disciplinary attendance marker; does NOT automatically mean an unexcused absence). Check-ins after Shift End close self-service and require administrative review.
- Mandatory initial MVP support for both arrival (**Check-in**) and departure (**Check-out**) (`DEC-002`).
- A three-tier points economy (Green, Red, Black) with points withheld during `Pending Review` and evaluated retroactively at the original submission timestamp upon admin approval (`DEC-007`).
- Digital governance for leave requests and approvals, exceptional administrative overrides, and transparent audit logging.

> **Clarification of Company Name vs. System Scope (`DEC-001`):**  
> "Sharm Photographer" is strictly the company's organizational name. The software is purely an internal workforce attendance and disciplinary management platform. Photography services, sessions, cameras/equipment, media storage, and customer bookings are **permanently out of scope**.

---

## 2. In-Scope Modules & Capabilities

### Phase 0 / MVP (Priority P0) — Non-Negotiable Core
| Module ID | Module Name | Scope & Core Responsibilities |
|---|---|---|
| **MOD-01** | **Identity & Access Management (IAM)** | Secure authentication, session management, and RBAC (Proposed roles: Employee, Team Lead/Supervisor, Admin, Owner — `DEC-017` OPEN). |
| **MOD-02** | **Organization & People** | Management of internal employees, employment status, work location assignments, and historical assignment timeline. |
| **MOD-03** | **Locations & Geofences** | Definition of physical work locations (assigned hotel sites/branches), center coordinates (latitude/longitude), configurable radius threshold (150m proposed default — `DEC-009` OPEN), and configurable GPS accuracy policies (50m proposed default — `DEC-009` OPEN). |
| **MOD-04** | **Work Schedules & Shifts** | Configuration of recurring workdays, shift times (start, end, arrival windows), arrival classification time windows, and versioned policies (`DEC-003`). All windows, classifications, cutoffs, and shift ends are fully configurable by Admin/Manager with audit trail. Intervals 08:00–09:00 and 11:00–12:00 remain Configurable/Unset (`DEC-022` OPEN). |
| **MOD-05** | **Attendance Engine (Check-in & Check-out)** | **Core MVP Feature (`DEC-002`):** Employee Check-in and Check-out. Dual GPS validation against assigned geofence (`DEC-005`). GPS exception handling: non-blocking submission to `Pending Review` if GPS is off, inaccurate, or out-of-bounds (`DEC-006`). Check-in between Cutoff and Shift End marks Present + assigns Black Card (`DEC-004`). Check-in after Shift End closes self-service (`DEC-004`). Architectural recommendation: separate operation-level statuses (`CheckInStatus`, `CheckOutStatus`, `AttendanceDayStatus`). Duplicate prevention (idempotency) and audit logging for all events. |
| **MOD-06** | **Points & Penalties Engine** | Double-entry ledger (`PointTransaction`) recording Green (+), Red (-), and Black (-) point events. Points are held (zero points/penalties) while an event is in `Pending Review` (`DEC-007`). Upon admin approval, points evaluate retroactively at the original Check-in timestamp (`DEC-007`). Check-out approval does NOT generate arrival points (`DEC-021` OPEN). Distinction enforced: Black Card (punctuality marker for Present employee) vs Black Penalty (unexcused absence strike). Green point consumption model remains OPEN (`DEC-013`). |
| **MOD-07** | **Leave Management** | Employee leave requests (dates, reason), administrative approval/rejection workflows, and automatic exemption from unexcused absence penalties. Retrospective leave penalty reversal policy remains OPEN (`DEC-016`). |
| **MOD-09** | **Admin Operations & Overrides** | Daily operations dashboard, attendance inspection tables (monitoring check-in and check-out status), **GPS Exception & Pending Review Queue** (Approve with retroactive classification at original time or Reject with mandatory reason — `DEC-007`), manual point adjustments with mandatory audit reason, schedule template editor, and review of incomplete attendance records (`DEC-018` OPEN). |
| **MOD-12** | **Audit Trail & System Integrity** | Immutable system-wide logging of all sensitive administrative actions, policy modifications, attendance adjustments, exception decisions, and point reversals. |

### Post-MVP / Priority P1 — High Value Extensions
| Module ID | Module Name | Scope & Core Responsibilities |
|---|---|---|
| **MOD-08** | **Cash Rewards Program** | Tracking eligibility threshold (e.g. 30 Green Points), reward submission, payout review queue, and disbursement tracking (InstaPay / Vodafone Cash). Accumulation cycle (`DEC-014`) and payout currency/methods (`DEC-015`) remain OPEN. |
| **MOD-10** | **In-App Notifications** | Real-time and persistent alerts for shift reminders, leave decision outcomes, reward status updates, and penalty notices. |
| **MOD-11** | **Operational Reporting & Exports** | Filterable attendance summaries, monthly penalty deduction sheets, point balances, and CSV/Excel exports for administrative review. Deductions remain informational until financial integration is approved (`DEC-012` OPEN). |

---

## 3. Permanently Excluded Functionality (Out-of-Scope)

The following capabilities are **permanently excluded** from this software and will NOT be designed, suggested, or implemented in this MVP or any future phase:

1. **Customer & Hotel Bookings / Reservations (`DEC-001`):**
   - No customer-facing booking portals, no hotel photo session reservations, no client scheduling, and no booking CRM. Any appearance of "Hotel Booking System" or "New Booking" in prototype video materials was third-party/mock noise and is completely excluded.
2. **Photography Operations & Media Management (`DEC-001`):**
   - No photography scheduling, photo session workflows, photo galleries, digital asset management, photo delivery portals, or camera/equipment inventory.
3. **Automated Payroll & Direct Banking Disbursement:**
   - The system calculates disciplinary deductions and eligible reward balances, exporting summary ledgers. It does not perform automated payroll tax/insurance withholding or live direct-debit banking API execution.
4. **Continuous Background GPS Location Tracking (`DEC-005` Alignment):**
   - Point-in-time GPS location verification occurs strictly at the moments of **both Check-in and Check-out**. The system does NOT monitor, record, or track employee geographical movements continuously during the shift.
5. **Biometric & Physical Clock Hardware Integration:**
   - Attendance is validated via authenticated user device + verified GPS geofence coordinates; physical fingerprint clocks and facial recognition kiosks are excluded.
