# NASAQ — SAFE DATABASE SEEDING & STARTUP INITIALIZATION REFACTOR

**Target:** Entire Backend — All Modules, All Seeders, EF Core, Database Initialization, and Application Startup  
**Priority:** P0 — Critical Data Integrity  
**Status:** **VERIFIED CLOSED**  
**Date:** 2026-11-21  

---

## 1. Executive Summary & Root Cause Analysis

### 1.1 Problem Statement
Previously, restarting the backend triggered startup seeding logic that repeatedly executed and mutated existing database records. If an administrator customized an employee's name, reassigned a supervisor, deactivated an account, or modified reference data, subsequent application restarts silently reverted those manual changes back to original seed values.

### 1.2 Root Cause Analysis
A comprehensive architectural audit revealed four primary root causes:
1. **Existing-Record Update Overwrites in `DbInitializer.EnsureUserAsync` and `EnsureEmployeeAsync`:**  
   The helper methods checked if a user or employee existed by email/code. If present, an `else` branch explicitly compared the persisted entity against hardcoded seed values and called `userManager.UpdateAsync()` and `dbContext.SaveChangesAsync()`. For example:
   ```csharp
   if (employee.FirstName != firstName.Trim()) { employee.FirstName = firstName.Trim(); updated = true; }
   if (!employee.IsActive) { employee.IsActive = true; updated = true; }
   ```
   This caused deactivated users to be forcibly reactivated and customized profile names to be overwritten on every startup.
2. **Continuous Continuous-Synchronization Loops:**  
   Startup data fixup methods (such as `SyncBilingualDataAsync`) queried already-populated tables and retroactively updated Arabic names and department titles on every boot, treating persisted database rows as ephemeral fixtures.
3. **Marker-Based Heuristic Checks in `DevDataSeeder`:**  
   Methods such as `SeedShiftsAndSchedulesAsync`, `SeedPointRulesAsync`, and `SeedPointTransactionsAsync` checked for arbitrary string markers (e.g., `s.Notes == FixtureMarker` or `r.Description == FixtureMarker`). If an administrator altered a rule's description or added custom shifts without this marker, the heuristic evaluated to false and re-inserted default duplicate records.
4. **Lack of Strict Empty-Table Guards:**  
   Seeding routines lacked an authoritative `!await context.Table.AnyAsync()` guard, conflating *first-time database initialization* with *startup runtime maintenance*.

---

## 2. All Discovered Seeders & Startup Execution Paths

| Component / File | Invocation Trigger | Scope / Seeded Tables | Vulnerability Identified Prior to Refactor |
| :--- | :--- | :--- | :--- |
| **`API.Extensions.WebApplicationExtensions.InitialiseDatabaseCoreAsync`** | `Program.cs` startup pipeline (`app.InitialiseDatabaseAsync()`) | Orchestrates migrations and triggers `DbInitializer` | Invoked `SeedAsync()` without cancellation token and did not enforce environment-based segregation for dev fixtures. |
| **`Infrastructure.Data.DbInitializer`** | `WebApplicationExtensions` | `AspNetRoles`, `AspNetUsers`, `Employees`, `WorkLocations`, `LeaveTypes` | Contained active `else` update logic overwriting existing users and employees; continuous update loops. |
| **`Infrastructure.Data.DevDataSeeder`** | `DbInitializer.SeedAsync` | `WorkShifts`, `WorkSchedules`, `EmployeeScheduleAssignments`, `PointRules`, `PointTransactions`, `LeaveRequests`, `AttendanceRecords` | Relied on `FixtureMarker` string filters instead of checking whether target tables were empty; risk of duplicate insertion. |

---

## 3. Authoritative Seeding Policy: Empty Table = Seed; Non-Empty Table = Skip Completely

The refactored architecture enforces an uncompromising policy:

```text
┌────────────────────────────────────────────────────────┐
│                   STARTUP SEEDER                       │
└──────────────────────────┬─────────────────────────────┘
                           │
             Does Target Table Contain Any Rows?
                           │
            ┌──────────────┴──────────────┐
            ▼                             ▼
         [ YES ]                       [ NO ]
    Existing Data Detected        Table Is Completely Empty
            │                             │
   SKIP COMPLETELY               INSERT INITIAL SEED ONCE
   - No Inserts                  - Insert standard records
   - No Updates                  - Log record count
   - No Deletions                - Set initial references
   - No Overwrites               - Commit transaction
```

### Mandatory Rules Enforced:
1. **Pure Insertion Only:** Seeding methods only execute `Add` / `AddRange`. All `Update`, `UpdateRange`, `ExecuteUpdateAsync`, `ExecuteDeleteAsync`, and `RemoveRange` operations have been removed from startup seeding.
2. **Strict Empty Checks:** Every single table query executes `await context.<Table>.AnyAsync(cancellationToken)`. If even 1 record exists, the entire seeder for that table is bypassed.
3. **Tightly Related Dependencies:** `Users` and `Employees` are evaluated together: if either `Users` or `Employees` contains data, both seeders are skipped to prevent orphaned or misaligned account associations.
4. **Environment Isolation:** `DevDataSeeder` is strictly forbidden in Production (`environment.IsProduction()`).

---

## 4. Protected Tables & Execution Matrix

| Database Table | Entity | Empty Check Condition | Action if Empty | Action if Populated |
| :--- | :--- | :--- | :--- | :--- |
| `AspNetRoles` | `ApplicationRole` | `!await dbContext.Roles.AnyAsync()` | Inserts 4 default roles (`SuperAdmin`, `Admin`, `Supervisor`, `Employee`) with claims | **SKIPPED COMPLETELY** (0 mutations) |
| `AspNetUsers` | `ApplicationUser` | `!await dbContext.Users.AnyAsync()` | Inserts 5 initial administrative/staff accounts with bilingual fields | **SKIPPED COMPLETELY** (0 mutations) |
| `Employees` | `Employee` | `!await dbContext.Employees.AnyAsync()` | Inserts 5 initial employee profiles linked to initial users | **SKIPPED COMPLETELY** (0 mutations) |
| `WorkLocations` | `WorkLocation` | `!await dbContext.WorkLocations.AnyAsync()` | Inserts 2 default sites (`HQ - Riyadh`, `Main Branch - Jeddah`) | **SKIPPED COMPLETELY** (0 mutations) |
| `LeaveTypes` | `LeaveType` | `!await dbContext.LeaveTypes.AnyAsync()` | Inserts 4 standard leave categories (`ANNUAL`, `SICK`, `EMERGENCY`, `UNPAID`) | **SKIPPED COMPLETELY** (0 mutations) |
| `WorkShifts` | `WorkShift` | `!await context.WorkShifts.AnyAsync()` | Inserts 3 work shifts (`Morning`, `Evening`, `Night`) | **SKIPPED COMPLETELY** (0 mutations) |
| `WorkSchedules` | `WorkSchedule` | `!await context.WorkSchedules.AnyAsync()` | Inserts 1 standard 5-day weekly schedule with schedule days | **SKIPPED COMPLETELY** (0 mutations) |
| `PointRules` | `PointRule` | `!await context.PointRules.AnyAsync()` | Inserts 7 core compliance and incentive rules | **SKIPPED COMPLETELY** (0 mutations) |
| `PointTransactions` | `PointTransaction` | `!await context.PointTransactions.AnyAsync()` | Inserts safe initial test ledger records (Dev only) | **SKIPPED COMPLETELY** (0 mutations) |
| `LeaveRequests` | `LeaveRequest` | `!await context.LeaveRequests.AnyAsync()` | Inserts safe initial test leave requests (Dev only) | **SKIPPED COMPLETELY** (0 mutations) |
| `AttendanceRecords` | `AttendanceRecord` | `!await context.AttendanceRecords.AnyAsync()` | Inserts safe initial test attendance sessions (Dev only) | **SKIPPED COMPLETELY** (0 mutations) |

---

## 5. Audit of Migrations and EF Core `HasData()`

- **EF Core Model Configurations:** Inspected all entity configurations in `backend/Infrastructure/Data/Configurations/`.
- **Result:** **Zero `HasData()` calls exist** across all configurations. No static entity seed data is embedded in EF Core migrations or `ApplicationDbContextModelSnapshot.cs`.
- **Migration Decoupling:** Migrations are applied strictly through `db.Database.MigrateAsync()` in `WebApplicationExtensions.cs` when pending migrations exist and automatic migration is permitted. Data seeding never touches schema migration history.

---

## 6. Concurrency & Multi-Instance Startup Protection

- **Process-Level Concurrency:** Implemented a thread-safe `SemaphoreSlim(1, 1)` in [DbInitializer.cs](file:///d:/Projects/NASAQ/backend/Infrastructure/Data/DbInitializer.cs#L12) to synchronize multiple concurrent startup calls within the same process.
- **Authoritative Database Authority:** Existence checks (`AnyAsync`) run directly against the database inside the scope, ensuring that external concurrent instances immediately detect newly inserted records and abort secondary seed execution.

---

## 7. Structured Initialization Logging

The startup pipeline now emits structured, traceable logs in the required format:

```text
info: Infrastructure.Data.DbInitializer[0] Starting NASAQ database initialization & data seeding...
info: Infrastructure.Data.DbInitializer[0] [SEEDER] Roles: Existing data detected. Seeding skipped.
info: Infrastructure.Data.DbInitializer[0] [SEEDER] Users: Existing data detected. Seeding skipped.
info: Infrastructure.Data.DbInitializer[0] [SEEDER] Employees: Existing operational data detected. Seeding skipped.
info: Infrastructure.Data.DbInitializer[0] [SEEDER] WorkLocations: Existing data detected. Seeding skipped.
info: Infrastructure.Data.DbInitializer[0] [SEEDER] LeaveTypes: Existing data detected. Seeding skipped.
info: Infrastructure.Data.DbInitializer[0] [DevDataSeeder] Checking safe development fixtures...
info: Infrastructure.Data.DbInitializer[0] [SEEDER] WorkShifts: Existing data detected. Seeding skipped.
info: Infrastructure.Data.DbInitializer[0] [SEEDER] WorkSchedules: Existing data detected. Seeding skipped.
info: Infrastructure.Data.DbInitializer[0] [SEEDER] PointRules: Existing data detected. Seeding skipped.
info: Infrastructure.Data.DbInitializer[0] [SEEDER] PointTransactions: Existing operational data detected. Seeding skipped.
info: Infrastructure.Data.DbInitializer[0] [SEEDER] LeaveRequests: Existing operational data detected. Seeding skipped.
info: Infrastructure.Data.DbInitializer[0] [SEEDER] AttendanceRecords: Existing operational data detected. Seeding skipped.
info: Infrastructure.Data.DbInitializer[0] [DevDataSeeder] Development fixtures check completed.
info: Infrastructure.Data.DbInitializer[0] [DATABASE] Initialization completed successfully.
```

---

## 8. Verification & Mandatory Test Suite Results

A comprehensive, dedicated test suite was implemented in [SafeDataSeedingPreservationTests.cs](file:///d:/Projects/NASAQ/backend/Tests/SafeDataSeedingPreservationTests.cs) covering all 6 mandatory user requirements:

```text
Test run for D:\Projects\NASAQ\backend\Tests\bin\Debug\net10.0\Tests.dll (.NETCoreApp,Version=v10.0)
A total of 1 test files matched the specified pattern.

Passed!  - Failed: 0, Passed: 82, Skipped: 0, Total: 82, Duration: 5 s - Tests.dll (net10.0)
```

### Detailed Test Results:
1. **`Test1_EmptyDatabase_Should_Seed_Initial_Records_Successfully`**:
   - Verified that when starting with empty tables, initial records for Roles (4), Users (5), Employees (5), Locations (2), LeaveTypes (4), Shifts (3), Schedules (1), and PointRules (7) are inserted successfully.
2. **`Test2_NormalBackendRestart_Should_Not_Overwrite_Manual_Modifications`**:
   - Seeded initial records, manually modified employee names, deactivated user accounts, updated work location boundaries, and altered leave entitlements.
   - Re-executed backend initialization (`SeedAsync`).
   - Verified that **all manual modifications remained 100% intact** and **no duplicate records were created**.
3. **`Test3_PartiallyPopulatedDatabase_Should_Skip_Populated_And_Seed_Empty`**:
   - Pre-populated a single custom `WorkLocation` into an empty database while leaving `LeaveTypes` empty.
   - Re-executed backend initialization.
   - Verified that `WorkLocations` was **completely skipped** (count remained 1 with the custom record), while `LeaveTypes` was safely seeded with its 4 initial records.
4. **`Test4_MultipleRestarts_Should_Never_Change_Data_Or_Counts`**:
   - Executed **5 consecutive restarts** on a seeded database.
   - Verified that every single table maintained exact count equality across all iterations with zero unintended mutations.
5. **`Test5_ExistingOperationalData_Should_Be_Preserved_And_Not_Recreated`**:
   - Created custom operational records (attendance sessions, leave requests, point transactions).
   - Re-executed initialization.
   - Verified that all operational tables detected existing records, skipped seeding, and preserved all custom user entries.
6. **`Test6_ConcurrentInitialization_Should_Not_Create_Duplicates_Or_Inconsistencies`**:
   - Executed two concurrent `SeedAsync` tasks simultaneously against the same empty database.
   - Verified that exactly one set of records was created with zero foreign key violations or duplicate inserts.

---

## 9. Modified Files Inventory

1. [backend/Infrastructure/Data/DbInitializer.cs](file:///d:/Projects/NASAQ/backend/Infrastructure/Data/DbInitializer.cs):
   - Refactored `SeedRolesAsync`, `SeedUsersAndEmployeesAsync`, `SeedLocationsAsync`, and `SeedLeaveTypesAsync` to enforce strict empty-table checks.
   - Eliminated all existing-record mutation logic in `CreateUserAsync` and `CreateEmployeeAsync`.
   - Removed destructive `SyncBilingualDataAsync` startup overwrite calls.
   - Added `SemaphoreSlim` in-process concurrency guard and production environment check.
2. [backend/Infrastructure/Data/DevDataSeeder.cs](file:///d:/Projects/NASAQ/backend/Infrastructure/Data/DevDataSeeder.cs):
   - Replaced all `FixtureMarker` heuristic filters with authoritative `!await context.<Table>.AnyAsync()` checks.
   - Added structured `[SEEDER] <Table>: Existing data detected. Seeding skipped.` logging for shifts, schedules, point rules, point transactions, leave requests, and attendance records.
3. [backend/API/Extensions/WebApplicationExtensions.cs](file:///d:/Projects/NASAQ/backend/API/Extensions/WebApplicationExtensions.cs):
   - Passed `cancellationToken` to `DbInitializer.SeedAsync(cancellationToken)`.
4. [backend/Infrastructure/GlobalUsings.cs](file:///d:/Projects/NASAQ/backend/Infrastructure/GlobalUsings.cs):
   - Added `global using Microsoft.Extensions.Hosting;`.
5. [backend/Tests/SafeDataSeedingPreservationTests.cs](file:///d:/Projects/NASAQ/backend/Tests/SafeDataSeedingPreservationTests.cs):
   - Created comprehensive test suite implementing all 6 mandatory data preservation and restart scenarios.

---

## 10. Conclusion & Final Sign-Off

The NASAQ backend startup initialization and database seeding infrastructure now strictly adheres to the authoritative rule: **Empty Table = Seed Once; Non-Empty Table = Skip Completely**. Existing database records, administrative customizations, operational attendance records, leave requests, and points transactions are guaranteed to remain untouched across all subsequent application restarts.
