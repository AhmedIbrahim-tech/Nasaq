# Attendance Scenario Matrix — Comprehensive Check-in & Check-out Specification

> **Document Version:** 2.1 (Phase 0 Audit & Alignment Baseline)  
> **System Purpose:** Internal Employee Attendance & Workforce Management System  
> **Status:** Synchronized with Owner Decisions DEC-001 through DEC-007; Active Decisions DEC-008 through DEC-024 Explicitly Open  
> **Principle:** No unapproved business rules, penalties, or financial deductions are assumed.

---

## 1. Overview & Architectural Principles

The Sharm Photographer Attendance Engine governs all employee arrival and departure operations according to owner-approved policies and architectural guidelines:

1. **Configurable Time Windows (`DEC-003`):**
   - Shift times, arrival window classifications, cutoffs, and shift ends are dynamically configurable by Admin or Manager via the Admin Console.
   - **Never hardcoded.** Modifications are logged with user identity and timestamp.
   - **Initial Default Schedule:** 07:00–08:00 (Early: +1 Green), 08:00–09:00 (Configurable: Unset — `DEC-022` OPEN), 09:00–10:00 (Normal: 0 points), 10:00–11:00 (Late: Red), 11:00–12:00 (Configurable: Unset — `DEC-022` OPEN), and 12:00 (Attendance Cutoff).
2. **Dual Check-in & Check-out (`DEC-002`, `DEC-005`):**
   - Both arrival and departure are mandatory core MVP operations.
   - Point-in-time GPS coordinate capture and geofence validation against assigned worksite apply to **both Check-in and Check-out**. Continuous background GPS tracking is permanently excluded.
3. **After-Cutoff Handling (`DEC-004`):**
   - *Between Cutoff and Shift End:* Employee check-in is accepted, recorded with actual server time, marked **Present** (not Absent), assigned a **Black Card**, and the employee is immediately notified.
   - *After Shift End:* Self-service check-in is permanently closed for the expired shift; subsequent cases require administrative review (`DEC-024` OPEN).
   - **Mandatory Distinction:** A **Black Card** is a punctuality marker for a present employee; it does NOT automatically imply an unexcused absence or a monetary deduction, and is NOT automatically redeemable via 5 Green points. A **Black Penalty** relates strictly to an unexcused absence (`DEC-011`, `DEC-012` OPEN).
4. **GPS Exception & Non-Blocking Submission (`DEC-006`):**
   - If GPS is unavailable, inaccurate, or outside the assigned geofence on Check-in or Check-out, the employee is **allowed to submit**. The operation is not discarded; it is recorded with the server timestamp, available GPS diagnostics, and placed in **`Pending Review`**.
5. **Points Holding & Retroactive Evaluation (`DEC-007`):**
   - While `Pending Review`, zero points or penalties are awarded.
   - **Check-in Approval:** Arrival classification and points are evaluated at the **original submission timestamp**.
   - **Check-out Approval:** Departure event is verified; does NOT evaluate arrival classification and does NOT generate arrival points (`DEC-021` OPEN).
   - **Rejection:** Requires mandatory administrative reason; awards zero points. Does NOT automatically trigger an unexcused absence or Black Penalty (`DEC-023` OPEN).
6. **Architectural Recommendation: Separate Operation-Level Statuses (`PROPOSAL`):**
   - To prevent review state overwrites, the architecture recommends decoupling operation statuses:
     - `CheckInStatus`: `not_checked_in`, `checked_in_verified`, `checked_in_pending_review`, `checked_in_rejected`
     - `CheckOutStatus`: `not_checked_out`, `checked_out_verified`, `checked_out_pending_review`, `checked_out_rejected`
     - `AttendanceDayStatus`: High-level summary aggregating both operations without losing individual review fidelity.

---

## 2. Comprehensive Scenario Matrix

### SC-01: Early Check-in
* **Scenario ID:** `SC-01`
* **Title:** Punctual Early Arrival Check-in
* **Trigger:** Employee clicks "Check In" during the configured Early window (Default: 07:00 – 08:00 AM).
* **Preconditions:** Authenticated employee, scheduled shift exists, GPS valid inside geofence, no prior check-in.
* **Expected System Behavior:**
  1. Captures server timestamp (`checked_in_at = ServerTimeUtc`).
  2. Evaluates arrival window against active schedule template -> matches `Early`.
  3. Records check-in with classification `checked_in_early`. Sets `CheckInStatus = checked_in_verified`.
  4. Generates a point transaction (+1 Green Point) into `PointTransaction` ledger.
  5. Transitions daily attendance state to checked-in; enables Check-out CTA.
* **Validation Requirements:** Server-time window check, circular geofence containment, idempotency guard.
* **Employee-Facing Result:** Success receipt: "Early Check-in Confirmed at [Timestamp]. +1 Green Point awarded!" Home CTA switches to "Check Out".
* **Administrator-Facing Result:** Real-time attendance grid updates: employee marked Present, Early tag displayed, Green point posted.
* **Related Business Rules:** `DEC-003` (Configurable Windows), `BR-02` (Early Bonus).
* **Decisions Requiring Owner Approval:** Exact mathematical boundary seconds (`DEC-010` OPEN, proposed `[start, end)`).

---

### SC-02: Normal Check-in
* **Scenario ID:** `SC-02`
* **Title:** Standard On-Time Arrival Check-in
* **Trigger:** Employee clicks "Check In" during the configured Normal window (Default: 09:00 – 10:00 AM).
* **Preconditions:** Authenticated employee, scheduled shift exists, GPS valid inside geofence, no prior check-in.
* **Expected System Behavior:**
  1. Captures server timestamp.
  2. Matches schedule policy -> classification `checked_in_normal`. Sets `CheckInStatus = checked_in_verified`.
  3. Records attendance as On-Time (zero points awarded, zero penalties).
  4. Transitions state to checked-in; enables Check-out CTA.
* **Validation Requirements:** Server timestamp, geofence validation, idempotency guard.
* **Employee-Facing Result:** Success receipt: "Check-in Confirmed: On-Time at [Timestamp]."
* **Administrator-Facing Result:** Attendance grid shows employee Present and On-Time.
* **Related Business Rules:** `DEC-003` (Configurable Windows).
* **Decisions Requiring Owner Approval:** None.

---

### SC-03: Late Check-in
* **Scenario ID:** `SC-03`
* **Title:** Late Arrival Check-in
* **Trigger:** Employee clicks "Check In" during the configured Late window (Default: 10:00 – 11:00 AM).
* **Preconditions:** Authenticated employee, scheduled shift exists, GPS valid inside geofence, no prior check-in.
* **Expected System Behavior:**
  1. Captures server timestamp.
  2. Matches schedule policy -> classification `checked_in_late`. Sets `CheckInStatus = checked_in_verified`.
  3. Records attendance as Late.
  4. Generates a Red penalty record into the disciplinary ledger.
* **Validation Requirements:** Server timestamp, geofence validation, idempotency guard.
* **Employee-Facing Result:** Notice: "Late Check-in Confirmed at [Timestamp]. 1 Red penalty assigned." Explains option to redeem 1 Green point to clear penalty.
* **Administrator-Facing Result:** Grid displays employee Present, tagged Late, Red penalty logged.
* **Related Business Rules:** `DEC-003` (Configurable Windows), `BR-04` (Late Penalty).
* **Decisions Requiring Owner Approval:** Financial binding nature and deduction value of Red penalty (`DEC-012` OPEN).

---

### SC-04: Check-in After Cutoff (Between Cutoff and Shift End)
* **Scenario ID:** `SC-04`
* **Title:** Critical Delayed Check-in After Cutoff Before Shift End
* **Trigger:** Employee clicks "Check In" after the configured cutoff (Default: 12:00 PM) but before the configured Shift End.
* **Preconditions:** Authenticated employee, scheduled shift exists, `cutoff_time < server_time < shift_end_time`, no prior check-in.
* **Expected System Behavior:**
  1. System permits check-in submission (non-blocking).
  2. Captures actual server timestamp.
  3. Sets attendance status to **Present** (explicitly NOT Absent). Sets `CheckInStatus = checked_in_verified`.
  4. Assigns a **Black Card** disciplinary punctuality marker to the employee's record.
  5. Displays an immediate mandatory notification informing employee of the Black Card assignment.
  6. **Strict Constraint:** Does NOT automatically create an unexcused absence, does NOT apply a monetary deduction, and is NOT automatically redeemable via 5 Green points.
* **Validation Requirements:** `server_time >= cutoff_time` AND `server_time < shift_end_time`.
* **Employee-Facing Result:** High-visibility alert: "Check-in Accepted at [Timestamp]. Status: Present. Arrival was after cutoff (12:00 PM); a Black Card has been assigned to your record."
* **Administrator-Facing Result:** Grid reflects employee as Present with status `Present (Black Card Assigned)` and exact arrival timestamp.
* **Related Business Rules:** `DEC-004` (Approved After-Cutoff Rule).
* **Decisions Requiring Owner Approval:** Disciplinary consequences and potential redemption policies for Black Cards.

---

### SC-05: Check-in After Shift End
* **Scenario ID:** `SC-05`
* **Title:** Self-Service Check-in Closed After Shift End
* **Trigger:** Employee attempts to check in after the configured Shift End time has elapsed.
* **Preconditions:** Authenticated employee, `server_time >= shift_end_time`, no check-in exists for today.
* **Expected System Behavior:**
  1. System blocks self-service check-in for the expired shift (`DEC-004`).
  2. Does NOT create an automatic check-in record.
  3. Directs the case to administrative review.
  4. Provides employee with an interface action to submit an administrative review request.
* **Validation Requirements:** `server_time >= shift_end_time`.
* **Employee-Facing Result:** Error message: "Self-service check-in is closed: Scheduled shift ended at [Shift End]. Please submit an attendance review request to your supervisor."
* **Administrator-Facing Result:** Shift marked as unfulfilled/absent pending administrative review in the Exception Queue.
* **Related Business Rules:** `DEC-004` (Post-Shift End Governance).
* **Decisions Requiring Owner Approval:** Post-shift absence finalization timeline and procedure (`DEC-024` OPEN).

---

### SC-06: Valid GPS Check-in
* **Scenario ID:** `SC-06`
* **Title:** Successful Arrival with Valid Geofence Verification
* **Trigger:** Employee submits Check-in while inside the assigned worksite geofence with accurate GPS.
* **Preconditions:** GPS accuracy meets threshold (proposed <= 50m — `DEC-009` OPEN); distance to worksite center <= radius (proposed 150m — `DEC-009` OPEN).
* **Expected System Behavior:**
  1. Validates distance using Haversine formula against configured worksite center.
  2. Marks geo-status as `verified_inside`. Sets `CheckInStatus = checked_in_verified`.
  3. Processes standard arrival classification and points rules.
* **Validation Requirements:** Configurable GPS accuracy threshold and geofence radius check (`DEC-005`, `DEC-009` OPEN).
* **Employee-Facing Result:** Success receipt showing verified work location name and check-in confirmation.
* **Administrator-Facing Result:** Grid displays exact coordinates, distance in meters, and green "Verified" badge.
* **Related Business Rules:** `DEC-005` (Dual GPS Validation), `BR-01`.
* **Decisions Requiring Owner Approval:** Final worksite geofence radius and accuracy threshold values (`DEC-009` OPEN).

---

### SC-07: Invalid GPS Check-in (Outside Assigned Geofence)
* **Scenario ID:** `SC-07`
* **Title:** Check-in Attempted Outside Assigned Worksite Perimeter
* **Trigger:** Employee submits Check-in while physical coordinates fall outside the assigned worksite radius.
* **Preconditions:** GPS is acquired; calculated distance > worksite radius.
* **Expected System Behavior:**
  1. System does NOT reject or discard the submission (`DEC-006`).
  2. Captures original server timestamp and available coordinates.
  3. Logs failure reason: `outside_geofence` with calculated distance deviation in meters.
  4. Sets `CheckInStatus = checked_in_pending_review`.
  5. Holds points: zero Green points, zero Red/Black penalties awarded while pending (`DEC-007`).
  6. Dispatches case to the Administrator Exception Queue.
* **Validation Requirements:** Non-blocking exception pipeline (`DEC-006`).
* **Employee-Facing Result:** Warning banner: "Check-in Submitted (Pending Review): You are [X] meters outside [Worksite Name]. Your submission has been sent to management for review. Timestamp recorded: [Time]."
* **Administrator-Facing Result:** Item appears in "GPS Exception Queue" displaying employee name, timestamp, out-of-bounds distance, and map marker, with Approve/Reject actions.
* **Related Business Rules:** `DEC-006` (Non-Blocking GPS Exception), `DEC-007` (Points Holding).
* **Decisions Requiring Owner Approval:** None.

---

### SC-08: GPS Unavailable During Check-in
* **Scenario ID:** `SC-08`
* **Title:** Check-in Attempted with Location Disabled or Inaccurate
* **Trigger:** Employee submits Check-in with phone GPS disabled, permission denied, or accuracy radius exceeding threshold.
* **Preconditions:** Geolocation API returns error, permission denied, or low-accuracy fix.
* **Expected System Behavior:**
  1. System permits submission (non-blocking — `DEC-006`).
  2. Captures authoritative server timestamp.
  3. Logs failure reason: `gps_unavailable` or `low_accuracy`.
  4. Sets `CheckInStatus = checked_in_pending_review`.
  5. Holds points: zero points or penalties generated while pending (`DEC-007`).
  6. Routes case to Administrator Review Queue.
* **Validation Requirements:** Error interception, server timestamp persistence.
* **Employee-Facing Result:** Notice: "Check-in Submitted (Pending Review): Location could not be verified by your device. Your timestamp [Time] has been saved and sent to management for review."
* **Administrator-Facing Result:** Item flagged in Exception Queue as "Location Unavailable" with server timestamp.
* **Related Business Rules:** `DEC-006` (GPS Exception Handling).
* **Decisions Requiring Owner Approval:** None.

---

### SC-09: Valid GPS Check-out
* **Scenario ID:** `SC-09`
* **Title:** Standard Successful Departure Check-out
* **Trigger:** Employee clicks "Check Out" upon shift completion while inside assigned worksite geofence.
* **Preconditions:** Active attendance record exists with prior check-in; no prior check-out; GPS valid inside geofence (`DEC-005`).
* **Expected System Behavior:**
  1. Validates GPS coordinates against worksite perimeter.
  2. Records departure timestamp (`checked_out_at = ServerTimeUtc`).
  3. Sets `CheckOutStatus = checked_out_verified`.
  4. Transitions `AttendanceDayStatus` to `completed`.
  5. Does NOT generate arrival points or monetary penalties (`DEC-021` OPEN).
* **Validation Requirements:** Active check-in check, null check on check-out, geofence validation.
* **Employee-Facing Result:** Departure receipt: "Check-out Confirmed at [Timestamp]. Shift completed." Home dashboard reflects completed status.
* **Administrator-Facing Result:** Grid updates: check-out time populated, status marked Completed, elapsed hours recorded.
* **Related Business Rules:** `DEC-002`, `DEC-005` (Dual GPS Validation).
* **Decisions Requiring Owner Approval:** Working hours calculation display policy (`DEC-020` OPEN).

---

### SC-10: Invalid GPS Check-out (Outside Assigned Geofence)
* **Scenario ID:** `SC-10`
* **Title:** Departure Check-out Attempted Outside Assigned Worksite Perimeter
* **Trigger:** Employee clicks "Check Out" after leaving the resort perimeter.
* **Preconditions:** Active check-in exists; employee coordinates fall outside worksite radius.
* **Expected System Behavior:**
  1. Does NOT block departure submission (`DEC-006`).
  2. Captures authoritative departure server timestamp.
  3. Records failure reason: `outside_geofence_checkout` and deviation in meters.
  4. Sets `CheckOutStatus = checked_out_pending_review`.
  5. Preserves existing verified `CheckInStatus` without invalidating arrival.
  6. Flags the departure record on the Administrator Review Queue.
* **Validation Requirements:** Non-blocking departure pipeline (`DEC-006`).
* **Employee-Facing Result:** Notice: "Check-out Submitted (Pending Review): Your departure was recorded at [Time], but you were outside the facility perimeter. Sent to management for review."
* **Administrator-Facing Result:** Appears in Admin Exception Queue: "Check-out Outside Geofence" with departure timestamp and distance. Check-in remains verified.
* **Related Business Rules:** `DEC-005`, `DEC-006`.
* **Decisions Requiring Owner Approval:** None.

---

### SC-11: GPS Unavailable During Check-out
* **Scenario ID:** `SC-11`
* **Title:** Departure Check-out with Location Disabled or Inaccurate
* **Trigger:** Employee clicks "Check Out" with phone location services disabled or unavailable.
* **Preconditions:** Active check-in exists; device fails to supply valid GPS coordinates.
* **Expected System Behavior:**
  1. Non-blocking submission: captures server timestamp (`DEC-006`).
  2. Records failure reason: `gps_unavailable_checkout`.
  3. Sets `CheckOutStatus = checked_out_pending_review`.
  4. Preserves verified `CheckInStatus`.
  5. Routes record to Administrator Review Queue.
* **Validation Requirements:** Server timestamp, active check-in check.
* **Employee-Facing Result:** Notice: "Check-out Submitted (Pending Review): Departure timestamp [Time] saved without location. Sent to management for review."
* **Administrator-Facing Result:** Appears in Admin Exception Queue with flag "Check-out Location Unavailable".
* **Related Business Rules:** `DEC-005`, `DEC-006`.
* **Decisions Requiring Owner Approval:** None.

---

### SC-12: Pending Review Holding State
* **Scenario ID:** `SC-12`
* **Title:** Disciplinary & Points Holding Behavior While Pending Review
* **Trigger:** Any Check-in or Check-out operation submitted under `Pending Review` status.
* **Preconditions:** `CheckInStatus == checked_in_pending_review` OR `CheckOutStatus == checked_out_pending_review`.
* **Expected System Behavior:**
  1. System holds the record in suspense (`DEC-007`).
  2. Zero Green points are added to the employee's ledger.
  3. Zero Red penalties or Black Cards are generated.
  4. Preserves the exact original server submission timestamp.
  5. The employee's points balance remains completely unaffected while pending.
* **Validation Requirements:** Points engine withholding guard on pending records (`DEC-007`).
* **Employee-Facing Result:** Points ledger shows no unverified deduction or addition; attendance history shows badge "Pending Review".
* **Administrator-Facing Result:** Highlighted in Exception Queue; excluded from penalty export batches until resolved.
* **Related Business Rules:** `DEC-007` (Points Holding Policy).
* **Decisions Requiring Owner Approval:** None.

---

### SC-13: Approved GPS Exception (Administrative Decision)
* **Scenario ID:** `SC-13`
* **Title:** Administrator Approves a Pending Review Attendance Operation
* **Trigger:** Administrator reviews a pending exception in the queue and clicks "Approve".
* **Preconditions:** User has `Admin` or `Manager` role; target record has pending operation.
* **Expected System Behavior:**
  * **If approving a Check-in Exception:**
    1. Accepts the original arrival event. Sets `CheckInStatus = checked_in_verified`.
    2. Evaluates arrival classification using the **original submission timestamp**, NOT the approval timestamp (`DEC-007`).
    3. Applies corresponding approved points rules (e.g. +1 Green if original time was Early; Red penalty if Late; Black Card if between Cutoff and Shift End).
  * **If approving a Check-out Exception:**
    1. Accepts the original departure event and timestamp. Sets `CheckOutStatus = checked_out_verified`.
    2. Transitions `AttendanceDayStatus` to `completed`.
    3. **Strict Constraint:** Does NOT evaluate arrival classification for Check-out; does NOT generate arrival points or penalties (`DEC-021` OPEN).
  * Writes full audit event (`actor_id, operation_type, decision: approved, original_time, approved_at`).
* **Validation Requirements:** Role check (`Admin`/`Manager`), operation type discrimination (`DEC-007`).
* **Employee-Facing Result:** In-app status updates to "Approved". If Check-in, points ledger reflects earned points/penalties retroactively.
* **Administrator-Facing Result:** Record cleared from Exception Queue; reflected in attendance grid as verified.
* **Related Business Rules:** `DEC-007` (Retroactive Evaluation at Original Time).
* **Decisions Requiring Owner Approval:** Check-out impact on points (`DEC-021` OPEN).

---

### SC-14: Rejected GPS Exception (Administrative Decision)
* **Scenario ID:** `SC-14`
* **Title:** Administrator Rejects a Pending Review Attendance Operation
* **Trigger:** Administrator reviews a pending exception (e.g. employee was at home) and clicks "Reject".
* **Preconditions:** User has `Admin` or `Manager` role; target record has pending operation.
* **Expected System Behavior:**
  1. System requires a **mandatory administrative rejection reason** (`min_length >= 10`).
  2. Sets `CheckInStatus = checked_in_rejected` or `CheckOutStatus = checked_out_rejected`.
  3. Awards **zero points** for the rejected operation.
  4. **Strict Constraint:** A rejected Check-in does NOT automatically generate an unexcused absence or Black Penalty. Rejection signifies that submitted attendance evidence was not accepted. The resulting absence classification and disciplinary consequence must follow a separately defined and approved absence policy (`DEC-023` OPEN).
  5. If Check-out is rejected, the previously verified Check-in remains valid; record is flagged as incomplete departure.
  6. Preserves complete event telemetry, rejection reason, and review history in immutable audit logs.
* **Validation Requirements:** Role check, non-empty rejection reason string.
* **Employee-Facing Result:** Notification: "Attendance submission of [Date] was rejected by management. Reason: [Admin Reason]." Status marked Rejected.
* **Administrator-Facing Result:** Cleared from queue; archived in audit log; marked Rejected in operational reports.
* **Related Business Rules:** `DEC-007`, `DEC-023` (Absence Policy for Rejected Exceptions — OPEN).
* **Decisions Requiring Owner Approval:** Disciplinary and absence consequences of rejected attendance submissions (`DEC-023` OPEN).

---

### SC-15: Duplicate Check-in Attempt
* **Scenario ID:** `SC-15`
* **Title:** Duplicate Arrival Check-in Prevention
* **Trigger:** Employee clicks "Check In" multiple times or submits another check-in while already checked in.
* **Preconditions:** An `AttendanceRecord` already exists for this shift.
* **Expected System Behavior:**
  1. Idempotency guard blocks duplicate creation.
  2. Zero duplicate records or duplicate points generated.
  3. Replay event logged in technical audit log.
* **Validation Requirements:** Unique constraint `(employee_id, shift_occurrence_id)`.
* **Employee-Facing Result:** Informational banner: "You are already checked in for today's shift at [Timestamp]."
* **Administrator-Facing Result:** Clean data grid with single record; duplicate attempt noted in technical logs.
* **Related Business Rules:** System Idempotency.
* **Decisions Requiring Owner Approval:** None.

---

### SC-16: Duplicate Check-out Attempt
* **Scenario ID:** `SC-16`
* **Title:** Duplicate Departure Check-out Prevention
* **Trigger:** Employee clicks "Check Out" multiple times or after departure was already confirmed.
* **Preconditions:** `AttendanceRecord` already contains a non-null `checked_out_at` timestamp.
* **Expected System Behavior:**
  1. Server verifies `checked_out_at` is already populated.
  2. Rejects request without modifying existing departure timestamp.
* **Validation Requirements:** State guard checking `checked_out_at == null`.
* **Employee-Facing Result:** Notice: "Your departure was already recorded at [Timestamp]."
* **Administrator-Facing Result:** No change to attendance record.
* **Related Business Rules:** System Idempotency.
* **Decisions Requiring Owner Approval:** None.

---

### SC-17: Forgotten Check-out
* **Scenario ID:** `SC-17`
* **Title:** Shift Expires Without Departure Check-out
* **Trigger:** Employee checked in, but daily operations close without a recorded check-out.
* **Preconditions:** Record has `checked_in_at != null`, but `checked_out_at == null` past the end of the shift / day.
* **Expected System Behavior:**
  1. *Proposed System Behavior (`PROPOSAL` — Pending Owner Approval):* An automated end-of-day reconciliation job identifies unclosed attendance records and transitions status to **`incomplete`** for administrative review (`PROPOSAL` / `DEC-018` OPEN).
  2. The record is surfaced in the Administrator Review Console under an "Incomplete Attendance Queue".
  3. **Strict Non-Punitive Baseline:** Zero automated financial penalties, point deductions, or disciplinary strikes are applied (`DEC-018` OPEN). The system records the missing departure factually without punitive action unless explicitly approved by the Project Owner.
* **Validation Requirements:** End-of-day scheduler query for shifts where `checked_in_at != null` and `checked_out_at == null`.
* **Employee-Facing Result:** Attendance history displays status badge "Incomplete (Missing Check-out)" with an advisory note directing the employee to contact their administrator.
* **Administrator-Facing Result:** Displayed in the Incomplete Records Queue with check-in timestamp and prompt to enter verified departure time or close shift with mandatory reason (`DEC-018` OPEN).
* **Related Business Rules:** Non-punitive baseline policy (`DEC-018` OPEN).
* **Decisions Requiring Owner Approval:** Formal operational procedure and status transitions for forgotten check-outs (`DEC-018` OPEN). Automatic transition to `incomplete` and reconciliation scheduling remain strictly `PROPOSAL`.

---

### SC-18: Administrative Attendance Record Correction
* **Scenario ID:** `SC-18`
* **Title:** Manual Adjustment of Attendance Records by Administrator
* **Trigger:** Administrator manually corrects an attendance record (e.g. entering verified departure time for a forgotten check-out).
* **Preconditions:** User has `Admin` or `Owner` role; mandatory written justification provided.
* **Expected System Behavior:**
  1. Validates that `check_in < check_out`.
  2. Updates record timestamps and sets `is_manually_adjusted = true`.
  3. Logs immutable before/after diff in `AuditEvent`.
  4. Zero automated point deductions or changes.
* **Validation Requirements:** Role authorization, non-empty justification string (`min_length >= 10`).
* **Employee-Facing Result:** Record updated in history with badge "Adjusted by Admin" and reason tooltip.
* **Administrator-Facing Result:** Record successfully updated; visible in audit trail with complete actor and timestamp metadata.
* **Related Business Rules:** Administrative Overrides & Auditability.
* **Decisions Requiring Owner Approval:** None.

---

### SC-19: Check-out Before Scheduled Shift End (Early Departure)
* **Scenario ID:** `SC-19`
* **Title:** Check-out Initiated Before Scheduled Shift End
* **Trigger:** Employee explicitly taps "Check Out" before the configured shift end time.
* **Preconditions:** Employee has an active verified or pending check-in for the current shift (`checked_in_at != null` and `checked_out_at == null`); current server timestamp < scheduled shift end.
* **Expected System Behavior:**
  1. Captures authoritative server departure timestamp (`checked_out_at = ServerTimeUtc`).
  2. Performs point-in-time GPS coordinate capture and geofence validation against assigned worksite (`DEC-005`). If GPS verification fails, routes departure to `Pending Review` (`DEC-006`).
  3. *Proposed System Behavior (`PROPOSAL` — Pending Owner Approval):* Calculates elapsed presence duration (`checked_out_at - checked_in_at`) as informational metadata (`PROPOSAL` / `DEC-020` OPEN). Flags check-out record as `completed_early_departure` (`PROPOSAL` / `DEC-019` OPEN).
  4. **Strict Non-Punitive Baseline:** Zero automated point deductions, zero penalty strikes, and zero financial deductions are applied (`DEC-019` OPEN, `DEC-021` OPEN). Early departure is recorded factually without automatic penalty unless explicitly approved by the Project Owner.
* **GPS Validation:** Point-in-time GPS coordinate capture and geofence matching against assigned worksite coordinates (`DEC-005`). If outside geofence or GPS fails, routes departure to `Pending Review` with diagnostics (`DEC-006`).
* **Employee-Facing Result:** Departure receipt displayed: "Check-out Recorded at [Timestamp]. Departure before scheduled shift end." Dashboard updates to show completed presence. Zero points deducted.
* **Administrator-Facing Result:** Daily attendance monitoring grid shows departure timestamp, presence duration, and an informational `Early Departure` tag for operational reporting. Zero disciplinary strikes generated.
* **Related Business Rules:** `DEC-002` (Check-out in MVP), `DEC-005` (Dual GPS), `DEC-019` (Early Departure Policy — OPEN), `DEC-020` (Net Shift Duration — OPEN), `DEC-021` (Check-out Points Impact — OPEN).
* **Decisions Requiring Owner Approval:** Disciplinary consequences, grace periods, or manager authorization rules for early departure remain an unapproved business decision (`DEC-019` OPEN). Informational duration display and `completed_early_departure` flag remain strictly `PROPOSAL`.

---

### SC-20: Check-out After Scheduled Shift End
* **Scenario ID:** `SC-20`
* **Title:** Check-out Initiated After Scheduled Shift End
* **Trigger:** Employee explicitly taps "Check Out" after the scheduled shift end time has passed.
* **Preconditions:** Employee has an active check-in for the current shift (`checked_in_at != null` and `checked_out_at == null`); current server timestamp >= scheduled shift end; shift has not yet been closed by end-of-day reconciliation.
* **Expected System Behavior:**
  1. Captures authoritative server departure timestamp (`checked_out_at = ServerTimeUtc`).
  2. Performs point-in-time GPS coordinate capture and geofence validation against assigned worksite (`DEC-005`). If GPS verification fails, routes departure to `Pending Review` (`DEC-006`).
  3. Transitions check-out state to `completed` (`DEC-002`).
  4. *Proposed System Behavior (`PROPOSAL`):* Calculates total presence duration (`checked_out_at - checked_in_at`) as informational metadata (`PROPOSAL` / `DEC-020` OPEN).
  5. **Zero Points Impact:** Generates strictly zero points, awards, or penalties (`DEC-021` OPEN). Check-out records departure and duration only.
* **GPS Validation:** Point-in-time GPS coordinate capture and geofence verification (`DEC-005`).
* **Employee-Facing Result:** Departure receipt: "Check-out Confirmed at [Timestamp]. Shift completed." Dashboard transitions to off-duty state.
* **Administrator-Facing Result:** Monitoring grid reflects completed shift with arrival time, departure time, and total duration.
* **Related Business Rules:** `DEC-002` (Check-out in MVP), `DEC-005` (Dual GPS), `DEC-020` (Duration — OPEN), `DEC-021` (Zero Points — OPEN).
* **Decisions Requiring Owner Approval:** Overtime tracking or after-hours compensation rules, if any, are permanently out of MVP scope. Net duration calculation remains informational (`DEC-020` OPEN).

---

### SC-21: Check-out Without an Existing Check-in
* **Scenario ID:** `SC-21`
* **Title:** Check-out Attempted Without Prior Arrival Check-in
* **Trigger:** Employee attempts to tap "Check Out" when no active check-in record exists for the shift or day.
* **Preconditions:** Employee is authenticated; record has `checked_in_at == null` for the current shift/day.
* **Expected System Behavior:**
  1. System enforces chronological order-of-operations: departure cannot precede arrival.
  2. Blocks departure submission at the API/domain boundary.
  3. Displays an actionable error message to the employee.
  4. Records the unfulfilled check-out attempt in security/operational telemetry without modifying attendance records.
  5. Zero points, zero rewards, and zero penalties are generated.
* **GPS Validation:** Evaluated or bypassed; blocked at domain validation layer prior to attendance persistence.
* **Employee-Facing Result:** High-visibility notification: "Cannot Check Out: No check-in recorded for today. Please record your arrival check-in first, or contact your supervisor if your arrival window has closed."
* **Administrator-Facing Result:** Employee remains classified as unrecorded / absent pending reconciliation. Telemetry log records check-out attempt without check-in for supervisor visibility.
* **Related Business Rules:** `DEC-002` (Dual Attendance Tracking in MVP), `DEC-004` (Shift End Closure).
* **Decisions Requiring Owner Approval:** Administrative procedure for handling employees who worked but failed to check in before checking out (`DEC-024` OPEN).
