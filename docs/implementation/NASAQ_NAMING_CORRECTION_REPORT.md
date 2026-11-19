# NASAQ Naming Correction Report: Product Identity Alignment

**Document:** `docs/implementation/NASAQ_NAMING_CORRECTION_REPORT.md`  
**Product Name:** **NASAQ (نسق)**  
**Client / Operating Company:** **Sharm Photographer (شرم فوتوجرافر)**  
**Workspace:** `d:\Projects\NASAQ`  
**Date:** November 19, 2026  
**Status:** **COMPLETE — VERIFIED & READY FOR REVIEW**

---

## 1. Executive Summary

This report documents the official correction aligning the technical product identity with **NASAQ (نسق)** while strictly preserving **Sharm Photographer (شرم فوتوجرافر)** as the operating company using the system.

### The Fundamental Separation:
- **Product Name:** **NASAQ (نسق)**
- **Application Name:** **Nasaq**
- **Solution Name:** **Nasaq** (`Nasaq.sln`)
- **Root Namespace:** **Nasaq** (Assemblies: `API`, `Application`, `Domain`, `Infrastructure`)
- **Client / Operating Company:** **Sharm Photographer**
- **System Architecture:** Single-company, non-SaaS Internal Employee Attendance & Workforce Management System.

All technical identifiers, package names, PWA manifests, API documentation, browser metadata, and UI labels have been updated to **Nasaq**, while company-specific business requirements and employer context accurately retain **Sharm Photographer**.

---

## 2. Files Modified

| File Path | Action | Description |
|---|---|---|
| `backend/SharmPhotographer.sln` -> `backend/Nasaq.sln` | Renamed | Renamed Visual Studio solution to `Nasaq.sln`. Preserved all project GUIDs and references. |
| `backend/API/API.csproj` | Modified | Updated `<RootNamespace>` to `Nasaq` and `<UserSecretsId>` to `aspnet-Nasaq-API-7F3C2A91-4B6E-4D18-9C11-8E2A5F0B1D44`. |
| `backend/API/Extensions/ServiceCollectionExtensions.cs` | Modified | Updated Swagger Title to `"Nasaq API"` and Description to `"Nasaq Employee Attendance Management API"`. |
| `backend/API/Program.cs` | Modified | Updated Swagger UI endpoint name to `"Nasaq API v1"`. |
| `backend/API/appsettings.json` | Modified | Updated Connection String database to `Nasaq_Dev`. Updated JWT Issuer to `"Nasaq.API"`, Audience to `"Nasaq.Client"`, Secret key prefix, Admin email to `admin@nasaq.local` (`AutoSeed: false` preserved), and Email default from name to `"Nasaq"`. |
| `backend/API/appsettings.Development.json` | Modified | Updated Connection String database to `Nasaq_Dev` (`ApplyMigrationsOnStartup: false` preserved). |
| `backend/Application/Configuration/DefaultAdminOptions.cs` | Modified | Updated default email to `admin@nasaq.local` (`AutoSeed: false` preserved). |
| `backend/Application/Configuration/EmailOptions.cs` | Modified | Updated default from name to `"Nasaq"`. |
| `backend/Application/Configuration/ProtectedUsersOptions.cs` | Modified | Updated protected users list to `admin@nasaq.local`. |
| `backend/Application/Features/Reports/Exporting/ReportExportEngine.cs` | Modified | Updated report engine headers and footers to `"Nasaq — Sharm Photographer - {System}"` and `"نسق — تقرير نظام معتمد"`. |
| `frontend/package.json` | Modified | Renamed package name to `"nasaq"`. |
| `frontend/src/app/manifest.ts` | Modified | Updated PWA manifest name to `"Nasaq — Employee Attendance Management"`, short name to `"Nasaq"`, and description referencing Sharm Photographer as client company. |
| `frontend/public/sw.js` | Modified | Updated cache name to `"nasaq-shell-v1"`, and documentation headers identifying Nasaq as product and Sharm Photographer as client company. |
| `frontend/src/shared/components/pwa/ServiceWorkerRegister.tsx` | Modified | Updated component header to reference the Nasaq PWA service worker. |
| `frontend/src/app/layout.tsx` | Modified | Updated metadata title to `"Nasaq — Employee Attendance Management"`, description to `"Nasaq Employee Attendance and Workforce Management System"`, `appleWebApp.title` to `"Nasaq"`, and supported `nasaq-theme-mode`/`nasaq_dir`/`nasaq_lang` storage keys. |
| `frontend/src/app/(auth)/login/page.tsx` | Modified | Updated page metadata title to `'Login — Nasaq'` and description to `'Sign in to Nasaq Employee Attendance & Workforce Management (Sharm Photographer)'`. |
| `frontend/src/app/(Dashboard)/notifications/page.tsx` | Modified | Updated page metadata title to `"Notifications Center — Nasaq"`. |
| `frontend/src/app/(Dashboard)/profile/page.tsx` | Modified | Updated page metadata title to `"My Profile — Nasaq"`. |
| `frontend/src/shared/layouts/dashboard/shared/logo/Logo.tsx` | Modified | Updated image `alt` text to `"Nasaq Logo"`. |
| `frontend/src/modules/auth/views/SideLoginView.tsx` | Modified | Updated fallback title to `'Login — Nasaq'`, description to `'Nasaq Employee Attendance Management (Sharm Photographer)'`, and showcase label to `'Nasaq System'`. |
| `frontend/src/modules/auth/components/LoginForm.tsx` | Modified | Updated badge fallback to `'NASAQ'`, subtitle fallback to `'Sign in to your Nasaq workspace to continue.'`, and password help fallback. |
| `frontend/src/modules/auth/components/FirstLoginChangePasswordDialog.tsx` | Modified | Updated password setup fallbacks to `'Welcome to Nasaq.'` and `'...access to Nasaq.'`. |
| `frontend/src/modules/auth/components/ProductShowcase.tsx` | Modified | Updated showcase badge to `'Nasaq • Attendance & Workforce Management'`. |
| `frontend/src/i18n/messages/en.json` | Modified | Aligned product name keys to `"Nasaq"`, while preserving `"DefaultCompanyName": "Sharm Photographer"`. |
| `frontend/src/i18n/messages/ar.json` | Modified | Aligned product name keys to `"نسق"`, while preserving `"DefaultCompanyName": "شرم فوتوجرافر"`. |
| `Sharm_Photographer_System_Master_Blueprint.md` | Modified | Updated title and metadata to clarify NASAQ as the product and Sharm Photographer as the client/operating company. |
| `docs/phase-0/Scope_v1.md` | Modified | Updated executive summary and header to establish NASAQ as the product and Sharm Photographer as the operating company. |
| `docs/phase-0/Product_Glossary.md` | Modified | Added explicit glossary entries for **NASAQ (نسق)** as the product and **Sharm Photographer (شرم فوتوجرافر)** as the operating company. |
| `docs/phase-0/Decision_Log.md` | Modified | Updated header to establish NASAQ product identity. |
| `docs/phase-0/Critical_Decisions.md` | Modified | Updated header to establish NASAQ product identity. |

---

## 3. Namespaces, Solution & Assemblies

- **Solution File:** `backend/Nasaq.sln`
- **Root Namespace:** `Nasaq` (defined in `API.csproj`)
- **Assembly Structure:** Clean Architecture structure preserved:
  - `API` (Web API Host & Endpoints)
  - `Application` (CQRS Use Cases & Abstractions)
  - `Domain` (Core Entities & Business Interfaces)
  - `Infrastructure` (EF Core, Identity, Persistence)
- **API Title:** `Nasaq API`
- **Swagger / OpenAPI Description:** `Nasaq Employee Attendance Management API`
- **Swagger Endpoint:** `Nasaq API v1`
- **UserSecretsId:** `aspnet-Nasaq-API-7F3C2A91-4B6E-4D18-9C11-8E2A5F0B1D44`

---

## 4. Frontend Branding & PWA Configuration

- **Package Name:** `nasaq` (`frontend/package.json`)
- **Application Title:** `Nasaq`
- **Browser Metadata:** `Nasaq — Employee Attendance Management`
- **PWA Name:** `Nasaq — Employee Attendance Management`
- **PWA Short Name:** `Nasaq`
- **PWA Manifest Route:** `/manifest.webmanifest`
- **Service Worker Cache Name:** `nasaq-shell-v1`
- **Service Worker Boundaries:** Strictly unchanged — bypasses `/api/*`, SignalR, and `Authorization` requests; zero background tracking; zero geolocation on startup.
- **Login Page Title:** `Login — Nasaq`
- **Logo Component:** `alt="Nasaq Logo"`

---

## 5. Database Configuration

- **Development Database Name:** `Nasaq_Dev`
  - `ConnectionStrings:DefaultConnection`: `Server=(localdb)\\MSSQLLocalDB;Database=Nasaq_Dev;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True`
- **Safety Boundary Preserved:**
  - `Database:ApplyMigrationsOnStartup` remains `false` in both `appsettings.json` and `appsettings.Development.json`.
  - `DefaultAdmin:AutoSeed` remains `false`.
  - No database was created, dropped, reset, or migrated.
  - Baseline migration `20261119041536_InitialCreate` remains clean and unchanged.
  - Zero pending model changes detected by EF Core tooling.

---

## 6. Preserved Company References

In accordance with instructions, "Sharm Photographer" was **not** blindly erased. It was deliberately preserved wherever the operating company identity or business requirements apply:

1. **Company Name in Localization:**
   - English: `"DefaultCompanyName": "Sharm Photographer"`
   - Arabic: `"DefaultCompanyName": "شركة شرم فوتوجرافر"`
2. **Contextual Subtitles & Descriptions:**
   - Login page description: `Nasaq — Employee Attendance & Workforce Management (Sharm Photographer)`
   - Arabic login description: `بوابة المصادقة لمنظومة نسق لإدارة الحضور والعمل — شرم فوتوجرافر`
   - Manifest description: `Nasaq Employee Attendance and Workforce Management System for Sharm Photographer`
3. **Report Generation Footers & Headers:**
   - CSV / Excel metadata: `Nasaq — Sharm Photographer - {Workforce Management System}`
4. **Service Worker Internal Documentation:**
   - Header metadata: `Client Company: Sharm Photographer`
5. **Business Domain Documentation:**
   - All scenario descriptions in `Attendance_Scenario_Matrix.md`, `Scope_v1.md`, and `Product_Glossary.md` accurately refer to Sharm Photographer as the employer operating branches and hotel worksites in Sharm El-Sheikh.

---

## 7. Verification & Build Results

All mandatory verification checks were executed and passed cleanly:

| Verification Target | Command | Result | Details |
|---|---|---|---|
| **Backend Build** | `dotnet build backend/Nasaq.sln /m:1 /nr:false` | **PASS** | 0 Warning(s), 0 Error(s). .NET 10.0.13. |
| **EF Core Model Synchronization** | `dotnet ef migrations has-pending-model-changes --project backend/Infrastructure --startup-project backend/API` | **PASS** | "No changes have been made to the model since the last migration." |
| **Translation Key Validation** | `npm --prefix frontend run validate:i18n` | **PASS** | 2,669 keys verified across `ar.json` and `en.json`. 0 dot errors. |
| **Import Integrity Check** | `node frontend/scripts/verify-imports.cjs` | **PASS** | 190 imports checked, 0 broken. |
| **Frontend Production Build** | `npm --prefix frontend run build` | **PASS** | Next.js 16.0.5 production build completed in 2.6s. All 10 static routes generated cleanly. |
| **Original Template Integrity** | `d:\Projects\CoreStarter` | **PASS** | Untouched. `CoreStarter.sln` intact with original timestamp. |

---

## 8. Remaining Issues

**Zero blocking issues.**  
The technical product identity is 100% aligned with **NASAQ**, the company context remains cleanly preserved as **Sharm Photographer**, and all build verification gates have passed with zero warnings and zero errors.

---

## 9. Conclusion & Stopping Point

The naming correction is complete. As directed:
- No additional modules or entities were created.
- Phase 2 implementation has NOT been started.
- System is paused awaiting project owner instructions.
