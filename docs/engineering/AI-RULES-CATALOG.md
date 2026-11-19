# NASAQ — AI Engineering Rules Catalog

This catalog documents the active engineering rules and quality standards governing all AI agents and developers working on the **NASAQ** Employee Attendance & Workforce Management System.

---

## 1. Rule Index

| Rule File | Scope | Summary |
|---|---|---|
| [ai-safety.md](file:///.agents/rules/ai-safety.md) | Universal | 12 Golden Safety Rules: Analyze First, Strict Architecture, Zero Unnecessary Refactoring, Template Purity. |
| [architecture.md](file:///.agents/rules/architecture.md) | Universal | Clean Architecture layers (Domain, Application, Infrastructure, API) and Next.js feature slicing. |
| [backend-dotnet.md](file:///.agents/rules/backend-dotnet.md) | Backend (.NET 10) | C# 13 standards, CQRS/MediatR, API conventions, and **Code Comments & Global Usings Policy**. |
| [database-efcore.md](file:///.agents/rules/database-efcore.md) | Database | EF Core migrations, configuration conventions, index strategies, and soft deletion. |
| [security-auth.md](file:///.agents/rules/security-auth.md) | Security | 4-tier RBAC (`SuperAdmin`, `Admin`, `Supervisor`, `Employee`), JWT authentication, token rotation, supervisor scoping. |
| [frontend-nextjs.md](file:///.agents/rules/frontend-nextjs.md) | Frontend (Next.js 16) | Next.js App Router, feature modules, Redux Toolkit, and PWA integration. |
| [design-system-i18n.md](file:///.agents/rules/design-system-i18n.md) | Frontend | Material UI v7 theme tokens, bi-directional Arabic RTL / English LTR, next-intl keys. |
| [testing-quality.md](file:///.agents/rules/testing-quality.md) | Quality | Verification gates: 0 compiler warnings, automated test execution, import integrity, translation validation. |

---

## 2. Code Comments & Global Usings Policy (Rule Highlight)

Added as **Section 9** of `backend-dotnet.md`:

### 2.1 Code Comments
- **Self-documenting code is the default:** Code must express its intent through clear naming and clean structure.
- **Prohibited:** Routine XML documentation (`/// <summary>`), redundant explanations of what code does, and decorative `#region` blocks.
- **Allowed by Exception:** Explaining **WHY** for non-obvious business logic, security guards (e.g. anti-escalation), or technical workarounds (e.g. `DeleteBehavior.Restrict`).

### 2.2 Global Usings
- Each project (`Domain`, `Application`, `Infrastructure`, `API`, `Tests`) manages an authoritative `GlobalUsings.cs`.
- Redundant file-level `using` statements for globally imported namespaces are strictly eliminated.
- Local `using` statements are reserved exclusively for file-specific types.
