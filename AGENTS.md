# NASAQ Engineering Agent Guidelines

Welcome to the NASAQ (Employee Attendance & Workforce Management System) codebase. All AI agents, contributors, and engineers must strictly adhere to the project rules and standards defined in `.agents/rules/`.

## Mandatory Engineering Rules
- **AI Safety & Architectural Boundaries:** [ai-safety.md](file:///.agents/rules/ai-safety.md)
- **Clean Architecture & Module Boundaries:** [architecture.md](file:///.agents/rules/architecture.md)
  - Includes Clean Architecture layers, feature-sliced frontend, and **Section 5: Centralized File Storage & Media Architecture**.
- **Backend .NET 10 & C# 13 Engineering Standards:** [backend-dotnet.md](file:///.agents/rules/backend-dotnet.md)
  - Includes **Section 2.3: CQRS Direct Binding Policy**, **Section 9: Code Comments & Global Usings Policy**, **Section 10: Centralized File Storage Architecture**, and **Section 11: Unit of Work, Transaction Lifecycle & Post-Commit Rules**.
- **Database Persistence & EF Core Migrations:** [database-efcore.md](file:///.agents/rules/database-efcore.md)
  - Includes shared Identity/UnitOfWork transactions, authoritative rollback without manual compensation, and post-commit action rules.
- **Security, Identity & Authorization:** [security-auth.md](file:///.agents/rules/security-auth.md)
- **Frontend Next.js 16 & React 19 Standards:** [frontend-nextjs.md](file:///.agents/rules/frontend-nextjs.md)
- **Design System, MUI & i18n Translation:** [design-system-i18n.md](file:///.agents/rules/design-system-i18n.md)
- **Quality Gates & Testing:** [testing-quality.md](file:///.agents/rules/testing-quality.md)
  - Includes testing freeze guidelines and post-freeze verification checklist.

## Authoritative Documentation Catalog
- [AI-RULES-CATALOG.md](file:///docs/engineering/AI-RULES-CATALOG.md): Complete catalog and governance overview of all active rules.
