---
trigger: model_decision
description: "Standards for code quality, compilation verification, TypeScript type-checking, translation key validation, import integrity, and testing."
---

# Testing & Code Quality Standards

This rule defines the verification requirements, build standards, and quality gates for **NASAQ**.

---

## 1. Truthful Verification Requirement (CRITICAL)

### 1.1 Execution Mandate
- **Execution Mandate:** An AI Agent must **NEVER claim or state that a build, test, compilation, or verification passed without actually running the command** via tools and inspecting the real output.
- **Reporting:** Always report the exact exit code, error messages, and output summary. If an error occurs, report it immediately and transparently.

### 1.2 Development Testing Freezes vs Permanent Quality Gates
- **Temporary Operational Directives:** During active development phases, the project owner may declare a **Testing Freeze**. When a testing freeze is in effect:
  1. Do NOT execute `dotnet test`, `dotnet build`, or any compilation verification commands.
  2. Do NOT run frontend build or test suites (`npm run build`, `npm test`, `npm run lint`).
  3. Do NOT create, modify, or delete test files or test fixtures.
  4. Do NOT claim or simulate that testing or builds were performed.
- **Permanent Standards:** The quality gates documented below represent the permanent standards of NASAQ and will be strictly executed once the project owner formally lifts the testing freeze.
- **Post-Freeze Verification Queue:** The following items from recent refactoring must be prioritized for verification immediately when the freeze is lifted:
  1. *Multipart direct model binding:* Verify that `UploadFilesCommand` correctly binds `IReadOnlyList<IFormFile>? Files` from `multipart/form-data` in `FilesController.Upload`.
  2. *Optional request body deserialization:* Verify that `ToggleEmployeeStatusCommand` deserializes cleanly with both `{ "isActive": false }` and empty `{}` bodies in `EmployeesController.ToggleStatus`.
  3. *Clean solution build:* Confirm zero warnings and zero errors across all projects.

---

## 2. Backend Compilation & Quality Verification

### 2.1 Build Standards
- **Zero-Warning Policy:** The backend solution must compile cleanly with zero warnings and zero errors:
  ```bash
  dotnet build backend/Nasaq.sln /m:1 /nr:false
  ```
- Any compiler warning (e.g., CS8618, CS8604, CS8602, CS1998) must be fixed at the source, not suppressed with `#pragma warning disable` unless strictly documented and justified.

### 2.2 Quality Guidelines
- **Null Safety:** Ensure proper nullable annotations on all properties, parameters, and return types.
- **Unused Code:** Remove unused `using` directives, unused variables, and orphaned private methods.
- **Resource Cleanup:** Dispose of resources properly via `using var` or `await using var` for all classes implementing `IDisposable` or `IAsyncDisposable`.

---

## 3. Frontend Build & Asset Verification

### 3.1 Production Build
- Run the Next.js production build to ensure static pre-rendering, webpack bundle compilation, and TypeScript typing are completely sound:
  ```bash
  cd frontend
  npm run build
  ```
- Build must complete with exit code 0.

### 3.2 Import Integrity
- Run the import verification script to ensure no broken relative paths, missing exports, or circular module references exist:
  ```bash
  node scripts/verify-imports.cjs
  ```
- Target: 0 broken imports across all files.

### 3.3 Internationalization Parity
- Run the dictionary integrity validation script:
  ```bash
  npm run validate:i18n
  ```
- Target: 100% key match between `src/i18n/messages/ar.json` and `src/i18n/messages/en.json`.

---

## 4. Regression Prevention Checklist

When testing is active and before marking any task as complete, verify:

1. [ ] **Backend Build:** `dotnet build backend/Nasaq.sln` succeeded (0 warnings, 0 errors).
2. [ ] **Frontend Build:** `npm run build` succeeded (exit code 0).
3. [ ] **Imports Verified:** `node scripts/verify-imports.cjs` reported 0 broken paths.
4. [ ] **Translations Checked:** `npm run validate:i18n` verified parity.
5. [ ] **Direct CQRS Binding:** Confirmed model binding behavior for direct Commands/Queries.
6. [ ] **No Legacy References:** No unintended legacy names, obsolete request DTOs, or dead code left in modified files.
7. [ ] **API Contract Integrity:** All endpoints return `GenericBaseResponse<T>` and match route constants.
