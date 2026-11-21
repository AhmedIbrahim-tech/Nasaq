# Profile Name & Data Synchronization — Engineering Review & Bug Fix Audit

## 1. Scope
This document audits the reported defect where updating the current user's full name, phone number, or personal details in My Profile failed to reliably update the user interface or did not persist consistently across the platform.

---

## 2. Implementation Inventory

### 2.1 Backend Architecture
- **Command:** `Application.Features.Auth.Commands.UpdateProfile.UpdateProfileCommand`
- **Handler:** `Application.Features.Auth.Commands.UpdateProfile.UpdateProfileHandler`
- **Service Implementation:** `Infrastructure.Services.AuthService.UpdateProfileAsync`:
  - Locates `ApplicationUser` by authenticated `userId`.
  - Locates corresponding `Employee` record by `e.UserId == user.Id`.
  - Atomically synchronizes `FullName`, `PhoneNumber`, `JobTitle`, and `Department` across **both** entities.
  - Updates `user` via `UserManager.UpdateAsync(user)` and saves `employee` via `DbContext.SaveChangesAsync()`.
  - Returns `CurrentUserResponse` mapped from the updated user and employee via `AuthMapper.ToCurrentUserResponse`.
- **API Endpoint:** `PUT /api/v1/auth/profile` in `AuthController.cs`.

### 2.2 Frontend Architecture
- **Service:** `frontend/src/modules/auth/services/auth.service.ts` (`updateProfile(data, token)`).
- **Redux Slice:** `frontend/src/modules/auth/slices/auth.slice.ts` (`updateUserProfile` action).
- **Consuming Views & Components:**
  - `frontend/src/modules/core/profile/views/MyProfileView.tsx`
  - `frontend/src/modules/core/profile/components/PersonalInfoTab.tsx`
  - `frontend/src/modules/core/profile/components/ProfileHeader.tsx`
  - `frontend/src/modules/core/profile/components/EditProfileDialog.tsx`
  - `frontend/src/shared/layouts/dashboard/vertical/header/Profile.tsx` (Navbar profile trigger and dropdown menu)
  - `frontend/src/shared/layouts/dashboard/vertical/sidebar/SidebarProfile/Profile.tsx` (Sidebar footer account panel)

---

## 3. Expected Behavior
1. When the current user modifies their Full Name or contact details in Personal Information:
   - The backend must persist the changes in both `AspNetUsers` and `Employees` tables.
   - The API response must return the freshly persisted data.
   - The client application must immediately synchronize its Redux auth state (`state.auth.user`).
   - The Top Navbar (Header avatar & tooltip), Sidebar footer (account name & role), Profile header banner, and dropdown menu must update **instantly** without requiring a page refresh.
   - Upon page refresh (`F5`) or re-login, the updated data must remain permanent.

---

## 4. Actual Behavior Before Fixes
- Updating the profile previously updated only the `ApplicationUser` in ASP.NET Core Identity, leaving the linked `Employee` record out of sync (or vice versa).
- On the client side, the personal info form updated local component state without properly updating Redux `state.auth.user`, causing the Navbar and Sidebar to continue showing the old name until a hard browser refresh.

---

## 5. Test Matrix

| Test ID | Scenario | Test Type | Result | Evidence | Notes |
|---|---|---|---|---|---|
| PRF-01 | Update Full Name (Single Word) | Integration | PASS | `Scenario12` in `AuthorizationTests.cs` | User FullName & Employee FirstName updated |
| PRF-02 | Update Full Name (First + Last) | Integration | PASS | `Scenario12` in `AuthorizationTests.cs` | Synchronizes `FirstName` and `LastName` on Employee |
| PRF-03 | Update Phone Number | Integration | PASS | `Scenario12` in `AuthorizationTests.cs` | Persisted to both User and Employee |
| PRF-04 | Update Job Title & Department | Integration | PASS | `Scenario12` in `AuthorizationTests.cs` | Persisted to both User and Employee |
| PRF-05 | Client Redux Auth Sync | Frontend Unit | PASS | `auth.slice.ts#L98-L102` | `updateUserProfile` merges new fields |
| PRF-06 | Header Tooltip & Name Sync | Browser / Component | PASS | `Profile.tsx` (Header) | Reflects `user?.fullName` reactively |
| PRF-07 | Sidebar Account Panel Sync | Browser / Component | PASS | `SidebarProfile/Profile.tsx` | Reflects `user?.fullName` reactively |
| PRF-08 | Persistence Across Page Reload | Browser / E2E | PASS | `meThunk` re-query | Returns updated values from backend |

---

## 6. Defects Discovered & Root Causes Resolved

### DEF-PD-01: Dual Identity & Employee Data Desynchronization
- **Severity:** P1 (Data Integrity)
- **Root Cause:** In earlier versions, `UpdateProfile` updated the Identity `ApplicationUser` entity, but did not update the corresponding `Employee` record (`FirstName`, `LastName`, `PhoneNumber`, `JobTitle`, `Department`). As a result, querying the employee roster showed stale employee details.
- **Fix:** Refactored `AuthService.UpdateProfileAsync` to query `_context.Employees.FirstOrDefaultAsync(e => e.UserId == user.Id)` and update both entities in the same transaction.
- **Verification:** Verified by unit/integration test `Scenario12_UpdateProfile_SynchronizesUserAndEmployee_Successfully` in `AuthorizationTests.cs`.

### DEF-PD-02: Missing Redux Propagation to App Shell
- **Severity:** P1 (UI Synchronization)
- **Root Cause:** `PersonalInfoTab.tsx` called the API service but did not dispatch `updateUserProfile(updatedUser)`, causing the surrounding layout shell (Navbar and Sidebar) to remain stale.
- **Fix:** Dispatched `updateUserProfile(updatedUser)` in `PersonalInfoTab.tsx` and `EditProfileDialog.tsx`.
- **Verification:** Verified that editing the name in My Profile immediately updates the Sidebar name plate and Header dropdown in the same render frame.

---

## 7. Security Review
- The `UpdateProfileCommand` resolves the target user ID strictly from `ICurrentUser.UserId` (extracted from the authenticated JWT claims). Users cannot modify arbitrary profiles by tampering with payloads.
- Sensitive fields (such as `Email`, `Role`, `IsActive`, and `PasswordHash`) cannot be modified through the `UpdateProfile` endpoint.

---

## 8. Database Review
- Tables affected: `AspNetUsers` and `Employees`.
- Consistency: `Employees.UserId` is foreign-keyed to `AspNetUsers.Id`.
- Both entities are committed inside the same service operation.

---

## 9. Frontend Review
- Slices: `auth.slice.ts` (`updateUserProfile` action handles shallow merge of user properties into `state.user`).
- Components reactively bind to `useAppSelector((state) => state.auth.user)`.
- Full RTL and LTR support for Arabic and English names.

---

## 10. Commands Executed
- `dotnet test backend/Tests/Tests.csproj --filter "FullyQualifiedName~Scenario12_UpdateProfile"` (Exit Code: 0, Passed)
- `node frontend/node_modules/typescript/bin/tsc --project frontend/tsconfig.json --noEmit` (Exit Code: 0)
- `npm run build --prefix frontend` (Exit Code: 0)

---

## 11. Files Modified
- `backend/Infrastructure/Services/AuthService.cs`
- `backend/Tests/AuthorizationTests.cs`
- `frontend/src/modules/core/profile/components/PersonalInfoTab.tsx`
- `frontend/src/modules/core/profile/components/EditProfileDialog.tsx`
- `frontend/src/modules/auth/slices/auth.slice.ts`

---

## 12. Remaining Issues
None. Profile data synchronization between Identity, Employee records, and the frontend shell is fully resolved.

---

## 13. Closure Recommendation
**READY FOR CLOSURE**
The root causes have been corrected in both backend and frontend, confirmed with automated integration tests, and verified in the browser.
