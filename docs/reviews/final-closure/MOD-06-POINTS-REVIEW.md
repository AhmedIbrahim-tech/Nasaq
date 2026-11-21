# MOD-06 — Points & Penalties Engine — Comprehensive Engineering Review & Closure Audit

## 1. Scope
This document provides an evidence-based audit of **MOD-06: Points & Penalties Engine** in NASAQ. The module implements the gamified disciplinary and reward framework: Green Points (rewards), Red Penalties (late arrivals), Black Cards (punctuality marker for present employees after cutoff under `DEC-004`), and Black Penalties (disciplinary markers for unexcused absences). It also governs point ledger persistence, administrative reversals, and integration with the attendance engine under `DEC-007`.

---

## 2. Implementation Inventory

### 2.1 Backend Domain & Data Entities
- **Domain Entities:**
  - `Domain.Entities.PointRule`: Rule definitions (`Name`, `Description`, `Category` [Green/Red/Black], `EventType`, `Points`, `EffectiveFrom`, `EffectiveTo`, `IsActive`).
  - `Domain.Entities.PointTransaction`: Immutable double-entry ledger records (`EmployeeId`, `RuleId`, `Category`, `EventType`, `Points`, `Status` [Finalized/PendingReview/Reversed], `SourceEventType`, `SourceEventId`, `Date`, `TimestampUtc`, `Reason`, `RelatedTransactionId`).
- **Domain Enums:**
  - `Domain.Enums.PointCategory`: `Green`, `Red`, `Black`
  - `Domain.Enums.PointEventType`: `OnTimeArrival`, `EarlyArrival`, `LateArrival`, `AfterCutoffArrival`, `UnexcusedAbsence`, `CompletedShift`, `ManualAdjustment`, `PenaltyReversal`, `PointsRedemption`
  - `Domain.Enums.PointTransactionStatus`: `Finalized`, `PendingReview`, `Reversed`
- **Database Configurations:**
  - `backend/Infrastructure/Data/Configurations/PointRuleConfiguration.cs`
  - `backend/Infrastructure/Data/Configurations/PointTransactionConfiguration.cs`
- **EF Core Migration:**
  - `20261120231839_AddPointsAndPenaltiesEngine.cs`

### 2.2 Application Services & CQRS
- **Point Calculation Engine:**
  - `backend/Application/Abstractions/IPointCalculationEngine.cs`
  - `backend/Infrastructure/Services/PointCalculationEngine.cs`
- **Points CQRS:**
  - Commands:
    - `CreatePointRuleCommand` / `CreatePointRuleHandler`
    - `UpdatePointRuleCommand` / `UpdatePointRuleHandler`
    - `TogglePointRuleStatusCommand` / `TogglePointRuleStatusHandler`
    - `ReversePointTransactionCommand` / `ReversePointTransactionHandler`
    - `EvaluateAttendanceRecordCommand` / `EvaluateAttendanceRecordHandler`
  - Queries:
    - `GetPointRulesQuery` / `GetPointRulesHandler`
    - `GetPointRuleByIdQuery` / `GetPointRuleByIdHandler`
    - `GetMyPointsSummaryQuery` / `GetMyPointsSummaryHandler`
    - `GetMyPointTransactionsQuery` / `GetMyPointTransactionsHandler`
    - `GetPointTransactionsQuery` / `GetPointTransactionsHandler`

### 2.3 API Endpoints & Routing
- `GET /api/v1/points/rules` — List active point rules
- `POST /api/v1/points/rules` — Create point rule (Admin only)
- `GET /api/v1/points/rules/{id}` — Get rule details
- `PUT /api/v1/points/rules/{id}` — Update rule
- `PATCH /api/v1/points/rules/{id}/toggle-status` — Toggle active status
- `GET /api/v1/points/my-summary` — Current employee balances (Green, Red, Black, Pending)
- `GET /api/v1/points/my-transactions` — Authenticated employee ledger history
- `GET /api/v1/points/transactions` — Administrative ledger view across all employees
- `POST /api/v1/points/transactions/{id}/reverse` — Administrative transaction reversal with mandatory reason

### 2.4 Frontend Presentation (Next.js 16)
- **Page Container:** `frontend/src/app/(Dashboard)/points/page.tsx`
- **Main View:** `frontend/src/modules/points/views/PointsView.tsx`
- **Components:**
  - `PointsSummaryCards.tsx`: 4-card operational overview (Green, Red, Black, Pending).
  - `PointsLedgerTable.tsx`: Full double-entry transaction history with badges and reversal actions.
  - `PointRulesTable.tsx`: Configuration table for rules with category chips.
  - `PointRuleFormDialog.tsx`: Dialog to create/edit rules.
  - `ReverseTransactionDialog.tsx`: Dialog for administrative transaction reversal with required justification.
- **Service & Types:**
  - `frontend/src/modules/points/services/points.service.ts`
  - `frontend/src/modules/points/types/index.ts`

---

## 3. Expected Behavior
1. **Punctuality & Attendance Linking (`DEC-003`, `DEC-004`):** Check-in events evaluate active rules to post points (Green for On-Time, Red for Late, Black Card for After-Cutoff).
2. **Pending Review Holding (`DEC-007`):** While attendance is in `PendingReview`, points transactions are placed in `PointTransactionStatus.PendingReview` and do NOT affect active finalized employee balances.
3. **Idempotency Guard:** Repeated evaluation of the same attendance event must never duplicate ledger transactions.
4. **Auditable Reversals:** Transactions cannot be hard-deleted from the database; reversals require an offsetting transaction linked via `RelatedTransactionId` and a mandatory justification reason.
5. **Separation of Black Card vs Black Penalty:** A Black Card for arrival after cutoff (`DEC-004`) is a punctuality marker for a present employee and is NOT an unexcused absence penalty.

---

## 4. Actual Behavior Before Fixes
- The points ledger and rule engine were implemented cleanly in the backend.
- However, the frontend table was previously subject to full-table skeleton flashes during status toggles and filter changes.
- With the fix applied to `ModernizeDataTable`, background revalidation now renders smoothly without table flickering.

---

## 5. Test Matrix

| Test ID | Scenario | Test Type | Result | Evidence | Notes |
|---|---|---|---|---|---|
| MOD06-T01 | On-Time Arrival Awards Green Points | Integration | PASS | `WorkflowA` in `IntegratedWorkflowsTests.cs` | +10 Green points Finalized |
| MOD06-T02 | Geofence Breach Holds Points in PendingReview | Integration | PASS | `WorkflowC` in `IntegratedWorkflowsTests.cs` | Status = PendingReview, Active balance unaffected |
| MOD06-T03 | After-Cutoff Check-in Assigns Black Card | Integration | PASS | `WorkflowF` in `IntegratedWorkflowsTests.cs` | Category = Black, Status = Finalized |
| MOD06-T04 | Administrative Reversal Creates Offsetting Transaction | Integration | PASS | `WorkflowE` in `IntegratedWorkflowsTests.cs` | Original set to Reversed, offsetting +5 posted |
| MOD06-T05 | Idempotent Event Evaluation | Unit / Integration | PASS | `PointCalculationEngineTests.cs` | Duplicate calls yield 0 additional transactions |
| MOD06-T06 | My Points Summary Balance Computation | Integration | PASS | `GetMyPointsSummaryHandlerTests` | Finalized categorized sums match ledger records |
| MOD06-T07 | RBAC on Point Rule Management | Integration | PASS | `AuthorizationTests.cs` | Non-admin accounts blocked |

---

## 6. Defects Discovered & Resolved
- **DEF-06-01 (Idempotent Rule Evaluation Guarantee):**
  - *Severity:* P1 (Financial/Ledger Integrity)
  - *Root Cause:* Potential duplicate transaction creation if `EvaluateAttendanceEventAsync` is called multiple times for the same record.
  - *Fix:* Enforced strict database lookup `t.SourceEventId == attendance.Id && t.RuleId == rule.Id && t.Status != Reversed` before creating transactions.
  - *Verification:* Verified via integration test `WorkflowA` and unit tests in `PointCalculationEngineTests.cs`.
- **DEF-06-02 (Pending Points Separation in Balance Summary):**
  - *Severity:* P1 (Business Rule Compliance — `DEC-007`)
  - *Root Cause:* Ensuring `PendingReview` transactions are not counted in active balances.
  - *Fix:* `GetMyPointsSummaryHandler` computes `Finalized` sums for Green, Red, and Black, keeping `Pending` in a separate holding metric.
  - *Verification:* Verified via `GetMyPointsSummaryHandler` assertions.

---

## 7. Business Rule Compliance

| Decision / Requirement | Expected | Actual Implementation | Compliant? | Evidence |
|---|---|---|---|---|
| **DEC-003** (Arrival Points) | Point awards correspond to configured windows | Evaluated via `PointCalculationEngine` based on `ArrivalClassification` | **YES** | `PointCalculationEngine.cs#L43-L85` |
| **DEC-004** (After Cutoff Black Card) | Black Card assigned for arrival after cutoff | Rule with `PointEventType.AfterCutoffArrival` and `PointCategory.Black` | **YES** | Test `WorkflowF`, `PointCalculationEngine.cs#L47` |
| **DEC-007** (Pending Review Holding) | Zero points finalized while Pending Review | Points set to `PointTransactionStatus.PendingReview`, balance excluded | **YES** | Test `WorkflowC`, `GetMyPointsSummaryHandler.cs#L46-L53` |
| **Ledger Immutability** | No row deletion; audit offsetting reversals | Implemented via `ReversePointTransactionHandler` | **YES** | Test `WorkflowE`, `ReversePointTransactionHandler.cs` |

---

## 8. Security Review
- Only `Admin` and `SuperAdmin` users can create, update, or toggle rules, or execute manual point reversals.
- Employees can only query their own points balance and personal transaction log.
- All reversal operations enforce mandatory justification strings.

---

## 9. Database Review
- Tables: `PointRules`, `PointTransactions`.
- Foreign key constraints: `PointTransactions.EmployeeId` -> `Employees.Id` (`Restrict`), `PointTransactions.RuleId` -> `PointRules.Id` (`Restrict`).
- Migration `20261120231839_AddPointsAndPenaltiesEngine` verified and in sync with EF Core snapshot.

---

## 10. Frontend Review
- Main view `/points` renders summary cards (Green, Red, Black, Pending).
- Interactive transaction ledger table with status chips and modal reversal trigger.
- Full bilingual Arabic/English translations.

---

## 11. Commands Executed
- `dotnet test backend/Tests/Tests.csproj --filter "FullyQualifiedName~Point|FullyQualifiedName~IntegratedWorkflows"` (Exit Code: 0, 100% Pass)
- `node frontend/node_modules/typescript/bin/tsc --project frontend/tsconfig.json --noEmit` (Exit Code: 0)
- `npm run build --prefix frontend` (Exit Code: 0, Route `/points` compiled statically)

---

## 12. Files Modified
- `backend/Application/Features/Points/Queries/GetMyPointsSummary/GetMyPointsSummaryHandler.cs`
- `backend/Infrastructure/Services/PointCalculationEngine.cs`
- `backend/Tests/Points/PointCalculationEngineTests.cs`
- `backend/Tests/Integration/IntegratedWorkflowsTests.cs`
- `frontend/src/modules/points/views/PointsView.tsx`

---

## 13. Remaining Issues & Open Decisions
- **DEC-011 / DEC-012 (Financial Deductions & Values):** Clarification of whether penalties represent binding payroll deductions or internal KPI scores remains `OPEN`.
- **DEC-013 / DEC-014 (30 Green Points Reward & Redemption):** The redemption burning model (e.g. 1 Green for 1 Red, 5 Green for 1 Black Penalty) remains open for owner sign-off.

---

## 14. Closure Recommendation
**READY FOR CLOSURE**
MOD-06 fulfills all core MVP requirements for rule management, arrival point evaluation, pending review holding, and auditable reversals.
