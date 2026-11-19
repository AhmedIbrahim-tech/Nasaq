---
name: new-project-from-corestarter
description: >-
  Guides the AI agent step-by-step through initializing a new enterprise project from
  CoreStarter: creating an isolated workspace, renaming identifiers, configuring databases,
  preserving authentication infrastructure, and establishing initial domain entities.
---

# Initializing a New Project from CoreStarter

This skill guides an AI Agent through the complete procedure of establishing a new software project using **CoreStarter** as a foundation.

> [!CAUTION]
> **CRITICAL RULE:** NEVER modify the original CoreStarter template repository when initializing a new project. Always clone, copy, or create a new dedicated workspace for the target project.

---

## Step 1: Establish Workspace & Working Copy

1. **Verify Source Integrity:** Ensure CoreStarter builds cleanly before copying:
   - Backend: `dotnet build backend/CoreStarter.sln`
   - Frontend: `npm run build` (inside `frontend/`)
2. **Create New Project Directory:** Copy the template files into the target project folder:
   - Exclude ephemeral directories: `bin/`, `obj/`, `node_modules/`, `.next/`, `.vs/`.
3. **Open the New Workspace:** All subsequent steps must be executed strictly within the new project workspace.

---

## Step 2: Gather Project Requirements & Business Scope

Before writing code or renaming solutions, clarify the project parameters:
- **Project Name:** (e.g., `AcmeCorp.Portal`, `NASAQ`, `HealthFlow`)
- **Backend Solution Name:** (e.g., `<ProjectName>.sln`)
- **Frontend App Title & Package:** (e.g., `<project-name>`)
- **Database Engine & Name:** (e.g., SQL Server database `<ProjectName>Db`)
- **Target Locales:** (Default is `en` and `ar`; confirm if additional or different locales are needed).

*If any of these are missing, ask the user before guessing.*

---

## Step 3: Rename Solution & Project Identifiers

1. **Rename Solution File:**
   - Rename `backend/CoreStarter.sln` to `backend/<ProjectName>.sln`.
2. **Update Solution File Contents:**
   - Update project paths and solution GUIDs if needed.
3. **Update `.csproj` Metadata:**
   - In `backend/API/API.csproj`, update `<UserSecretsId>` with a new unique GUID.
   - Update assembly names or root namespaces if the user requested full namespace refactoring.
4. **Update Frontend Identifiers:**
   - In `frontend/package.json`: update `"name": "<project-name>"`.
   - In `frontend/src/app/layout.tsx`: update `<title>` and metadata.
   - In `frontend/src/shared/layouts/dashboard/shared/logo/Logo.tsx`: update brand logo text/graphics.
   - In `frontend/public/images/logos/`: place the new project logos.
   - Update LocalStorage keys from `corestarter_*` to `<projectname>_*`.

---

## Step 4: Configure Database & Environment Settings

1. **Backend Database Connection (`backend/API/appsettings.json`):**
   - Update `DefaultConnection` to target the new project database:
     ```json
     "ConnectionStrings": {
       "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=<ProjectName>Db;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"
     }
     ```
2. **JWT Configuration:**
   - Generate a new, secure 256-bit secret key in `Jwt:SecretKey`.
   - Update `Jwt:Issuer` and `Jwt:Audience` to match `<ProjectName>.API` and `<ProjectName>.Client`.
3. **Default Administrator Options:**
   - Update `DefaultAdmin:Email` to the client's admin email (e.g., `admin@<projectdomain>.com`).
4. **Frontend Environment:**
   - Ensure `frontend/.env.local` contains:
     ```env
     NEXT_PUBLIC_API_URL=http://localhost:5280/api/v1
     ```

---

## Step 5: Preserve Foundation & Establish Clean Migrations Baseline

1. **Keep Core Foundation:**
   - Preserve ASP.NET Core Identity (`ApplicationUser`, `ApplicationRole`).
   - Preserve `RefreshTokens` and token rotation mechanics.
   - Preserve `AppNotifications` and user profile endpoints.
   - Preserve Material UI theme, RTL/LTR layout, and dual-language infrastructure.
2. **Reset or Generate Initial Migration:**
   - If starting with a fresh database for the new project:
     ```bash
     dotnet ef migrations add InitialCreate --project backend/Infrastructure --startup-project backend/API --output-dir Data/Migrations
     dotnet ef database update --project backend/Infrastructure --startup-project backend/API
     ```

---

## Step 6: Introduce Project-Specific Domain Entities

Follow the established Clean Architecture layer rules:
1. **Domain:** Add entities in `backend/Domain/Entities/` implementing `BaseAuditableEntity` or `ICreationAuditable`.
2. **Infrastructure:**
   - Add `DbSet<T>` to `IApplicationDbContext` and `ApplicationDbContext`.
   - Create Fluent API mapping in `backend/Infrastructure/Data/Configurations/<Entity>Configuration.cs`.
3. **Application:**
   - Create vertical slice in `backend/Application/Features/<FeatureName>/`.
   - Add CQRS Commands, Queries, Handlers, and FluentValidation validators.
4. **API:**
   - Register routes in `backend/API/Routing/Router.cs`.
   - Add Controller in `backend/API/Controllers/<FeatureName>Controller.cs` inheriting `ApiControllerBase`.
5. **Frontend:**
   - Create module in `frontend/src/modules/<feature-name>/`.
   - Add routes in `frontend/src/lib/api/router.ts`.
   - Add pages in `frontend/src/app/(Dashboard)/<feature-name>/page.tsx`.
   - Add sidebar navigation in `src/shared/layouts/dashboard/vertical/sidebar/MenuItems.ts`.
   - Add localized text to both `ar.json` and `en.json`.

---

## Step 7: Full Stack Verification Gate

Run all verification gates before delivering the initialized project:

1. **Backend Verification:**
   ```bash
   dotnet build backend/<ProjectName>.sln /m:1 /nr:false
   ```
   *Must report 0 warnings and 0 errors.*
2. **Frontend Build Verification:**
   ```bash
   cd frontend
   npm run build
   ```
   *Must complete with exit code 0.*
3. **Import Verification:**
   ```bash
   node scripts/verify-imports.cjs
   ```
   *Must report 0 broken imports.*
4. **Translation Parity:**
   ```bash
   npm run validate:i18n
   ```
   *Must verify 100% dictionary key match.*
