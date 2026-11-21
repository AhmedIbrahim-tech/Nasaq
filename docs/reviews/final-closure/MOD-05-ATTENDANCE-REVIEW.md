# MOD-05 — Attendance Engine — Comprehensive Engineering Review & Closure Audit

## 1. Scope
This document provides an evidence-based audit of **MOD-05: Attendance Engine** in NASAQ. The engine governs dual Check-in and Check-out operations, GPS geofence distance calculation, non-blocking GPS exception handling (`DEC-006`), arrival classification windows (`DEC-003`), after-cutoff Black Card assignment (`DEC-004`), and attendance record lifecycle management.

---

## 2. Implementation Inventory

### 2.1 Backend Domain & Data Entities
- **Domain Entities:**
  - `Domain.Entities.AttendanceRecord`: Stores daily attendance data (`EmployeeId`, `Date`, `WorkLocationId`, `WorkShiftId`, `CheckInTimeUtc`, `CheckOutTimeUtc`, `CheckInStatus`, `CheckOutStatus`, `ArrivalClassification`, `Status`, `CheckInDistanceMeters`, `CheckOutDistanceMeters`, `DurationMinutes`, `CheckInFailureReason`, `CheckOutFailureReason`).
- **Domain Enums:**
  - `Domain.Enums.AttendanceStatus`: `Present`, `Absent`, `Late`, `PendingReview`, `Completed`, `Incomplete`, `ExcusedLeave`
  - `Domain.Enums.VerificationStatus`: `Verified`, `PendingReview`, `Rejected`
  - `Domain.Enums.ArrivalClassification`: `OnTime`, `Early`, `Late`, `AfterCutoff`, `Standard`
- **Database Configuration:**
  - `backend/Infrastructure/Data/Configurations/AttendanceRecordConfiguration.cs`
- **EF Core Migration:**
  - `20261120231416_AddAttendanceEngine.cs`

### 2.2 Application Services & CQRS
- **Geofence Service:**
  - `backend/Application/Abstractions/IGeofenceService.cs`
  - `backend/Infrastructure/Services/GeofenceService.cs` (Calculates geodesic distance via Great-Circle / Haversine formula)
- **Attendance CQRS:**
  - Commands:
    - `CheckInCommand` / `CheckInHandler` (Validates geofence, records server time, resolves shift, transitions to `PendingReview` if GPS fails under `DEC-006`, evaluates eligible arrival points under `DEC-007`)
    - `CheckOutCommand` / `CheckOutHandler` (Validates open session, records departure timestamp and GPS telemetry, calculates net elapsed duration, sets `Completed` status)
  - Queries:
    - `GetCurrentAttendanceStatusQuery` / `GetCurrentAttendanceStatusHandler`
    - `GetMyAttendanceHistoryQuery` / `GetMyAttendanceHistoryHandler`
    - `GetAttendanceRecordsQuery` / `GetAttendanceRecordsHandler`
    - `GetAttendanceRecordByIdQuery` / `GetAttendanceRecordByIdHandler`

### 2.3 API Endpoints & Routing
- `POST /api/v1/attendance/check-in` — Authenticated employee arrival check-in
- `POST /api/v1/attendance/check-out` — Authenticated employee departure check-out
- `GET /api/v1/attendance/current-status` — Today's shift context, current state, active record
- `GET /api/v1/attendance/my-history` — Paginated history of authenticated employee
- `GET /api/v1/attendance/records` — Administrative/Supervisor attendance monitoring grid
- `GET /api/v1/attendance/records/{id}` — Attendance record details

### 2.4 Frontend Presentation (Next.js 16)
- **Page Container:** `frontend/src/app/(Dashboard)/attendance/page.tsx`
- **Main View:** `frontend/src/modules/attendance/views/AttendanceView.tsx`
- **Components:**
  - `CheckInCard.tsx`: Interactive check-in/out terminal with browser GPS capture, accuracy display, and real-time state switching.
  - `AttendanceStatusCard.tsx`: Operational overview showing shift name, location name, geofence radius, and today's status badges.
  - `AttendanceHistoryTable.tsx`: Tabular history table displaying check-in/out timestamps, GPS distance, status badges, and duration.
- **Service & Types:**
  - `frontend/src/modules/attendance/services/attendance.service.ts`
  - `frontend/src/modules/attendance/types/index.ts`

---

## 3. Expected Behavior
1. **Dual Check-in & Check-out (`DEC-002`):** Both operations are mandatory MVP features with server-authoritative timestamps.
2. **Dual Point-in-Time GPS Validation (`DEC-005`):** GPS is captured point-in-time on check-in and check-out; background continuous tracking is strictly prohibited.
3. **Non-Blocking GPS Exception Submission (`DEC-006`):** If GPS is disabled, unavailable, low accuracy, or outside the assigned geofence, the submission is **accepted**, server timestamp is preserved, failure diagnostics are stored, status is set to `PendingReview`, and the case is held for administrative review.
4. **Pending Review Point Holding (`DEC-007`):** While `PendingReview`, zero finalized Green, Red, or Black points are awarded.
5. **After-Cutoff Handling (`DEC-004`):** Check-in between Cutoff and Shift End is marked **Present**, assigned a **Black Card**, and immediately notified.
6. **Concurrent & Duplicate Guard:** Employees cannot check in twice concurrently without checking out first, and cannot check out without an active check-in.

---

## 4. Actual Behavior Before Fixes
- Earlier conceptual drafts suggested rejecting out-of-bounds GPS attempts with 400 Bad Request.
- This was identified as a critical business defect violating `DEC-006`.
- The implementation was audited and confirmed: both `CheckInHandler` and `CheckOutHandler` implement non-blocking submission to `PendingReview` with full GPS failure telemetry (`outside_geofence`, `low_accuracy`, `gps_unavailable`).
- Frontend check-in terminal was verified to gracefully transmit coordinates or null coordinates when device geolocation fails.

---

## 5. Test Matrix

| Test ID | Scenario | Test Type | Result | Evidence | Notes |
|---|---|---|---|---|---|
| MOD05-T01 | Valid GPS Inside Geofence Check-in | Integration | PASS | `WorkflowA` in `IntegratedWorkflowsTests.cs` | Status = Present, CheckInStatus = Verified |
| MOD05-T02 | Valid GPS Inside Geofence Check-out | Integration | PASS | `WorkflowA` in `IntegratedWorkflowsTests.cs` | Status = Completed, CheckOutStatus = Verified |
| MOD05-T03 | Geofence Breach (5km Away) Check-in | Integration | PASS | `WorkflowC` in `IntegratedWorkflowsTests.cs` | Accepted under DEC-006, Status = PendingReview |
| MOD05-T04 | Low GPS Accuracy Check-in | Unit / Integration | PASS | `CheckInHandlerTests` | Accuracy > threshold -> PendingReview |
| MOD05-T05 | After-Cutoff Check-in Before Shift End | Integration | PASS | `WorkflowF` in `IntegratedWorkflowsTests.cs` | Status = Present, Classification = AfterCutoff, Black Card |
| MOD05-T06 | Duplicate Check-in Guard | Integration | PASS | `WorkflowD` in `IntegratedWorkflowsTests.cs` | Returns 409 Conflict |
| MOD05-T07 | Check-out Without Check-in Guard | Integration | PASS | `WorkflowG` in `IntegratedWorkflowsTests.cs` | Returns 400 BadRequest with guidance |
| MOD05-T08 | Overnight Shift Check-out Duration | Integration | PASS | `WorkflowB` in `IntegratedWorkflowsTests.cs` | Accurate elapsed hours calculated across midnight |
| MOD05-T09 | Geofence Haversine Accuracy | Unit | PASS | `GeofenceServiceTests.cs` (7 test cases) | Verified within 0.1% geodesic error tolerance |

---

## 6. Defects Discovered & Resolved
- **DEF-05-01 (Strict Enforcement of DEC-006 Non-Blocking Submission):**
  - *Severity:* P0 (Business Rule Critical)
  - *Root Cause:* Initial proposal considered hard-blocking outside-geofence check-ins.
  - *Fix:* Audited and verified `CheckInHandler.cs` and `CheckOutHandler.cs`. Out-of-bounds coordinates transition to `VerificationStatus.PendingReview`, preserving the server timestamp and recording diagnostics without rejection.
  - *Verification:* Verified via integration test `WorkflowC_GeofenceBreach_ResultsInPendingReviewStatusAndPoints`.
- **DEF-05-02 (DEC-004 Black Card Assignment):**
  - *Severity:* P1 (Business Alignment)
  - *Root Cause:* Ensuring check-in between Cutoff and Shift End marks the employee `Present` (not `Absent`) with an `AfterCutoffArrival` Black Card.
  - *Fix:* Verified `ShiftResolutionService` and `PointCalculationEngine` mapping for `ArrivalClassification.AfterCutoff`.
  - *Verification:* Executed test `WorkflowF_AfterCutoffCheckIn_AssignsPresentStatusAndBlackCardUnderDEC004` (Pass).

---

## 7. Business Rule Compliance

| Decision / Requirement | Expected | Actual Implementation | Compliant? | Evidence |
|---|---|---|---|---|
| **DEC-002** (Dual Actions) | Check-in and Check-out both supported in MVP | Handled via `CheckInCommand` and `CheckOutCommand` | **YES** | `CheckInHandler.cs`, `CheckOutHandler.cs` |
| **DEC-003** (Time Windows) | Configurable arrival classification | Resolved via `IShiftResolutionService` | **YES** | `ShiftResolutionService.cs#L113-L155` |
| **DEC-004** (After Cutoff) | Present with Black Card after cutoff | Marked `Present`, `AfterCutoff`, category `Black` | **YES** | Test `WorkflowF`, `ShiftResolutionService.cs#L125` |
| **DEC-005** (Dual GPS) | Point-in-time GPS on both operations | Coordinates captured on both Check-in & Check-out | **YES** | `AttendanceRecord.cs#L22-L37` |
| **DEC-006** (Non-Blocking GPS) | Accepted to `Pending Review`, not discarded | Stored with server time and failure diagnostics | **YES** | Test `WorkflowC`, `CheckInHandler.cs#L98-L103` |
| **DEC-007** (Point Holding) | Zero points awarded while Pending Review | `PointTransactionStatus.PendingReview` held | **YES** | `PointCalculationEngine.cs#L36-L40`, Test `WorkflowC` |

---

## 8. Security Review
- Server-authoritative timestamps are generated exclusively via `DateTime.UtcNow`; client-supplied timestamps are never trusted.
- Identity resolution strictly binds the authenticated `UserId` to the active `Employee` record. Spoofing attendance on behalf of another user is prohibited.
- Geofence calculations run server-side using double-precision trigonometric Haversine algorithms.

---

## 9. Database Review
- Table: `AttendanceRecords`.
- Composite indexes on `(EmployeeId, Date)` and `(EmployeeId, CheckOutTimeUtc)`.
- Foreign keys properly mapped to `Employees`, `WorkLocations`, and `WorkShifts`.
- Migration `20261120231416_AddAttendanceEngine` is clean and fully in sync with EF Core snapshot.

---

## 10. Frontend Review
- Responsive Check-in Terminal switches dynamically between "Check In" and "Check Out" states without manual page refresh.
- Browser Geolocation API is invoked strictly point-in-time upon user button click; zero background tracking occurs.
- Fallback UI displays clear guidance when browser denies location access.

---

## 11. Commands Executed
- `dotnet test backend/Tests/Tests.csproj --filter "FullyQualifiedName~Attendance|FullyQualifiedName~Geofence|FullyQualifiedName~IntegratedWorkflows"` (Exit Code: 0, 100% Pass)
- `node frontend/node_modules/typescript/bin/tsc --project frontend/tsconfig.json --noEmit` (Exit Code: 0)
- `npm run build --prefix frontend` (Exit Code: 0, Route `/attendance` compiled statically)

---

## 12. Files Modified
- `backend/Application/Features/Attendance/Commands/CheckIn/CheckInHandler.cs`
- `backend/Application/Features/Attendance/Commands/CheckOut/CheckOutHandler.cs`
- `backend/Infrastructure/Services/GeofenceService.cs`
- `backend/Tests/Attendance/GeofenceServiceTests.cs`
- `backend/Tests/Integration/IntegratedWorkflowsTests.cs`
- `frontend/src/modules/attendance/views/AttendanceView.tsx`

---

## 13. Remaining Issues & Blocking Dependencies
- **MOD-09 (Administrative Exception Review Queue):** While MOD-05 successfully flags and persists exceptions in `PendingReview` with server timestamps and GPS diagnostics (`DEC-006`), the dedicated UI queue for administrators to approve/reject these pending attendance exceptions is part of **MOD-09**. This is an external module dependency for administrative resolution, not a defect in MOD-05 itself.

---

## 14. Closure Recommendation
**READY FOR CLOSURE (Core Attendance Operations)**
MOD-05 strictly fulfills `DEC-002`, `DEC-003`, `DEC-004`, `DEC-005`, `DEC-006`, and `DEC-007`. Core check-in, check-out, geofence validation, and non-blocking exception recording are 100% verified and operational.
