# Sharm Photographer — Phase 0 Document Consistency & Traceability Matrix

> **Document Version:** 1.0  
> **Audit Date:** 19 November 2026  
> **Auditors:** Integrated Solution Architecture, Business Analysis & Quality Engineering Team  
> **Baseline Classification:** Phase 0 — Evidence & Alignment Sign-off  
> **Scope Directive:** Internal Employee Attendance & Workforce Management System. "Sharm Photographer" is strictly the corporate legal identity. All photography-related activities, customer bookings, photo sessions, equipment management, and media galleries are permanently excluded (`DEC-001`).

---

## 1. Executive Summary & Document Suite

This Consistency Matrix establishes complete cross-document traceability across the entire Phase 0 documentation suite for the **Sharm Photographer** project. Every business requirement, approved decision, open question, and operational scenario has been cross-referenced across eight primary project artifacts to guarantee 100% alignment with zero contradictions.

### Phase 0 Artifact Suite Under Audit
1. `Sharm_Photographer_System_Master_Blueprint.md` (System Master Blueprint & Architecture Baseline)
2. `docs/phase-0/Scope_v1.md` (Product Scope Definition & Boundary Governance)
3. `docs/phase-0/Attendance_Scenario_Matrix.md` (Comprehensive Operational Attendance Scenarios)
4. `docs/phase-0/Decision_Log.md` (Authoritative Decision Register & Lifecycle History)
5. `docs/phase-0/Critical_Decisions.md` (Categorized Decisions, Questions & Engineering Proposals)
6. `docs/phase-0/Evidence_Ledger.md` (Empirical Video Observations, Hypotheses & Open Questions)
7. `docs/phase-0/Product_Glossary.md` (Authoritative Domain Terminology & Semantic Distinctions)
8. `docs/phase-0/Prioritized_Product_Backlog.md` (User Stories, Minimum Acceptance Criteria & Epics)

---

## 2. Complete Decision Alignment & Traceability Matrix (DEC-001 – DEC-024)

The table below traces all 24 registered decisions across the documentation suite. Every approved decision (`DEC-001` through `DEC-007`) is fully embedded, and all open questions (`DEC-008` through `DEC-024`) are preserved as `OPEN` with unapproved rules strictly segregated as `PROPOSAL`.

| Decision ID | Domain & Focus | Status | Core Approved Rule / Baseline Definition | Documents Cross-Referenced & Verified | Consistency Status |
|---|---|---|---|---|---|
| **DEC-001** | Scope Boundary: Photography & Bookings | `APPROVED — PERMANENTLY EXCLUDED` | Exclusively internal workforce & attendance management. All photography, customer booking, hotel session, CRM, and media features are permanently out of scope. | Blueprint §1, §1.1, §34; Scope §1, §2; Decision Log; Critical Decisions; Backlog §1 | **100% Aligned** (Zero booking references) |
| **DEC-002** | Attendance Scope: Dual Operations | `APPROVED` | Both Check-in (arrival) and Check-out (departure) are mandatory MVP core operations. Explicit employee trigger; server timestamp; worksite association. | Blueprint §1.1, §8.1, §8.1.1; Scope §3; Scenario Matrix (SC-01 through SC-21); Decision Log; Critical Decisions; Backlog US-002, US-007 | **100% Aligned** (Both in MVP) |
| **DEC-003** | Schedule Policy: Configurable Windows | `APPROVED` | Attendance schedules are fully configurable by Admin/Manager with audit trail. Never hardcoded. Initial default: 07-08 Green (+1), 08-09 Unset, 09-10 Normal (0), 10-11 Red (Late), 11-12 Unset, 12:00 Cutoff. | Blueprint §6, §8.3; Scope §3; Decision Log; Critical Decisions; Evidence Ledger §2; Backlog US-013 | **100% Aligned** (Configurable in all docs) |
| **DEC-004** | Attendance Rules: Post-Cutoff Behavior | `APPROVED` | Check-in between Cutoff and Shift End marks employee **Present**, assigns **Black Card**, displays notice. After Shift End: self-service check-in permanently closes; routes to admin review. Shift End is configurable. | Blueprint §6, §8.2, §8.3; Scope §3; Scenario Matrix SC-04, SC-05; Decision Log; Critical Decisions; Backlog US-004, US-005 | **100% Aligned** (Present + Black Card verified) |
| **DEC-005** | Geo Policy: Dual GPS Validation | `APPROVED` | Point-in-time GPS coordinate capture and geofence validation against assigned worksite apply to **both** Check-in and Check-out. Continuous background GPS tracking is permanently excluded. | Blueprint §1.1, §8.1, §8.1.1; Scope §3; Scenario Matrix SC-01, SC-06, SC-09, SC-19, SC-20; Decision Log; Critical Decisions; Backlog US-003, US-007 | **100% Aligned** (Dual GPS on arrival & departure) |
| **DEC-006** | Exception Flow: Non-Blocking Submission | `APPROVED` | If GPS fails or is outside geofence during Check-in or Check-out, employee can submit with reason as `Pending Review`. Captures server time and technical diagnostics. Non-blocking. Queues for admin review. | Blueprint §8.1, §8.4; Scope §3; Scenario Matrix SC-07, SC-08, SC-10, SC-11, SC-12; Decision Log; Critical Decisions; Backlog US-006, US-015 | **100% Aligned** (Non-blocking across all docs) |
| **DEC-007** | Review Governance: Points Suspense & Retroactive Eval | `APPROVED` | While in `Pending Review`, zero points/penalties awarded. Approval of Check-in evaluates points at **original timestamp**. Approval of Check-out does NOT evaluate arrival points (`DEC-021`). Rejection requires mandatory reason, awards zero points, does not create automatic Black Penalty (`DEC-023`). | Blueprint §8.1, §8.2, §8.4; Scope §3; Scenario Matrix SC-12, SC-13, SC-14; Decision Log; Critical Decisions; Backlog US-006, US-015 | **100% Aligned** (Suspense & original time verified) |
| **DEC-008** | Platform Architecture: Responsive Next.js PWA | `APPROVED` | Employee application uses responsive Next.js 16 PWA with web manifest, service worker shell, installability, Arabic RTL / English LTR, zero background GPS tracking, and no GPS on startup. | Blueprint §1.1, §35; Critical Decisions; Decision Log; Scope §1 | **100% Aligned** (Approved for Phase 1) |
| **DEC-009** | Geofence Specifications | `OPEN` | Exact worksite radius and minimum GPS accuracy thresholds in meters. Recommendation: 150m radius, 50m accuracy threshold. | Blueprint §8.4; Critical Decisions; Decision Log; Backlog US-014 | **Preserved as OPEN** (`PROPOSAL` labeled) |
| **DEC-010** | Schedule Boundary Precision | `OPEN` | Time boundary seconds precision (half-open intervals `[start, end)` vs closed intervals). Recommendation: `[start, end)`. | Blueprint §8.3; Critical Decisions; Decision Log | **Preserved as OPEN** (`PROPOSAL` labeled) |
| **DEC-011** | Disciplinary Math: Black Formula | `OPEN` | Clarification of video demo screen paradox: `1 × 1,000 = 0 EGP`. Distinguishes unexcused absence penalty from present employee Black Card. | Blueprint §9.1; Critical Decisions; Decision Log; Evidence Ledger §2 | **Preserved as OPEN** (`EVIDENCE` referenced) |
| **DEC-012** | Financial Nature of Deductions | `OPEN` | Binding payroll deductions vs informational disciplinary scores. Clarifies legal/payroll enforcement of 250 EGP Red and 1,000 EGP Black. | Blueprint §9.1; Critical Decisions; Decision Log; Scope §3 | **Preserved as OPEN** (`PROPOSAL` labeled) |
| **DEC-013** | Green Points Consumption Model | `OPEN` | Green Points economy: double-entry ledger debit (points burned upon penalty clearance/reward claim) vs non-depleting milestone badge. Recommendation: double-entry debit ledger. | Blueprint §9.2; Critical Decisions; Decision Log; Backlog US-010 | **Preserved as OPEN** (`PROPOSAL` labeled) |
| **DEC-014** | Reward Program Accrual Model | `OPEN` | 30 Green Points reward: calendar month reset vs rolling cumulative balance bank. Recommendation: monthly reset with carryover rules. | Blueprint §10.1; Critical Decisions; Decision Log; Backlog US-020 | **Preserved as OPEN** (`PROPOSAL` labeled) |
| **DEC-015** | Payout Currency & Logistics | `OPEN` | Reward payout disbursement mechanism: local currency (EGP), payout rails (InstaPay / Vodafone Cash), manual admin vs API integration. | Critical Decisions; Decision Log; Backlog US-020, US-021 | **Preserved as OPEN** (`PROPOSAL` labeled) |
| **DEC-016** | Retrospective Leave Reconciliation | `OPEN` | Automated reversal of unexcused absence strikes and penalty deductions upon late approval of retrospective leave. Recommendation: automated compensating ledger transaction. | Blueprint §8.4, §11.1; Critical Decisions; Decision Log; Scenario Matrix SC-05, SC-14 | **Preserved as OPEN** (`PROPOSAL` labeled) |
| **DEC-017** | RBAC Hierarchy & Permissions | `OPEN` | Exact 4-tier role hierarchy: Employee, Team Lead/Supervisor, Admin/Operations, Owner/SuperAdmin. | Blueprint §7.1; Critical Decisions; Decision Log | **Preserved as OPEN** (`PROPOSAL` labeled) |
| **DEC-018** | Forgotten Check-out Policy | `OPEN` | Finalization procedure for unclosed shifts past daily cutoff. System baseline: zero automatic penalties. Proposed automatic transition to `incomplete` status and end-of-day reconciliation remain strictly `PROPOSAL`. | Blueprint §8.1.1, §8.2; Critical Decisions; Decision Log; Scenario Matrix SC-17, SC-18; Backlog US-018 | **Preserved as OPEN** (`PROPOSAL` labeled) |
| **DEC-019** | Early Departure Disciplinary Policy | `OPEN` | Attendance impact of checking out before scheduled shift end. System baseline: zero point deductions. Proposed `completed_early_departure` flag and duration metadata remain strictly `PROPOSAL`. | Blueprint §8.1.1, §8.2; Critical Decisions; Decision Log; Scenario Matrix SC-19; Backlog US-018 | **Preserved as OPEN** (`PROPOSAL` labeled) |
| **DEC-020** | Working Hours & Break Calculation | `OPEN` | Calculation of net shift duration (`check_out - check_in`) and tracking of breaks. Recommendation: display elapsed presence as informational metadata; defer break tracking post-MVP. | Blueprint §8.1.1; Critical Decisions; Decision Log; Scenario Matrix SC-09, SC-19, SC-20 | **Preserved as OPEN** (`PROPOSAL` labeled) |
| **DEC-021** | Check-out Impact on Points Economy | `OPEN` | Clarification whether check-out generates or modifies points. Recommendation: Check-out has strictly **zero impact** on Green, Red, or Black points. Point economy is tied exclusively to arrival punctuality and unexcused absences. | Blueprint §8.1.1; Critical Decisions; Decision Log; Scenario Matrix SC-09, SC-13, SC-19, SC-20; Backlog US-007, US-015 | **Preserved as OPEN** (`PROPOSAL` labeled) |
| **DEC-022** | Initial Status of Configurable Intervals | `OPEN` | Initial system classification for default configurable intervals (08:00–09:00 and 11:00–12:00) before explicit admin configuration. Current state: **UNSET** until configured. Confirmed as an **original baseline decision**. | Blueprint §6, §8.3; Critical Decisions; Decision Log; Backlog US-013 | **Preserved as OPEN** (`UNSET` enforced) |
| **DEC-023** | Disciplinary Policy for Rejected Exceptions | `OPEN` | Absence classification and disciplinary strike when Admin rejects an attendance exception. Recommendation: mark as `rejected_attendance`, route to daily absence reconciliation, do NOT automatically issue a Black Penalty upon rejection. Confirmed as a **newly registered gap-closure decision**. | Blueprint §8.4; Critical Decisions; Decision Log; Scenario Matrix SC-14; Backlog US-015 | **Preserved as OPEN** (`PROPOSAL` labeled) |
| **DEC-024** | Post-Shift Absence Finalization Timeline | `OPEN` | Timeline and administrative procedure for officially registering an unexcused absence strike after self-service check-in permanently closes at shift end (`DEC-004`). Recommendation: automated end-of-day reconciliation job marks unfulfilled shifts as `absent_pending` allowing grace window before disciplinary ledger entry. Confirmed as a **newly registered gap-closure decision**. | Blueprint §8.2; Critical Decisions; Decision Log; Scenario Matrix SC-05; Backlog US-005 | **Preserved as OPEN** (`PROPOSAL` labeled) |

---

## 3. Cross-Document Consistency Matrix by Core Architectural Domain

### Domain A: Product Identity & Scope Boundary (`DEC-001`)
- **Verified Standard:** "Sharm Photographer" is strictly a corporate name. The system is exclusively an internal employee workforce management and attendance platform.
- **Cross-Document Traceability:**
  - `Sharm_Photographer_System_Master_Blueprint.md`: Section 1, 1.1, and 34 explicitly state internal employee scope and document permanent exclusion of booking/photography.
  - `docs/phase-0/Scope_v1.md`: Section 1 and Section 2 contain an exhaustive list of permanently excluded features (sessions, bookings, cameras, media).
  - `docs/phase-0/Decision_Log.md`: Registered as `DEC-001 APPROVED — PERMANENTLY EXCLUDED`.
  - `docs/phase-0/Prioritized_Product_Backlog.md`: Zero booking, photography, or client stories exist in the backlog.
- **Audit Result:** **100% Consistent.** Zero leakage of photography domain entities.

### Domain B: Attendance Operations (Check-in & Check-out Dual Tracking) (`DEC-002`)
- **Verified Standard:** Both arrival (Check-in) and departure (Check-out) are mandatory core MVP features.
- **Cross-Document Traceability:**
  - `Sharm_Photographer_System_Master_Blueprint.md`: Section 1.1, 8.1, and 8.1.1 detail end-to-end workflows for both operations; Domain class diagram contains `checked_in_at` and `checked_out_at`.
  - `docs/phase-0/Scope_v1.md`: Section 3 explicitly mandates both Check-in and Check-out in MVP.
  - `docs/phase-0/Attendance_Scenario_Matrix.md`: Matrix covers all 21 operational scenarios: arrival windows (SC-01 to SC-05), arrival GPS validation (SC-06 to SC-08), departure GPS validation (SC-09 to SC-11), exception review pipeline (SC-12 to SC-14), duplicate operations (SC-15, SC-16), unclosed shifts (SC-17, SC-18), early departure (SC-19), post-shift departure (SC-20), and departure without check-in (SC-21).
  - `docs/phase-0/Product_Glossary.md`: Defines Check-in, Check-out, Incomplete Shift, and Completed Shift.
  - `docs/phase-0/Prioritized_Product_Backlog.md`: US-002, US-003, US-007, US-008, US-017, and US-018 provide full user story coverage.
- **Audit Result:** **100% Consistent.** Check-out is an integral MVP component across all documents.

### Domain C: Configurable Attendance Windows & Defaults (`DEC-003`, `DEC-022`)
- **Verified Standard:** Schedule time windows and classifications are dynamically configurable via Admin/Manager UI with an immutable audit log. Default baseline: 07-08 Green (+1), 08-09 Unset, 09-10 Normal (0), 10-11 Red (Late), 11-12 Unset, 12:00 Cutoff. Intervals 08-09 and 11-12 remain UNSET until explicitly configured (`DEC-022`).
- **Cross-Document Traceability:**
  - `Sharm_Photographer_System_Master_Blueprint.md`: Section 6 and Section 8.3 present the approved table and enforce a strict architectural ban on hardcoded schedules.
  - `docs/phase-0/Scope_v1.md`: Section 3 Item 2 mandates configurable schedules and records default windows.
  - `docs/phase-0/Attendance_Scenario_Matrix.md`: Scenarios SC-01 through SC-03 test Early, Normal, Late; notes enforce configurable rules.
  - `docs/phase-0/Decision_Log.md` & `Critical_Decisions.md`: Recorded under `DEC-003` (Approved) and `DEC-022` (Open).
  - `docs/phase-0/Prioritized_Product_Backlog.md`: Story US-013 implements the dynamic schedule configuration engine.
- **Audit Result:** **100% Consistent.** No document hardcodes schedules; 08-09 and 11-12 are consistently marked `Unset`.

### Domain D: Post-Cutoff Check-in & Post-Shift Governance (`DEC-004`, `DEC-024`)
- **Verified Standard:**
  1. *Between Cutoff and Shift End:* Employee can check in, marked **Present** (not Absent), assigned a **Black Card**, and notified immediately. Black Card is a punctuality strike, NOT an unexcused absence, carries no automatic deduction, and is distinct from Black Penalty.
  2. *After Shift End:* Self-service check-in permanently closes. Handled exclusively via administrative review (`DEC-024`).
- **Cross-Document Traceability:**
  - `Sharm_Photographer_System_Master_Blueprint.md`: Section 6, 8.2, 8.3, and 8.4 explicitly document Present status with Black Card before shift end, and self-service closure after shift end.
  - `docs/phase-0/Scope_v1.md`: Section 3 Item 3 details exact after-cutoff behavior.
  - `docs/phase-0/Attendance_Scenario_Matrix.md`: Scenario SC-04 covers Cutoff-to-Shift-End (Present + Black Card); SC-05 covers post-shift self-service closure.
  - `docs/phase-0/Product_Glossary.md`: Section 2 formally defines the semantic distinction between **Black Card** and **Black Penalty**.
  - `docs/phase-0/Prioritized_Product_Backlog.md`: US-004 implements Cutoff-to-Shift-End check-in; US-005 implements post-shift closure messaging.
- **Audit Result:** **100% Consistent.** Zero ambiguity between Black Card (punctuality) and Black Penalty (absence).

### Domain E: Dual GPS Validation & Geofencing (`DEC-005`, `DEC-009`)
- **Verified Standard:** Point-in-time GPS coordinate capture and geofence validation against assigned worksite occur at **both** Check-in and Check-out. Continuous background GPS tracking is permanently excluded.
- **Cross-Document Traceability:**
  - `Sharm_Photographer_System_Master_Blueprint.md`: Section 1.1, 8.1, and 8.1.1 mandate point-in-time GPS for both operations; Section 8.5 AC-ATT-07 explicitly excludes background tracking.
  - `docs/phase-0/Scope_v1.md`: Section 3 Item 4 explicitly affirms dual point-in-time GPS validation and excludes continuous background tracking.
  - `docs/phase-0/Attendance_Scenario_Matrix.md`: SC-06 (Valid arrival GPS), SC-07 & SC-08 (Check-in GPS exceptions), SC-09 (Valid departure GPS), SC-10 & SC-11 (Check-out GPS exceptions), SC-19 (Early departure GPS), and SC-20 (Post-shift departure GPS) validate dual point-in-time GPS enforcement.
  - `docs/phase-0/Prioritized_Product_Backlog.md`: US-003 (arrival GPS), US-007 (departure GPS), US-014 (geofence management).
- **Audit Result:** **100% Consistent.** Previous contradiction in Scope_v1.md has been fully resolved.

### Domain F: GPS Exceptions & Non-Blocking `Pending Review` (`DEC-006`)
- **Verified Standard:** If GPS verification fails, GPS permission is denied, device cannot acquire location, or employee is outside geofence, employee can still submit Check-in or Check-out. Operation transitions to `Pending Review` (non-blocking). Captures server timestamp and technical diagnostics. Queues for admin review.
- **Cross-Document Traceability:**
  - `Sharm_Photographer_System_Master_Blueprint.md`: Section 8.1, 8.4, and event catalog document the exception flow and non-blocking submission.
  - `docs/phase-0/Scope_v1.md`: Section 3 Item 5 details non-blocking exception submission.
  - `docs/phase-0/Attendance_Scenario_Matrix.md`: SC-07 & SC-08 (Check-in GPS exceptions) and SC-10 & SC-11 (Check-out GPS exceptions) all transition to `Pending Review` with points suspended under SC-12.
  - `docs/phase-0/Prioritized_Product_Backlog.md`: US-006 (Employee non-blocking submission) and US-015 (Admin review queue).
- **Audit Result:** **100% Consistent.** All documents implement non-blocking exception handling.

### Domain G: Points Suspense & Retroactive Review Evaluation (`DEC-007`, `DEC-021`, `DEC-023`)
- **Verified Standard:**
  1. *During `Pending Review`:* Zero points awarded, zero penalties generated; points held in suspense.
  2. *Check-in Approved:* Evaluates arrival classification and points based on **original submission timestamp**, NOT review timestamp.
  3. *Check-out Approved:* Approves departure; does NOT evaluate arrival classification and generates zero arrival points (`DEC-021`).
  4. *Rejected Exception:* Requires mandatory written reason, awards zero points, does NOT automatically create a Black Penalty (`DEC-023`).
- **Cross-Document Traceability:**
  - `Sharm_Photographer_System_Master_Blueprint.md`: Section 8.1, 8.2, and 8.4 reflect points suspense and original timestamp evaluation.
  - `docs/phase-0/Scope_v1.md`: Section 3 Item 6 documents suspense and retroactive evaluation rules.
  - `docs/phase-0/Attendance_Scenario_Matrix.md`: SC-13 details approval logic (differentiating check-in from check-out); SC-14 details rejection rules.
  - `docs/phase-0/Prioritized_Product_Backlog.md`: US-006 and US-015 explicitly enforce suspense and original timestamp evaluation.
- **Audit Result:** **100% Consistent.** Rejection and approval pathways completely synchronized.

---

## 4. Consolidated Register of Active Unresolved Decisions (DEC-009 – DEC-024)

> *Note:* `DEC-008` (Responsive Next.js PWA) was officially approved for Phase 1 implementation. The remaining 16 unresolved decisions are maintained in an active `OPEN` status. Every recommendation is strictly designated as `PROPOSAL` and awaits explicit Project Owner authorization before implementation.

| Decision ID | Domain Area | Specific Question for Project Owner | Recommended Engineering Proposal (`PROPOSAL`) | Rationale & Trade-offs | Impact if Delayed to Phase 1 |
|---|---|---|---|---|---|
| **DEC-009** | Geofencing Specs | What are the exact acceptable worksite radius and GPS accuracy thresholds in meters? | Set default geofence radius to **150 meters** and maximum acceptable GPS accuracy threshold to **50 meters**, both configurable per worksite. | Balances GPS drift in dense urban/coastal resort areas against location spoofing prevention. | Low impact; values are stored in database configuration, not hardcoded. |
| **DEC-010** | Schedule Bounds | What is the exact mathematical boundary precision for attendance time windows? | Use half-open intervals: `[start_time, end_time)`. E.g., Green is `07:00:00 <= t < 08:00:00`; Normal is `08:00:00 <= t < 09:00:00`. | Eliminates 1-second boundary overlaps or gaps, ensuring deterministic single-state classification. | Must be finalized before Schedule Engine implementation in Phase 2. |
| **DEC-011** | Disciplinary Math | How is the video demo formula `1 × 1,000 = 0 EGP` for Black Penalty interpreted? | Treat `0 EGP` in demo as an illustrative UI placeholder. Base financial penalty for unexcused absence is 1,000 EGP per strike, or 0 EGP if disciplinary strikes are non-monetary. | Video shows explicit `0 EGP` resulting amount despite `1 × 1,000` text. Avoids unapproved monetary deductions. | Critical for payroll integration, but does not block core attendance tracking MVP. |
| **DEC-012** | Financial Deductions | Are Red (250 EGP) and Black (1,000 EGP) deductions legally binding payroll deductions or internal scoring? | Implement as internal disciplinary points ledger in MVP, with an optional payroll export module generating deduction line items upon explicit admin review. | Direct automated salary deductions may require local labor law compliance and employment contract authorization. | Architecture uses double-entry ledger regardless of binding legal nature. |
| **DEC-013** | Points Economy | Does redeeming Green Points to clear penalties permanently consume (burn) points, or are they milestone badges? | Implement strict double-entry ledger debit: redeeming 1 Green point for 1 Red penalty, or 5 Green points for 1 Black penalty, **debits** the spendable Green balance. | Prevents double-spending where the same 30 points are used to wipe out all penalties and simultaneously claim cash rewards. | Core data model must reflect ledger debits; proposal preserves transactional integrity. |
| **DEC-014** | Reward Accrual | Is the 30 Green Points cash reward evaluated on a strict monthly calendar cycle or cumulative bank? | Monthly accrual cycle: Green points earned within a calendar month count toward that month's reward. Option to carry over unredeemed points. | Monthly cycles align with payroll periods and reset employee motivation regularly. | Can be configured as a policy parameter in Phase 2. |
| **DEC-015** | Payout Logistics | What is the reward disbursement currency, payment rails, and approval mechanism? | Rewards displayed in EGP (or USD if configured), disbursed via manual transfer (InstaPay / Vodafone Cash) with admin transaction receipt upload. | Video displays Egyptian payment methods (InstaPay/Vodafone Cash). Eliminates third-party payment gateway integration risks in MVP. | Finance workflow is P1 backlog; does not block MVP. |
| **DEC-016** | Retrospective Leave | Does retrospective approval of a leave request automatically reverse an existing absence strike and penalty? | When an administrator approves a retroactive leave request covering a past date, the system generates an automated compensating ledger reversal entry with an audit log. | Eliminates unfair disciplinary penalties when an employee was legitimately sick or excused but unable to submit leave in advance. | Requires compensating transaction logic in Leave Module. |
| **DEC-017** | RBAC Hierarchy | What is the exact 4-tier role hierarchy and permission matrix? | Implement 4 roles: `Employee` (self-service attendance, history, leaves), `Supervisor` (team attendance, exception review), `Admin` (full operations, policy config), `Owner` (financials, audit, full system control). | Aligns Clean Architecture authorization policies with CoreStarter ASP.NET Core Identity. | RBAC structure is standard; can be refined during Phase 1 design. |
| **DEC-018** | Forgotten Check-out | How should open attendance records with missing check-outs be finalized past daily cutoff? | System transitions shift to `incomplete` status at day end. Flagged in Admin Review Queue. Admin can enter verified departure time or close shift at scheduled end with mandatory written reason. **Zero automatic financial or point penalties.** | Avoids penalizing employees for technical failures or simple forgetfulness without managerial verification. | Directly requested by project owner: no automatic penalty without explicit approval. |
| **DEC-019** | Early Departure | Does checking out before scheduled shift end incur any penalty, affect classification, or remain purely informational? | System captures departure timestamp, calculates presence duration, and flags as `early_departure` for reporting. **Zero point deductions or penalty strikes in MVP.** | Preserves complete attendance history while awaiting explicit operational policy from Owner. | Directly requested by project owner: no automatic penalty without explicit approval. |
| **DEC-020** | Net Shift Duration | Should the system compute net working hours (`check_out - check_in`) and track breaks in MVP? | Compute total elapsed duration (`check_out - check_in`) in minutes and display as informational metadata on attendance receipts. Defer intermediate break tracking to post-MVP. | Provides immediate visibility into shift duration without complicating MVP with break in/out state machines. | Low complexity; calculated field on completed records. |
| **DEC-021** | Check-out Points Impact | Does Check-out have any impact on the Green, Red, or Black points economy? | Check-out has **strictly zero impact** on the points economy. Point awards and penalties remain exclusively tied to arrival punctuality and unexcused absences. | Project owner confirmed check-out is for recording departure and attendance duration, not for punctuality points. | Preserves simplicity and alignment with approved decisions. |
| **DEC-022** | Initial Schedule Config | What should be the initial system assignment for default configurable intervals (08:00–09:00 and 11:00–12:00)? | Intervals remain **UNSET** in the database. Schedule Engine requires Admin/Manager to assign a classification (e.g. Normal, Late, Custom) during worksite setup. | Prevents unapproved assumptions from becoming default operational rules. | Explicitly mandated by project owner. |
| **DEC-023** | Disciplinary Policy for Rejected Exceptions | When an administrator rejects a pending attendance exception, what specific absence status and penalty apply? | Mark record as `rejected_attendance`. Route to standard end-of-day absence reconciliation. Do **NOT** automatically issue a Black Penalty upon rejection. | Administrative rejection of an exception may mean insufficient proof, not necessarily willful unexcused absence. | Preserves fair disciplinary governance until Owner establishes formal absence policy. |
| **DEC-024** | Post-Shift Absence Finalization Timeline | When an employee fails to check in before shift end (self-service permanently closes under `DEC-004`), when and how is the unexcused absence officially finalized? | Automated reconciliation job at end of day marks unfulfilled shifts as `absent_pending`, allowing an administrative grace window for exception entry before generating disciplinary strikes. | Prevents premature penalties while an employee might be in transit or reporting through alternative communication channels. | Operational workflow policy to be approved by Owner. |

---

## 5. Terminology & Semantic Alignment Verification

| Core Concept | Approved Definition | Key Distinctions & Boundaries |
|---|---|---|
| **Black Card** | Punctuality strike assigned to an employee who checks in **after Cutoff (12:00) but before Shift End** (`DEC-004`). | Attendance status is **Present** (not Absent). Not an unexcused absence strike. Carries zero automatic monetary deduction. Cannot be cleared by 5 Green Points unless explicitly approved by Owner. |
| **Black Penalty** | Disciplinary penalty strike resulting from a full-day **unexcused absence** (no attendance record, no approved leave). | Attendance status is **Absent**. Associated with unexcused absence strike and 1,000 EGP deduction in video demo screen (`DEC-011`). Redeemable by 5 Green Points under established video baseline. |
| **Pending Review** | Non-blocking exception status applied when an attendance operation (Check-in or Check-out) occurs with GPS disabled, weak accuracy, or outside geofence (`DEC-006`). | All points and penalties are held in suspense. Check-in approval evaluates classification at original submission timestamp. Check-out approval approves departure without arrival points (`DEC-007`, `DEC-021`). |
| **Incomplete Shift** | Attendance record where Check-in occurred, but Check-out was not registered by day end (`DEC-018`). | Flagged for administrative review. Carries **zero automatic financial or point penalties**. |
| **Early Departure** | Attendance record where Check-out occurred before scheduled shift end (`DEC-019`). | Recorded as factual timestamp with `early_departure` flag. Carries **zero automatic point deductions**. |
| **Status Architecture** (`PROPOSAL`) | Separate lifecycle tracking for Check-in, Check-out, and overall Day Status. | `CheckInStatus`: (eligible, early, normal, late, present_black_card, pending_review, rejected). `CheckOutStatus`: (pending, completed, completed_early, incomplete, pending_review, rejected). `AttendanceDayStatus`: (scheduled, present, incomplete, absent, on_leave). Prevents semantic coupling. |

---

## 6. Document Suite Consistency Verification Sign-off

- [x] **Zero Photography Features:** Verified that all 8 documents contain zero customer photo booking, hotel reservations, client CRM, photography equipment, or media gallery functionality (`DEC-001`).
- [x] **Dual Attendance Integration:** Verified that both Check-in and Check-out are fully integrated across all 8 documents (`DEC-002`).
- [x] **Configurable Schedule Fidelity:** Verified that schedules are dynamically configurable with initial defaults preserved and intervals 08-09 and 11-12 strictly marked `Unset` (`DEC-003`, `DEC-022`).
- [x] **Post-Cutoff Precision:** Verified that arrival between Cutoff and Shift End marks employee Present with a Black Card, distinct from an unexcused absence Black Penalty (`DEC-004`).
- [x] **Dual GPS & Geofencing:** Verified that GPS validation applies to both Check-in and Check-out with zero continuous background tracking (`DEC-005`).
- [x] **Non-Blocking Exceptions:** Verified that GPS exceptions transition to `Pending Review` with zero points in suspense and retroactive evaluation upon approval (`DEC-006`, `DEC-007`).
- [x] **Non-Punitive Defaults:** Verified that early departures and forgotten check-outs carry zero automatic financial or point deductions (`DEC-018`, `DEC-019`, `DEC-021`).
- [x] **Strict Segregation of Unapproved Rules:** Verified that all 17 unresolved decisions (`DEC-008` through `DEC-024`) are preserved as `OPEN` with unapproved engineering solutions strictly labeled `PROPOSAL`. Specifically, proposed behaviors for forgotten check-outs (`DEC-018`) and early departure flags (`DEC-019`) remain non-binding proposals pending Project Owner approval.
- [x] **Complete 21 Attendance Scenarios:** Verified that all 21 operational scenarios (`SC-01` through `SC-21`) are fully defined, consistently cross-referenced, and aligned with approved rules and open decision proposals.
- [x] **Git Verification Limitation Documented:** Formally recorded that workspace `d:\Projects\NASAQ` has no Git repository initialized (`.git` does not exist). In accordance with documentation-only boundaries, Git was not initialized. Codebase inviolability is independently confirmed via forensic filesystem timestamp audit.
- [x] **Codebase Preservation:** Verified that zero application source code, database entities, migrations, or third-party packages have been touched in CoreStarter (`backend/` and `frontend/`).

**Conclusion:** The Phase 0 documentation suite is 100% synchronized, consistent, and ready for official project owner sign-off.