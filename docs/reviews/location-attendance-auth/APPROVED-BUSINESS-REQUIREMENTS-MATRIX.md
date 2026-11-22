# NASAQ — Approved Business Requirements Matrix
## Employee Location, Attendance Verification & Password Lifecycle
**Document Version:** 1.0.0  
**Status:** Baseline Established (Pre-Implementation Checklist)  
**Governing Authority:** Project Owner Approved Contract (P0)

---

### Executive Overview & Purpose

This matrix establishes the authoritative, line-by-line contract for all requirements across:
- **MOD-01:** Identity & Access Management (Password Lifecycle & Recovery)
- **MOD-02:** Employee Management (Employee Approved Personal Location)
- **MOD-03:** Work Locations & Geofencing (Company Coordinate Registration & Global Radius)
- **MOD-05:** Attendance Verification & GPS Lifecycle (Dual-Location Verification Matrix & No Auto-GPS)
- **MOD-09:** Admin Operations & Location Approvals

Each item includes its strict Business Rule, Existing Implementation Status, Target Backend/Frontend Components, Database Impact, Required Verification Test, and Acceptance Status.

---

### Section 1: Officially Approved Location Model & Geofencing

| Req ID | Business Rule | Existing Status | Backend Component | Frontend Component | Database Impact | Required Test | Acceptance Status |
|---|---|---|---|---|---|---|---|
| **LOC-01** | **Administrative Work Location:** Organizational company site with GPS latitude/longitude and active status. Attendance accepts ANY active company location with valid GPS coordinates, not only assigned branch. Does NOT change employee's assigned branch. | Partial (only assigned branch checked in Attendance) | `CheckInHandler`, `CheckOutHandler`, `GeofenceService`, `WorkLocationsController` | `LocationFormDialog`, `LocationTable`, `AttendanceStatusCard` | None (`WorkLocations` already exists) | Scenario D (Test 23, 24, 25) | Pending Implementation |
| **LOC-02** | **Employee Registered GPS Location:** Exactly one currently approved personal GPS location per employee, independent of administrative branch. Captured via explicit browser geolocation (never typed). Persists in DB. Retains historical records on replacement/reset. | Missing | `EmployeePersonalLocation` entity, `RegisterEmployeeLocationCommand`, `GetMyPersonalLocationQuery` | `ProfilePersonalLocationTab`, `LocationRegistrationDialog` | New entity `EmployeePersonalLocations` | Scenario A (Test 1, 4, 6) | Pending Implementation |
| **LOC-03** | **Global Geofence Radius:** Single system-wide configurable radius defaulting to **50 meters** (never 150m or per-employee radius). Admin/SuperAdmin configurable. Changes apply to future attendance only. Accuracy and radius are separate concepts. | Missing (Old hardcoded 150m per-location) | `SystemSetting` entity, `UpdateGlobalGeofenceRadiusCommand`, `GetGlobalGeofenceRadiusQuery`, `GeofenceService` | `AdminSettingsView` / `LocationsToolbar` | New entity `SystemSettings` | Scenario E (Test 27, 28, 29, 37) | Pending Implementation |
| **LOC-04** | **Company GPS Registration (Method A - Capture):** Admin/SuperAdmin captures coordinates by physically visiting and clicking "تحديد موقعي الحالي" ("Use Current Location"). Explicit click only. | Missing | `UpdateCompanyLocationCoordinatesCommand` | `LocationFormDialog` (Capture button + accuracy indicator) | Audit log of coordinates update | Scenario D (Test 21) | Pending Implementation |
| **LOC-05** | **Company GPS Registration (Method B - Choose on Map):** Admin/SuperAdmin can open map, place/move marker, preview coordinates, confirm and save without physical presence. | Missing | `UpdateCompanyLocationCoordinatesCommand` | `LocationFormDialog` (Leaflet / Map coordinate picker) | Audit log of coordinates update | Scenario D (Test 22) | Pending Implementation |
| **LOC-06** | **Company Location Audit:** Modifying company coordinates records LocationId, previous coordinates, new coordinates, ActorId, timestamp, and operation type. Coordinates without GPS cannot auto-verify. | Missing | `UpdateCompanyLocationCoordinatesCommand`, `AuditLog` / Audit trail | `LocationDetailsDialog` | Audit log entry | Scenario D (Test 24, 26) | Pending Implementation |

---

### Section 2: Employee Location Registration & Approval Workflow

| Req ID | Business Rule | Existing Status | Backend Component | Frontend Component | Database Impact | Required Test | Acceptance Status |
|---|---|---|---|---|---|---|---|
| **REG-01** | **Employee First Location Onboarding:** New employees start with no personal GPS location. On login, if no personal location approved and no request pending, show dedicated dialog offering "Register My Location" or "Later". Zero GPS on dialog open. | Missing | `GetCurrentUserQuery` / `GetMyPersonalLocationQuery` | `EmployeeLocationOnboardingDialog` | None | Scenario A (Test 1, 4), Scenario H (Test 50, 51) | Pending Implementation |
| **REG-02** | **Initial Registration Auto-Approval on Company Site Match:** If proposed GPS point falls within 50m of an active company location, auto-approve as `System / Company Location Match`. | Missing | `RegisterEmployeeLocationCommandHandler` | `EmployeeLocationOnboardingDialog` | Approved record created in `EmployeePersonalLocations` | Scenario A (Test 3) | Pending Implementation |
| **REG-03** | **Initial Registration Outside Company Sites:** If outside active company sites, create `Pending Approval` request. Admin/SuperAdmin review required before location qualifies for attendance. | Missing | `RegisterEmployeeLocationCommandHandler` | `EmployeeLocationOnboardingDialog`, `AdminOperationsView` | Request created in `EmployeeLocationRequests` | Scenario A (Test 2, 6) | Pending Implementation |
| **REG-04** | **One Pending Request Rule:** Exactly ONE pending personal location request allowed per employee. Attempting a second while one is pending is rejected. Employee may cancel pending request. | Missing | `RegisterEmployeeLocationCommandValidator`, `CancelLocationRequestCommand` | `ProfilePersonalLocationTab` | Unique constraint / check on pending requests | Scenario A (Test 5), Scenario B (Test 11, 12) | Pending Implementation |
| **REG-05** | **Employee Location Change:** Employee can request location change. Existing approved location remains ACTIVE while request is pending. Never auto-approve change even if it matches company site. | Missing | `RequestEmployeeLocationChangeCommand` | `ProfilePersonalLocationTab` (Request Change action) | Request in `EmployeeLocationRequests` | Scenario B (Test 8, 12) | Pending Implementation |
| **REG-06** | **Location Request Approval:** On admin approval, new location becomes active, previous becomes historical/inactive. Employee notified. Subsequent attendance can use new location. | Missing | `ApproveEmployeeLocationCommand` | `AdminLocationReviewDialog` / `AdminOperationsView` | Update `EmployeeLocationRequests` and `EmployeePersonalLocations` | Scenario B (Test 9, 13) | Pending Implementation |
| **REG-07** | **Location Request Rejection:** Rejection reason is MANDATORY (enforced via backend FluentValidation). Request preserved with reason, old location remains active, employee notified and permitted to resubmit. | Missing | `RejectEmployeeLocationCommand`, `RejectEmployeeLocationValidator` | `RejectLocationRequestDialog` | Update status + `RejectionReason` in `EmployeeLocationRequests` | Scenario A (Test 7), Scenario B (Test 10) | Pending Implementation |

---

### Section 3: Administrative Location Management

| Req ID | Business Rule | Existing Status | Backend Component | Frontend Component | Database Impact | Required Test | Acceptance Status |
|---|---|---|---|---|---|---|---|
| **ADM-01** | **Direct Admin Location Change:** Admin/SuperAdmin directly captures or chooses new location for employee. Activates immediately, supersedes/cancels any pending request, notifies employee, creates audit evidence. | Missing | `AdminChangeEmployeeLocationCommand` | `AdminChangeLocationDialog` in `EmployeesView` or `AdminOperationsView` | Update `EmployeePersonalLocations`, supersede pending requests | Scenario C (Test 14, 15, 18, 19, 20) | Pending Implementation |
| **ADM-02** | **Admin Location Reset:** Revokes approved personal location immediately. Supersedes pending requests. Employee has no approved personal location until new one approved. Historical attendance preserved. | Missing | `ResetEmployeeLocationCommand` | `ResetLocationConfirmDialog` in `EmployeesView` or `AdminOperationsView` | Set `IsActive = false` on current location, cancel pending | Scenario C (Test 16, 17, 18) | Pending Implementation |
| **ADM-03** | **Atomic Conflict Resolution:** Direct admin change or reset atomically supersedes pending employee requests within a single UnitOfWork transaction, preventing later stale approval. | Missing | `AdminChangeEmployeeLocationCommandHandler`, `ResetEmployeeLocationCommandHandler` | N/A (Backend transaction safety) | Transactional update across requests and locations | Scenario C (Test 15, 17) | Pending Implementation |

---

### Section 4: Attendance Verification & GPS Lifecycle

| Req ID | Business Rule | Existing Status | Backend Component | Frontend Component | Database Impact | Required Test | Acceptance Status |
|---|---|---|---|---|---|---|---|
| **ATT-01** | **Dual-Location Verification Matrix:** Attendance evaluated against (1) Employee's approved personal GPS location OR (2) ANY active company Work Location with valid GPS, using 50m radius. Inside either $\rightarrow$ `Verified` (no manual GPS review). | Partial (old logic only checked employee's assigned branch with 150m) | `CheckInHandler`, `CheckOutHandler`, `GeofenceService` | `AttendanceStatusCard`, `CheckInCard` | `AttendanceRecords.CheckInStatus` / `CheckOutStatus` | Scenario E (Test 30, 31, 36) | Pending Implementation |
| **ATT-02** | **Outside All Locations / GPS Unavailable:** If outside all approved locations, or GPS permission denied/timeout, or accuracy insufficient $\rightarrow$ `PendingReview`. Record persisted non-blocking with server timestamp. | Partial (accuracy threshold checked, but dual-location not evaluated) | `CheckInHandler`, `CheckOutHandler` | `AttendanceStatusCard` (informative review messaging) | Persisted with `VerificationStatus.PendingReview` | Scenario E (Test 32, 33, 34) | Pending Implementation |
| **ATT-03** | **Decoupled Session & Verification State:** Employee may be Checked In while GPS verification is Pending Review. Does not mark absent. Does not block Check Out. Check In and Check Out each capture fresh GPS. | Functional (already decoupled) | `CheckInHandler`, `CheckOutHandler` | `AttendanceStatusCard`, `CheckInCard` | Preserved in `AttendanceRecords` | Scenario F (Test 41) | Pending Implementation |
| **ATT-04** | **Zero Automatic or Continuous GPS:** Geolocation is NEVER triggered on page load, mount, refresh, tab switch, theme switch, or language switch. Single-shot acquisition only on explicit user click ("Check In", "Check Out", "Register Location"). | Partial (recently fixed, must be strictly preserved) | N/A | `AttendanceView`, `CheckInCard`, `useGeolocation` hook | None | Scenario F (Test 38, 39, 40) | Pending Implementation |

---

### Section 5: Password Lifecycle & Onboarding

| Req ID | Business Rule | Existing Status | Backend Component | Frontend Component | Database Impact | Required Test | Acceptance Status |
|---|---|---|---|---|---|---|---|
| **PWD-01** | **Separate First-Login Popups:** Two distinct, sequential popups: (1) Temporary Password Reminder, (2) Personal Location Registration. Never combined. Dismissible via "Later". Temporary reminder repeats on each login until permanent password set. | Missing (previously combined or missing) | `GetCurrentUserQuery` returning `MustChangePasswordOnNextLogin` and `HasApprovedPersonalLocation` | `TemporaryPasswordReminderDialog`, `EmployeeLocationOnboardingDialog` in `AuthSessionInitializer` | Session flag in browser storage | Scenario H (Test 49, 50, 51) | Pending Implementation |
| **PWD-02** | **Employee Self-Service Password Change:** Requires Current Password, New Password, Confirm New Password. Validates policy and prevents reuse of current password. Sets `MustChangePasswordOnNextLogin = false`. | Partial (`ChangePasswordCommand` exists, needs validation & flag clearing) | `ChangePasswordCommand`, `ChangePasswordValidator`, `ChangePasswordHandler` | `ChangePasswordDialog` | `AspNetUsers.MustChangePasswordOnNextLogin = false` | Scenario G (Test 42, 43) | Pending Implementation |
| **PWD-03** | **Forgot Password Administrative Request:** Employee clicks "نسيت كلمة المرور" on login. Creates password recovery request. Admin reviews and approves/rejects. On approval, generates temporary password, sets `MustChangePasswordOnNextLogin = true`, emails to user. | Missing | `SubmitForgotPasswordRequestCommand`, `ApproveForgotPasswordRequestCommand`, `RejectForgotPasswordRequestCommand` | `ForgotPasswordDialog` on login, `AdminOperationsView` (Recovery Requests tab) | New entity `ForgotPasswordRequests` | Scenario G (Test 44, 45, 48) | Pending Implementation |
| **PWD-04** | **Admin Reset Password:** Generates strong random temporary password, sets `MustChangePasswordOnNextLogin = true`, sends via email, shows reminder on next login. | Missing | `AdminResetPasswordCommand`, `TemporaryPasswordService` | `AdminResetPasswordDialog` in `EmployeesView` | `AspNetUsers.MustChangePasswordOnNextLogin = true` | Scenario G (Test 46, 48) | Pending Implementation |
| **PWD-05** | **Admin Direct Password Change:** Admin inputs chosen password. Sets `MustChangePasswordOnNextLogin = false`, sends via email, no reminder on next login. | Missing | `AdminDirectChangePasswordCommand` | `AdminDirectChangePasswordDialog` in `EmployeesView` | `AspNetUsers.MustChangePasswordOnNextLogin = false` | Scenario G (Test 47) | Pending Implementation |
| **PWD-06** | **Credential Email Security & Safety:** Plaintext passwords never logged, never stored in DB, never exposed in API responses or telemetry. Handles missing SMTP gracefully (safe logging in dev). | Exists (`SmtpEmailService` logs when disabled) | `SmtpEmailService`, `IdentityEmailSender` | N/A | Zero plaintext secrets in DB | Scenario G (Test 48) | Pending Implementation |

---

### Section 6: Data Integrity, Migrations & Seeders

| Req ID | Business Rule | Existing Status | Backend Component | Frontend Component | Database Impact | Required Test | Acceptance Status |
|---|---|---|---|---|---|---|---|
| **DAT-01** | **Additive Schema Evolution:** New entities and properties added via safe additive EF Core migration (`AddEmployeeLocationAndSecurityLifecycle`). No drops, no column removals, no destructive changes. | Ready to create | EF Core Migrations | N/A | Additive tables: `EmployeePersonalLocations`, `EmployeeLocationRequests`, `ForgotPasswordRequests`, `SystemSettings` | Scenario I (Test 52) | Pending Implementation |
| **DAT-02** | **Startup Seeder Non-Overwrite:** Seeders skip non-empty tables completely. Zero overwrites of approved locations, passwords, or system settings on backend restart. | Verified Closed in previous task | `DbInitializer`, `DevDataSeeder` | N/A | None | Safe Seeder Preservation Tests | Verified Complete |
| **DAT-03** | **Historical Attendance Immobility:** Changing company coordinates or global geofence radius applies ONLY to future attendance events. Zero retroactive recalculation of historical records. | Verified Invariant | `CheckInHandler`, `CheckOutHandler` | N/A | None | Scenario D (Test 26), Scenario E (Test 37) | Pending Implementation |

---

### Section 7: Acceptance Test Mapping (Scenarios A through I)

- **Scenario A (Personal Location Registration):** Tests 1, 2, 3, 4, 5, 6, 7
- **Scenario B (Personal Location Change):** Tests 8, 9, 10, 11, 12, 13
- **Scenario C (Admin Location Operations):** Tests 14, 15, 16, 17, 18, 19, 20
- **Scenario D (Company Locations):** Tests 21, 22, 23, 24, 25, 26
- **Scenario E (Geofencing):** Tests 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37
- **Scenario F (GPS Lifecycle):** Tests 38, 39, 40, 41
- **Scenario G (Password Lifecycle):** Tests 42, 43, 44, 45, 46, 47, 48
- **Scenario H (Onboarding):** Tests 49, 50, 51
- **Scenario I (Regression & Data Integrity):** Test 52

---
*End of Approved Business Requirements Matrix v1.0.0*
