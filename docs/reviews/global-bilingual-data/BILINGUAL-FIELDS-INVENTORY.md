# NASAQ — Global Bilingual Business Fields Inventory
## Complete Multi-Module Data Localization & Architecture Catalog

**Target Directory:** `docs/reviews/global-bilingual-data/BILINGUAL-FIELDS-INVENTORY.md`  
**Date of Audit:** November 22, 2026  
**Status:** Baseline Inventory Established  

---

## 1. Executive Overview

This inventory documents all localizable business fields across all existing modules in NASAQ. It identifies existing database schema columns, API contracts, Create/Edit forms, table columns, Details views, selectors, and Data Seeders.

In accordance with:
- **RULE BIL-001 (Active Language Is Primary):** Forms display the current UI language by default.
- **RULE BIL-002 (Secondary Language Checkbox):** Secondary language is toggled via an optional checkbox (`إضافة البيانات باللغة الإنجليزية` / `Add Arabic Translation`).
- **RULE BIL-003 & BIL-004 (Input Preservation & Requiredness):** Existing fields and layout remain intact; required fields are mandatory only in the primary language.
- **RULE BIL-005 & BIL-006 (Locale-Aware Display with Silent Fallback):** Tables, dropdowns, and details show the active language with silent fallback (zero warning badges).
- **RULE BIL-007 (Preserve Existing Translations):** Unchecking the secondary language checkbox never deletes existing persisted translations.

---

## 2. Global Entity & Field Matrix

| Module | Entity | Field | Existing DB Column | Arabic Column | English Column | Create Form | Edit Form | Details Component | Table Component | Dropdowns & Selectors | API Contract / DTO | Seeder Support | Required Changes | Current Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **MOD-01** Identity & Access | `ApplicationRole` | Role Name | `AspNetRoles.Name` | N/A (i18n resource) | `Name` | N/A | N/A | `ProfileHeader.tsx` | N/A | `userRole` selector | `AuthUserResponse.roles` | Standard Roles | Use `formatUserRole(role, t)` for display | Compliant |
| **MOD-02** Employees | `Employee` | First Name | `Employees.FirstName` | `FirstNameAr` | `FirstName` / `FirstNameEn` | `EmployeeFormDialog.tsx` | `EmployeeFormDialog.tsx` | `EmployeeDetailsDialog.tsx` | `EmployeeTable.tsx` | Supervisor selector, Employee selector | `CreateEmployeeCommand`, `UpdateEmployeeCommand`, `EmployeeDto` | `DbInitializer.cs`, `DevDataSeeder.cs` | Add Checkbox UX to `EmployeeFormDialog`; update validation; wire `FirstNameAr` in DTO/frontend | In Progress |
| **MOD-02** Employees | `Employee` | Last Name | `Employees.LastName` | `LastNameAr` | `LastName` / `LastNameEn` | `EmployeeFormDialog.tsx` | `EmployeeFormDialog.tsx` | `EmployeeDetailsDialog.tsx` | `EmployeeTable.tsx` | Supervisor selector | `CreateEmployeeCommand`, `UpdateEmployeeCommand`, `EmployeeDto` | `DbInitializer.cs`, `DevDataSeeder.cs` | Add Checkbox UX to `EmployeeFormDialog`; update validation; wire `LastNameAr` in DTO/frontend | In Progress |
| **MOD-02** Employees | `Employee` | Full Name | Computed | `FullNameAr` | `FullName` / `FullNameEn` | N/A (Computed) | N/A (Computed) | `EmployeeDetailsDialog.tsx`, `ProfileHeader.tsx` | `EmployeeTable.tsx` | All employee dropdowns | `EmployeeDto.FullNameAr`, `FullNameEn` | Computed in entity/DTO | Locale-aware display resolver (`getLocalizedValue`) across all references | In Progress |
| **MOD-02** Employees | `Employee` | Department | `Employees.Department` | `DepartmentAr` | `Department` | `EmployeeFormDialog.tsx` | `EmployeeFormDialog.tsx` | `EmployeeDetailsDialog.tsx` | `EmployeeTable.tsx` | Department filter | `CreateEmployeeCommand`, `UpdateEmployeeCommand`, `EmployeeDto` | `DbInitializer.cs`, `DevDataSeeder.cs` | Add secondary input in `EmployeeFormDialog` under Checkbox | In Progress |
| **MOD-02** Employees | `Employee` | Job Title | `Employees.JobTitle` | `JobTitleAr` | `JobTitle` | `EmployeeFormDialog.tsx` | `EmployeeFormDialog.tsx` | `EmployeeDetailsDialog.tsx` | `EmployeeTable.tsx` | Profile header | `CreateEmployeeCommand`, `UpdateEmployeeCommand`, `EmployeeDto` | `DbInitializer.cs`, `DevDataSeeder.cs` | Add secondary input in `EmployeeFormDialog` under Checkbox | In Progress |
| **MOD-03** Locations | `WorkLocation` | Name | `WorkLocations.Name` | `NameAr` | `Name` / `NameEn` | `LocationFormDialog.tsx` | `LocationFormDialog.tsx` | `LocationDetailsDialog.tsx` | `LocationTable.tsx` | Work location selector | `CreateLocationCommand`, `UpdateLocationCommand`, `WorkLocationDto` | `DbInitializer.cs`, `DevDataSeeder.cs` | Add Checkbox UX to `LocationFormDialog`; wire `NameAr` in commands/DTO | In Progress |
| **MOD-03** Locations | `WorkLocation` | Address | `WorkLocations.Address` | `AddressAr` | `Address` | `LocationFormDialog.tsx` | `LocationFormDialog.tsx` | `LocationDetailsDialog.tsx` | `LocationTable.tsx` | N/A | `CreateLocationCommand`, `UpdateLocationCommand`, `WorkLocationDto` | `DbInitializer.cs`, `DevDataSeeder.cs` | Add secondary address under Checkbox | In Progress |
| **MOD-04** Schedules | `WorkSchedule` | Name | `WorkSchedules.Name` | `NameAr` | `Name` / `NameEn` | `ScheduleFormDialog.tsx` | `ScheduleFormDialog.tsx` | `ScheduleDetailsDialog.tsx` | `SchedulesView.tsx` | Schedule selector | `CreateScheduleCommand`, `UpdateScheduleCommand`, `WorkScheduleDto` | `DbInitializer.cs`, `DevDataSeeder.cs` | Add Checkbox UX to `ScheduleFormDialog`; wire `NameAr` | In Progress |
| **MOD-04** Schedules | `WorkSchedule` | Description | `WorkSchedules.Description` | `DescriptionAr` | `Description` | `ScheduleFormDialog.tsx` | `ScheduleFormDialog.tsx` | `ScheduleDetailsDialog.tsx` | `SchedulesView.tsx` | N/A | `CreateScheduleCommand`, `UpdateScheduleCommand`, `WorkScheduleDto` | `DbInitializer.cs`, `DevDataSeeder.cs` | Add secondary description under Checkbox | In Progress |
| **MOD-04** Shifts | `WorkShift` | Name | `WorkShifts.Name` | `NameAr` | `Name` / `NameEn` | `ShiftFormDialog.tsx` | `ShiftFormDialog.tsx` | N/A | `SchedulesView.tsx` (Shifts tab) | Shift selector in Schedule form | `CreateShiftCommand`, `UpdateShiftCommand`, `WorkShiftDto` | `DbInitializer.cs`, `DevDataSeeder.cs` | Add Checkbox UX to `ShiftFormDialog`; wire `NameAr` | In Progress |
| **MOD-05** Attendance | `AttendanceRecord` | Entity References | Relational | Relational | Relational | N/A (Operational Action) | Correct Incomplete Dialog | `AttendanceView.tsx` | `AttendanceHistoryTable.tsx`, `DailyAttendanceTable.tsx` | N/A | `AttendanceRecordDto` | `DevDataSeeder.cs` | Ensure employee, shift, and work location names resolve via locale resolver | In Progress |
| **MOD-06** Points | `PointRule` | Name | `PointRules.Name` | `NameAr` | `Name` / `NameEn` | `PointRuleFormDialog.tsx` | `PointRuleFormDialog.tsx` | N/A | `PointRulesTable.tsx`, `PointsLedgerTable.tsx` | Rule selector in adjustment dialog | `CreatePointRuleCommand`, `UpdatePointRuleCommand`, `PointRuleDto` | `DbInitializer.cs`, `DevDataSeeder.cs` | Add Checkbox UX to `PointRuleFormDialog`; wire `NameAr` | In Progress |
| **MOD-06** Points | `PointRule` | Description | `PointRules.Description` | `DescriptionAr` | `Description` | `PointRuleFormDialog.tsx` | `PointRuleFormDialog.tsx` | N/A | `PointRulesTable.tsx` | N/A | `CreatePointRuleCommand`, `UpdatePointRuleCommand`, `PointRuleDto` | `DbInitializer.cs`, `DevDataSeeder.cs` | Add secondary description under Checkbox | In Progress |
| **MOD-07** Leaves | `LeaveType` | Name | `LeaveTypes.Name` | `LeaveTypes.NameAr` | `Name` / `NameEn` | `LeaveTypeFormDialog.tsx` | `LeaveTypeFormDialog.tsx` | N/A | `LeavesView.tsx` | Leave type selector in `LeaveRequestFormDialog.tsx` | `CreateLeaveTypeCommand`, `UpdateLeaveTypeCommand`, `LeaveTypeDto` | `DbInitializer.cs`, `DevDataSeeder.cs` | Standardize `LeaveTypeFormDialog` with Checkbox UX; ensure dropdown resolver | In Progress |
| **MOD-07** Leaves | `LeaveType` | Description | `LeaveTypes.Description` | `LeaveTypes.DescriptionAr` | `Description` | `LeaveTypeFormDialog.tsx` | `LeaveTypeFormDialog.tsx` | N/A | `LeavesView.tsx` | N/A | `CreateLeaveTypeCommand`, `UpdateLeaveTypeCommand`, `LeaveTypeDto` | `DbInitializer.cs`, `DevDataSeeder.cs` | Add secondary description under Checkbox | In Progress |
| **MOD-08** Cash Rewards | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | Module not implemented in current codebase | N/A |
| **MOD-09** Admin Operations | Multi-Entity | References | Relational | Relational | Relational | N/A | Direct correction dialogs | Admin Operations View | Tables & queues | Employee & location selectors | Admin Operations APIs | N/A | Ensure all queue tables display localized employee, location, and reason names | In Progress |
| **MOD-10** Notifications | `AppNotification` | Notification Content | Relational / Json | Template | Template | N/A | N/A | Notification Details Dialog | `NotificationList.tsx` | N/A | `AppNotificationDto` | N/A | Resolve dynamic entity names inside notification bodies | In Progress |
| **MOD-11** Reports | Multi-Entity | Dynamic Report Data | Relational | Relational | Relational | N/A | N/A | Report View | `ReportDataTable.tsx` | Filter dropdowns | Report export endpoints | N/A | Ensure export projections and filter dropdowns resolve active locale | In Progress |
| **MOD-12** Audit Trail | `IAuditableEntity` | Audit Metadata | Columns | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | Standard audit trail (no dedicated UI module) | N/A |
| **Dashboard** | Multi-Entity | Summary & Cards | Relational | Relational | Relational | N/A | N/A | Dashboard Overview | N/A | Quick action links | Dashboard aggregations | N/A | Ensure all summary rows display localized names | In Progress |

---

## 3. Architecture Blueprint for Checkbox-Based UX

### 3.1 Checkbox Placement & Labels
- **In Arabic Mode (`isRtl === true`):**
  - Checkbox Label: **`إضافة البيانات باللغة الإنجليزية`**
  - Primary Fields: Arabic inputs displayed by default.
  - Secondary Fields: English inputs toggled by the Checkbox.
- **In English Mode (`isRtl === false`):**
  - Checkbox Label: **`Add Arabic Translation`**
  - Primary Fields: English inputs displayed by default.
  - Secondary Fields: Arabic inputs toggled by the Checkbox.

### 3.2 Requiredness Contract
- Mandatory fields under existing business rules (e.g. Employee First/Last Name, Location Name, Shift Name, Schedule Name, Leave Type Name, Point Rule Name):
  - **Primary language input:** Mandatory (`*`).
  - **Secondary language input:** Optional.
- Optional fields under existing business rules (e.g. Description, Notes, Department, Job Title):
  - Both primary and secondary inputs remain optional.

### 3.3 Data Retention on Toggle
- If the user unchecks the Checkbox:
  - Secondary fields are hidden from the layout.
  - Form state values are **NOT deleted or cleared**.
  - Persisted translations remain intact when saving.

---

## 4. Centralized Localized Value Resolver (`getLocalizedValue`)

A shared utility in `frontend/src/shared/utils/localization.ts`:
```typescript
export function getLocalizedValue(
  arValue: string | null | undefined,
  enValue: string | null | undefined,
  isRtl: boolean
): string {
  const primary = isRtl ? arValue : enValue;
  const fallback = isRtl ? enValue : arValue;
  return primary?.trim() || fallback?.trim() || "";
}
```
Rules:
- Silent fallback with **zero warning badges, zero icons, and zero missing indicators**.
- If both exist, display the requested locale.
- If only one exists, display it in both locales.
- If neither exists, display fallback empty placeholder (`—`).

---

## 5. Implementation Roadmap
1. **Shared Frontend Component:** `OptionalTranslationSection.tsx` and `getLocalizedValue.ts`.
2. **Backend CQRS & Validators:** Ensure all Commands accept `NameAr`/`NameEn`, `DescriptionAr`/`DescriptionEn` and validators enforce primary locale dynamically.
3. **Frontend Forms:** Update `EmployeeFormDialog`, `LocationFormDialog`, `ScheduleFormDialog`, `ShiftFormDialog`, `PointRuleFormDialog`, and `LeaveTypeFormDialog`.
4. **Frontend Tables & Details:** Update all table cells, expanded rows, and details dialogs to use `getLocalizedValue`.
5. **Data Seeder Completion:** Safe, idempotent utility to verify and populate missing seed translations without touching user data or running loops on startup.
6. **Tests & Acceptance Verification.**
