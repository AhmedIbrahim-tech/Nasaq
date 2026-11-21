# NASAQ — Developer Seed Data Architecture & Verification Scenarios
## Automated Idempotent Test Fixtures for MOD-04, MOD-06, MOD-07, and MOD-09

**Target:** `D:\Projects\NASAQ`  
**Author:** NASAQ Engineering Agent  
**Environment:** ASP.NET Core 10 (`Development` profile only)  
**Safety Status:** Non-destructive, idempotent, tagged fixtures  

---

## 1. Architecture & Safety Controls

### 1.1 Non-Destructive Guard
- The developer seeder (`backend/Infrastructure/Data/DevDataSeeder.cs`) executes exclusively within `DbInitializer.SeedAsync()` under the `Development` environment.
- It operates using an idempotent presence check:
  ```csharp
  private const string FixtureMarker = "DEV_FIXTURE";
  ```
- Before seeding any entity collection, `DevDataSeeder` evaluates whether fixtures matching `FixtureMarker` or standard business codes already exist. If found, seeding for that collection is safely skipped without mutating or duplicating data.
- **Production Guard:** Zero execution in `Production` or `Staging` environments. The seeding routine explicitly verifies `app.Environment.IsDevelopment()` before invocation.
- **Zero Table Wipes:** No `DROP TABLE`, `TRUNCATE`, or `DELETE FROM` statements are ever executed. Existing real administrative data remains intact.

---

## 2. Realistic Seed Scenarios by Module

### 2.1 MOD-04: Work Schedules & Shifts
- **Shifts Seeded:**
  - `Morning Shift (صباحي)`: 08:00 – 16:00 (Cutoff 09:30).
  - `Evening Shift (مسائي)`: 16:00 – 00:00 (Cutoff 17:30).
  - `Night Shift (ليلي)`: 00:00 – 08:00 (Cutoff 01:30).
- **Schedules Seeded:**
  - `Standard Office Schedule (الدوام المكتبي القياسي)`: 5 work days (Sunday through Thursday) with 8 daily hours. Friday and Saturday set as rest days.
- **Assignments Seeded:**
  - Active assignment for `EMP-001` (Ahmed Ibrahim).
  - Active assignment for `EMP-SUPER01` (System SuperAdmin).

### 2.2 MOD-06: Points & Penalties Ledger
- **Point Rules Seeded:**
  - `Early / On-Time Arrival (+1 Green)`: `PointEventType.OnTimeArrival`.
  - `Late Arrival (-1 Red)`: `PointEventType.LateArrival`.
  - `Absence Without Permission (-3 Black)`: `PointEventType.Absence`.
  - `Early Departure (-1 Red)`: `PointEventType.EarlyDeparture`.
- **Transactions Seeded:**
  - `+1 Green Point (Finalized)`: On-time arrival bonus for `EMP-001`.
  - `-1 Red Point (Finalized)`: Late arrival penalty for `EMP-001`.
  - `+5 Green Points (Finalized)`: Manual supervisor adjustment for `EMP-001`.
  - `+1 Green Point (PendingReview)`: GPS exception under review for `EMP-SUPER01`.
  - `+2 Green Points (Reversed)`: Reversed attendance bonus for `EMP-SUPER01`.

### 2.3 MOD-07: Leave Management
- **Leave Types Confirmed:**
  - Annual Leave (إجازة سنوية) — Paid, max 30 days.
  - Sick Leave (إجازة مرضية) — Paid, requires medical report attachment.
  - Emergency Leave (إجازة اضطرارية) — Paid, max 5 days.
  - Unpaid Leave (إجازة بدون راتب) — Unpaid.
- **Leave Requests Seeded:**
  - `Approved Annual Leave`: For `EMP-001` with approval history from `EMP-SUPER01`.
  - `Pending Sick Leave`: For `EMP-001` with attached medical report awaiting supervisor review.
  - `Rejected Emergency Leave`: For `EMP-002` with explicit rejection reason recorded.
  - `Cancelled Unpaid Leave`: For `EMP-001` voluntarily cancelled by employee.

### 2.4 MOD-09: Admin Operations & Daily Attendance
- **Daily Attendance Records Seeded:**
  1. `Normal Completed Attendance`:
     - Employee: `EMP-001`.
     - Check-in: 08:02 (On-time, Verified, 18m from geofence).
     - Check-out: 16:05 (Completed, Verified).
     - Status: `Completed`.
  2. `Incomplete Attendance (Populates Incomplete Attendance Tab)`:
     - Employee: `EMP-SUPER01`.
     - Check-in: Yesterday 08:30 (Verified).
     - Check-out: `null` (Missing check-out).
     - Status: `Incomplete`.
     - Action Target: Enables "تصحيح الانصراف يدويًا" in Admin Operations tab.
  3. `Pending Review Check-in (Populates GPS Exceptions Queue)`:
     - Employee: `EMP-SUPER01`.
     - Check-in: Today 08:45 (Status: `PendingReview`).
     - Check-in Failure Reason: `low_accuracy: device reported 209m, threshold is 50m`.
     - Action Target: Enables GPS Approve/Reject actions in Admin Operations tab.
  4. `Pending Review Check-out (Populates GPS Exceptions Queue)`:
     - Employee: `EMP-001`.
     - Check-out Failure Reason: `outside_geofence_checkout: 320m (radius is 200m)`.
     - Action Target: Enables GPS Approve/Reject actions in Admin Operations tab.

---

## 3. Verification Log & Status

- **Startup Execution Log:**
  ```text
  info: Infrastructure.Data.DbInitializer[0] [DevDataSeeder] Seeded 3 Shifts and 1 Schedule.
  info: Infrastructure.Data.DbInitializer[0] [DevDataSeeder] Seeded 2 Schedule Assignments.
  info: Infrastructure.Data.DbInitializer[0] [DevDataSeeder] Seeded 4 Point Rules and 5 Transactions.
  info: Infrastructure.Data.DbInitializer[0] [DevDataSeeder] Seeded 4 Leave Requests.
  info: Infrastructure.Data.DbInitializer[0] [DevDataSeeder] Seeded 4 Attendance Records.
  info: Infrastructure.Data.DbInitializer[0] [DevDataSeeder] Development fixtures check completed.
  ```
- **Idempotency Confirmed:** Running subsequent restarts causes `DevDataSeeder` to detect existing fixtures and skip without modifying counts or throwing key constraints.
