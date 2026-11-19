import { RoleNames } from "../constants/roles";

/**
 * Checks whether an authenticated user has a specific tenant business permission.
 *
 * Authorization Rules (strictly aligned with Backend policy):
 * 1. Requires a valid, non-expired accessToken containing a valid tenant_id claim.
 *    Platform accounts (e.g. PlatformSuperAdmin, PlatformStaff) strictly operate without tenant context
 *    and are NOT automatically granted tenant business permissions.
 * 2. TenantAdmin within their tenant context inherently possesses all tenant-level permissions
 *    (matching backend ITenantCompanyAccessService.HasTenantPermissionAsync and TenantAdminHandler).
 * 3. TenantUser permissions are checked against token permission claims.
 * 4. Missing, malformed, or unavailable token/permission data fails closed (returns false).
 */
export function hasTenantPermission(
  accessToken: string | null | undefined,
  roles: string[] | undefined,
  permission: string
): boolean {
  if (!accessToken || typeof accessToken !== "string" || !permission || typeof permission !== "string") {
    return false;
  }

  try {
    const parts = accessToken.split(".");
    if (parts.length < 2) return false;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    const parsed = JSON.parse(jsonPayload);
    if (!parsed || typeof parsed !== "object") return false;

    // Check expiration: reject expired tokens
    if (typeof parsed.exp === "number" && parsed.exp * 1000 <= Date.now()) {
      return false;
    }

    // Tenant isolation: operational tenant permissions strictly require a valid tenant context
    const tenantId = parsed.tenant_id || parsed.tenantId || parsed.TenantId;
    if (!tenantId || typeof tenantId !== "string" || !tenantId.trim()) {
      return false;
    }

    // Resolve user roles from argument or token claims
    const tokenRoles =
      parsed.role ||
      parsed.roles ||
      parsed["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

    const userRoles: string[] = [
      ...(Array.isArray(roles) ? roles : []),
      ...(Array.isArray(tokenRoles)
        ? tokenRoles
        : typeof tokenRoles === "string"
        ? [tokenRoles]
        : []),
    ];

    // SuperAdmin and Admin possess full operational permissions
    if (userRoles.includes(RoleNames.SuperAdmin) || userRoles.includes(RoleNames.Admin)) {
      return true;
    }

    // For TenantUser, evaluate specific permission claims
    const rawPerms =
      parsed.permission ||
      parsed.permissions ||
      parsed["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/permission"];

    const userPerms: string[] = Array.isArray(rawPerms)
      ? rawPerms
      : typeof rawPerms === "string"
      ? [rawPerms]
      : [];

    return userPerms.includes(permission);
  } catch {
    return false;
  }
}

