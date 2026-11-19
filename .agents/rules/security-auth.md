---
trigger: model_decision
description: "Standards and security rules for ASP.NET Core Identity, JWT authentication, Refresh Token rotation, role/permission authorization, and secret management."
---

# Security & Authentication Standards

This rule defines security policies, identity management standards, and authentication protocols for **CoreStarter**.

---

## 1. Backend Is the Sole Source of Truth

- **Server-Side Enforcement:** Frontend UI conditional rendering (`hasPermission(...)`) is strictly for user experience and visual hints. **All security and permission checks must be enforced authoritatively on the backend**.
- **Controller Attributes:** Every API endpoint must be explicitly decorated with an authorization policy or explicit attribute:
  - `[AllowAnonymous]`: Only on public endpoints (e.g., login, refresh token, public health).
  - `[Authorize]`: Requires a valid JWT Bearer token.
  - `[Authorize(Roles = RoleNames.Admin)]`: Restricts access to specific role assignments.
  - Custom Permission Policies: Use `Permissions` constants from `backend/Domain/Authorization/Permissions.cs`.

---

## 2. ASP.NET Core Identity & Password Security

- **User Model:** `ApplicationUser` (`backend/Domain/Identity/ApplicationUser.cs`) inherits from `IdentityUser<string>`.
- **Password Policies:** Enforce strong password requirements:
  - Minimum 8 characters.
  - Requires uppercase, lowercase, numeric digit, and special character.
- **Account Lockout:** Failed login attempts must trigger temporary account lockout to prevent brute-force attacks.
- **Protected Accounts:** Seeded system accounts (`SuperAdmin`) are safeguarded against accidental deletion or role revocation via `ProtectedUsersOptions`.

---

## 3. JWT & Refresh Token Lifecycle

### 3.1 Access Tokens (JWT)
- Signed symmetrically using `HMAC-SHA256` with a strong secret key (`JwtSettings.SecretKey` minimum 256 bits).
- Short lifetime (default: 15 minutes) to minimize exposure windows if intercepted.
- Contains claims: `sub`, `email`, `name`, `role`, and `permission`.

### 3.2 Refresh Tokens
- Cryptographically strong random tokens generated via `RandomNumberGenerator`.
- Persisted in the `RefreshTokens` database table with tracking metadata:
  - `ExpiresUtc` (default: 7 days)
  - `CreatedUtc`, `CreatedByIp`
  - `RevokedUtc`, `RevokedByIp`
  - `ReplacedByToken`
- **One-Time Rotation:** Every refresh token exchange automatically revokes the presented token and issues a new pair. If an already revoked token is presented, the entire token family is revoked to prevent replay attacks.

---

## 4. Frontend Session Management

- **Storage & Invalidation:** Access tokens are kept in memory or managed via Redux. On logout or session expiration, the frontend invokes `sessionTerminationService` (`src/modules/auth/services/sessionTermination.service.ts`) to purge stored credentials and notify other browser tabs.
- **Cross-Tab Synchronization:** `BroadcastChannel` or `storage` events synchronize logout events across all open tabs immediately.
- **Concurrent 401 Interception:** The Axios response interceptor queues concurrent 401 requests into a single in-flight `refreshPromise` in `src/lib/api/api.ts` so that only one refresh request is sent to the backend.

---

## 5. Sensitive Information & Secrets Management

- **Zero Hardcoded Secrets:** Never hardcode connection strings, JWT secret keys, API keys, or passwords in source code.
- **Configuration Sources:** Use `appsettings.json`, environment variables, or .NET UserSecrets (`dotnet user-secrets`).
- **Data Masking:** Use `backend/Application/Common/SensitiveDataMasker.cs` to sanitize logs and exception outputs. Never log raw passwords, access tokens, or refresh tokens.
- **CORS Constraints:** CORS policy must explicitly whitelist allowed client origins (e.g., `http://localhost:3000`). Never use wildcard origins (`*`) in combination with credential support.
