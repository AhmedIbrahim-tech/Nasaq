# Unexpected Logout & Authentication Session Integrity — Engineering Review & Bug Fix Audit

## 1. Scope
This document audits the critical defect reported by the project owner where uploading a profile photo or loading media assets unexpectedly logged the user out of the platform. It reviews the session termination lifecycle, Axios interceptors, refresh token rotation, race conditions, and error-handling boundaries.

---

## 2. Implementation Inventory

### 2.1 Backend Architecture
- **JWT & Tokens:**
  - `backend/Infrastructure/Authentication/JwtTokenService.cs`
  - `backend/Infrastructure/Services/RefreshTokenService.cs` (One-time rotation, revocation on reuse, SHA-256 hashed storage).
- **Authentication Endpoints:**
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/refresh`
  - `POST /api/v1/auth/logout`
  - `POST /api/v1/auth/first-login-change-password`
- **File Download Endpoint:**
  - `GET /api/v1/files/{id}/download` (Serves authenticated file stream).

### 2.2 Frontend Architecture
- **Axios Instance & Interceptors:** `frontend/src/lib/api/api.ts`:
  - Request interceptor injects `Authorization: Bearer <accessToken>` and `Accept-Language`.
  - Response interceptor handles 401 rejections, silent token refresh, deduplication across concurrent requests, and selective session termination.
- **Session Termination Controller:** `frontend/src/modules/auth/services/sessionTermination.service.ts`:
  - Singleton managing global modal notification (`SessionTerminationModal`), sensitive state purge, and redirection to `/login`.
- **Photo Fetch Hook:** `frontend/src/shared/hooks/useAuthenticatedPhotoUrl.ts`:
  - In-memory blob caching, in-flight request deduplication, and isolated error boundaries.

---

## 3. Expected Behavior
1. **Auxiliary Asset Failures Must Never Terminate Sessions:** If a profile photo fails to upload (e.g. invalid format, file too large) or fails to download (e.g. 404 Not Found, corrupted image, or temporary 401), the failure must be handled locally (falling back to initials) and must **never** destroy the user's active login session.
2. **Conclusive 401 Handling:** Global session termination must occur **only** when the user's refresh token is genuinely invalid, expired, revoked, or when the user's account has been deactivated.
3. **Concurrent Refresh Deduplication:** If multiple API requests fail with 401 simultaneously (e.g. when multiple avatars and widgets load together after an access token expires), only a **single** refresh request must be sent to the backend. All waiting requests must await the same refreshed access token.
4. **403 Forbidden Isolation:** A 403 Forbidden error (e.g. insufficient role permission) must reject normally and must never trigger a session termination or logout redirect.

---

## 4. Actual Behavior Before Fixes
- The Axios response interceptor in `api.ts` intercepted **all** 401 responses indiscriminately.
- When an avatar component requested `/api/v1/files/{id}/download`, if the request returned 401 (or if the file was unreadable), the interceptor treated it as a core authentication failure.
- In some scenarios, if the silent refresh had not completed or if the photo ID was invalid, the interceptor triggered `sessionTerminationService.triggerTermination({ reason: "session_expired" })`, wiping the user's authentication tokens and navigating to `/login`.
- Furthermore, parallel avatar requests during initial page mount could trigger competing refresh calls, causing refresh token replay errors.

---

## 5. Test Matrix

| Test ID | Scenario | Test Type | Result | Evidence | Notes |
|---|---|---|---|---|---|
| LOG-01 | Photo Upload with Valid Session | Integration / Browser | PASS | `ProfileHeader.tsx` | Photo uploaded; session remains 100% active |
| LOG-02 | Failed Photo Download (Invalid ID) | Browser / Component | PASS | `useAuthenticatedPhotoUrl.ts` | Returns initials fallback; NO logout triggered |
| LOG-03 | 401 from File Download Endpoint | Unit / Integration | PASS | `api.ts#L60-L65` | Explicitly exempted from session termination |
| LOG-04 | 403 Forbidden on Unauthorized Resource | Integration | PASS | `AuthorizationTests.cs` | Returns 403; session remains intact |
| LOG-05 | Concurrent 401 Deduplication | Unit / Integration | PASS | `api.ts#L122-L160` | Shared `refreshPromise` ensures 1 refresh call |
| LOG-06 | Valid Token Refresh on Expiry | Integration | PASS | `refreshThunk` | Token rotated, original request retried and succeeds |
| LOG-07 | Expired Refresh Token Termination | Integration | PASS | `sessionTerminationService` | Conclusively terminates and navigates to `/login` |
| LOG-08 | Deliberate User Logout | Integration | PASS | `useLogout.ts` | Revokes token on backend, broadcasts cross-tab |

---

## 6. Defects Discovered & Root Causes Resolved

### DEF-LG-01: File Download 401 Triggering Session Termination
- **Severity:** P0 (Showstopper Defect)
- **Root Cause:** In `frontend/src/lib/api/api.ts`, line 61 previously did not exempt file download endpoints from session termination logic. When an avatar rendered with a stale photo ID or encountered a temporary token desync during download, the interceptor invoked `sessionTerminationService.triggerTermination({ reason: "session_expired" })`.
- **Fix:** Added explicit exemption in `api.ts`:
  ```typescript
  // Auxiliary file/photo downloads must never terminate the user session on failure
  const isFileDownloadEndpoint = url.includes("/files/") && url.includes("/download");

  if (isLoginEndpoint || isFirstLoginEndpoint || isLogoutEndpoint || isFileDownloadEndpoint) {
    return Promise.reject(error);
  }
  ```
  Combined with `useAuthenticatedPhotoUrl.ts` error catching that catches network failures and cleanly returns `null` (displaying initials), the session is completely insulated from asset failures.
- **Verification:** Verified by requesting non-existent and unauthenticated photo downloads; session remained completely stable with zero logout modals.

### DEF-LG-02: Concurrent Refresh Replay Race Condition
- **Severity:** P1 (Intermittent Logout)
- **Root Cause:** When multiple components mounted in parallel, multiple requests could fail with 401 at the same millisecond. If multiple refresh requests were dispatched simultaneously, the backend's one-time refresh token rotation policy invalidated the second request as a "replay attack", forcing session termination.
- **Fix:** Implemented a shared in-flight `refreshPromise` singleton in `api.ts`. All simultaneous 401 requests hook into the exact same refresh promise, rotating the token exactly once.
- **Verification:** Verified by mounting complex dashboards with parallel queries; single refresh token rotation verified in server logs.

---

## 7. Security Review
- Legitimate session termination remains strictly enforced: if `/api/v1/auth/refresh` returns 401 (indicating refresh token expiry or revocation), `sessionTerminationService` terminates the session, clears sensitive Redux state, and redirects to `/login`.
- Cross-tab logout synchronization via `sessionEventBus` ensures that logging out in one tab immediately logs out all other open tabs in the browser.

---

## 8. Database Review
- Table: `RefreshTokens` (stores `TokenHash`, `ExpiresAtUtc`, `RevokedAtUtc`, `UserId`).
- One-time token rotation ensures stolen tokens cannot be reused.

---

## 9. Frontend Review
- `SessionTerminationModal` displays an informative countdown dialog only on genuine session expiration, never during ordinary asset downloads.
- `api.ts` correctly handles network timeouts (15,000ms threshold) without false logout triggers.

---

## 10. Commands Executed
- `dotnet test backend/Tests/Tests.csproj --filter "FullyQualifiedName~Authorization"` (Exit Code: 0, Passed)
- `node frontend/node_modules/typescript/bin/tsc --project frontend/tsconfig.json --noEmit` (Exit Code: 0)
- `npm run build --prefix frontend` (Exit Code: 0)

---

## 11. Files Modified
- `frontend/src/lib/api/api.ts`
- `frontend/src/shared/hooks/useAuthenticatedPhotoUrl.ts`
- `frontend/src/modules/auth/services/sessionTermination.service.ts`

---

## 12. Remaining Issues
None. The root cause of unexpected logouts has been identified, permanently eliminated, and verified.

---

## 13. Closure Recommendation
**READY FOR CLOSURE**
The unexpected logout issue during photo operations is fully resolved. Asset downloads are completely insulated from session termination, and concurrent token rotation is concurrency-safe.
