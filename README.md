# NASAQ — Employee Attendance & Workforce Management System

> **Enterprise Attendance, Geofencing & Workforce Management Platform**  
> Operating Organization: **Sharm Photographer**

---

## 🌟 Overview

**NASAQ** is an internal, enterprise-grade attendance and workforce management solution engineered for Sharm Photographer. Built upon Clean Architecture and modern web standards, NASAQ provides mobile-first PWA attendance tracking, precise geofenced check-ins, automated shift rosters, and fine-grained role-based workforce governance.

---

## 🏗️ Architecture

NASAQ follows **Clean Architecture** principles on the backend paired with a **Feature-Sliced Next.js** frontend.

```text
Backend (.NET 10 / C# 13):
[API Layer] ────────► [Application Layer] ◄──────── [Infrastructure Layer]
(Controllers, Hubs)   (CQRS, MediatR, DTOs)          (EF Core 10, Identity, SQL)
                              │
                              ▼
                       [Domain Layer]
                  (Entities, Enums, Rules)

Frontend (Next.js 16 / React 19):
[App Router (src/app)] ──► [Feature Modules (src/modules)] ──► [Shared & Core UI]
(RSC, Layouts, Pages)       (Auth, Employees, Attendance)      (MUI v6, Redux, i18n)
```

---

## 🚀 Tech Stack

### Backend
- **Framework:** .NET 10 (C# 13)
- **Architecture:** Clean Architecture + CQRS (MediatR 12)
- **Persistence:** Entity Framework Core 10 (SQL Server / LocalDB)
- **Identity & Security:** ASP.NET Core Identity + JWT (HMAC-SHA256) with Refresh Token rotation
- **Validation:** FluentValidation
- **Real-Time:** ASP.NET Core SignalR
- **Reporting Engine:** QuestPDF & ClosedXML (In-Memory Streaming)
- **Testing:** xUnit, EF Core InMemory, Coverlet

### Frontend
- **Framework:** Next.js 16 (App Router + Turbopack)
- **Library:** React 19 (TypeScript 5.9)
- **UI Components:** Material UI (MUI) v6 & Emotion
- **State Management:** Redux Toolkit 2 & Redux Persist
- **Internationalization:** `next-intl` (Full Arabic RTL & English LTR)
- **PWA Support:** Custom Service Worker (`public/sw.js`) & Web Manifest

---

## 📁 Repository Structure

```text
NASAQ/
├── backend/
│   ├── API/                  # REST controllers, SignalR hubs, middleware & swagger
│   ├── Application/          # CQRS commands/queries, handlers, validators & DTOs
│   ├── Domain/               # Core entities, identity, repository interfaces & enums
│   ├── Infrastructure/       # EF Core DbContext, migrations, services & data seeder
│   ├── Tests/                # Automated xUnit unit, authorization & integration tests
│   └── Nasaq.sln             # Visual Studio solution file
├── frontend/
│   ├── public/               # Static assets, branding logos & PWA service worker
│   ├── src/
│   │   ├── app/              # Next.js App Router (route groups & layouts)
│   │   ├── modules/          # Feature slices (auth, employees, notifications, etc.)
│   │   ├── shared/           # Reusable UI widgets, layout components & hooks
│   │   ├── theme/            # Material UI palettes, typography & RTL config
│   │   ├── store/            # Redux store & RTK slices
│   │   └── i18n/             # Arabic (`ar.json`) and English (`en.json`) dictionaries
│   └── package.json          # Frontend scripts & dependencies
├── docs/                     # Architecture specifications & Phase 0-2 documentation
├── .agents/                  # AI agent engineering rules & guidelines
└── README.md                 # Project documentation
```

---

## ⚡ Quick Start

### Prerequisites
- **.NET 10 SDK** (v10.0.100 or newer)
- **Node.js** (v20 LTS or newer) & **npm**
- **SQL Server LocalDB** or **SQL Server 2022+**

---

### 1. Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Restore and build the solution
dotnet build Nasaq.sln

# Run the API server
dotnet run --project API/API.csproj --launch-profile https
```

- **Swagger API Documentation:** [https://localhost:7155/swagger](https://localhost:7155/swagger)
- **HTTP Fallback Endpoint:** [http://localhost:5280/swagger](http://localhost:5280/swagger)

> [!NOTE]
> Database migrations and the system data seeder run automatically in development when `Database:ApplyMigrationsOnStartup` and `Database:SeedDataOnStartup` are enabled in `appsettings.Development.json`.

---

### 2. Frontend Setup

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies (if not already installed)
npm install

# Start Next.js development server
npm run dev
```

- **Application URL:** [http://localhost:3000](http://localhost:3000)

---

## 👥 Default Seeded Accounts

The database comes pre-seeded with representative accounts across all system roles:

| Role | Email | Password | Full Name | Employee Code | Notes |
|---|---|---|---|---|---|
| **SuperAdmin** | `superadmin@nasaq.local` | `Admin@123456` | System SuperAdmin | `EMP-SUPER01` | Full administrative & system access |
| **Admin** | `admin@nasaq.local` | `Admin@123456` | Operations Administrator | `EMP-ADMIN01` | Workforce & operational management |
| **Supervisor** | `supervisor@nasaq.local` | `Admin@123456` | Ahmad Supervisor | `EMP-SUP01` | Manages direct supervisees |
| **Employee** | `employee@nasaq.local` | `Admin@123456` | Mohamed Photographer | `EMP-001` | Assigned to Ahmad Supervisor |
| **Employee** | `employee2@nasaq.local` | `Admin@123456` | Sara Logistics | `EMP-002` | Unassigned supervisor |

---

## 🧪 Quality Verification & Testing

### Backend Tests
Execute the automated test suite (including authorization policies, supervisor isolation, and seed verification):
```bash
dotnet test backend/Nasaq.sln
```

### Frontend Validation & Build
Verify translation dictionaries, import integrity, and production build readiness:
```bash
# Validate translation keys
npm --prefix frontend run validate:i18n

# Verify module imports
node frontend/scripts/verify-imports.cjs

# Verify TypeScript and build Next.js production bundle
npm --prefix frontend run build
```

---

## 🛡️ Key Business Rules & Security

- **Strict Supervisor Isolation:** Supervisors can only view and manage attendance for employees explicitly assigned to them under the Direct Supervisor Assignment model.
- **Privilege Escalation Protection:** System administrators cannot assign higher privileges or modify protected SuperAdmin accounts.
- **Auditable Records:** All key domain entities implement `IAuditableEntity` with automatic UTC timestamping and user tracking.
- **Template Purity:** NASAQ derives cleanly from the CoreStarter template while maintaining strict business domain boundaries.

---

## 📖 Documentation Catalog

- **Architectural Rules:** [`.agents/rules/architecture.md`](file:///.agents/rules/architecture.md)
- **Backend Standards:** [`.agents/rules/backend-dotnet.md`](file:///.agents/rules/backend-dotnet.md)
- **Frontend Standards:** [`.agents/rules/frontend-nextjs.md`](file:///.agents/rules/frontend-nextjs.md)
- **Phase 0 Baseline:** [`docs/phase-0/`](file:///docs/phase-0/)
- **Implementation Reports:** [`docs/implementation/`](file:///docs/implementation/)

---

© 2026 **Sharm Photographer** — NASAQ Workforce Management Platform. All rights reserved.
