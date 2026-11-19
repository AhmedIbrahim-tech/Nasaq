---
trigger: always_on
---

# AI Engineering Safety & Decision Rules

This rule outlines the 12 Golden Rules governing all AI agent operations, file edits, and architectural decisions within **CoreStarter** and any project derived from it.

---

## The 12 Golden Safety Rules

### 1. Analyze First, Act Second
Inspect and read existing files, contracts, and implementations before proposing or writing changes. Never make assumptions about how a feature is implemented.

### 2. Verify Dependencies Before Deleting or Renaming
Never delete or rename a file, type, or function without conducting a global search across both backend and frontend to confirm that zero incoming references or dynamic imports exist.

### 3. Strict Architectural Fidelity
Follow the established Clean Architecture and Next.js Modular patterns. Never bypass layers (e.g., querying database contexts directly from controllers or shared frontend components).

### 4. Zero Unnecessary Refactoring
Touch only the files and code regions strictly required to fulfill the user's explicit request. Do not format, reorder, or refactor unrelated working code.

### 5. No Unauthorized Packages
Never run `npm install <package>`, `dotnet add package <Package>`, or modify dependency versions in `package.json` or `.csproj` files without explicit prior user approval.

### 6. Protect Database Schema & Migrations
Never delete existing migration files, edit `ModelSnapshot.cs` manually, drop tables, or execute destructive schema modifications without explicit user authorization.

### 7. Preserve Working Implementations
Never replace existing working code with placeholders, partial stubs (`// TODO`), or untested alternative libraries without understanding the exact purpose of the original code.

### 8. Respect Existing Conventions
Always follow existing project conventions:
- Use `Router` constants for API paths (`backend/API/Routing/Router.cs` and `frontend/src/lib/api/router.ts`).
- Wrap all responses in `GenericBaseResponse<T>`.
- Use `useAppSelector` and `useAppDispatch` for Redux.
- Use MUI theme semantic palette tokens rather than arbitrary CSS hex codes.

### 9. Transparent Architectural Decisions
Explain the technical rationale behind any significant structural change or design decision. Provide clear context and tradeoffs before proceeding.

### 10. Honest & Truthful Reporting
Always report build results, compiler warnings, and test runs accurately. If a build fails or errors occur, state the exact failure details immediately and propose a targeted resolution.

### 11. Explicit Approval for High-Impact Changes
When an operation is destructive, modifies global security settings, or introduces breaking changes to public API contracts, pause and ask the user for confirmation.

### 12. Template Purity
Keep CoreStarter generic and modular. Never inject project-specific business domain entities (such as e-commerce, ERP, or client-specific models) directly into the core starter template. Business logic belongs exclusively in derived projects.
