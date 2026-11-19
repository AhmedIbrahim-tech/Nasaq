/**
 * Safe Return-To-Page Navigation Utility for CoreStarter
 * Protects against open-redirect vulnerabilities, malformed destinations, and authentication loops.
 */

const STORAGE_KEY = "corestarter_post_login_redirect";

/**
 * Validates that a candidate redirect URL is a safe, internal application route.
 * Rejects external URLs, protocol-relative URLs, javascript: URIs, backslashes, and auth loops.
 */
export function isValidReturnUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") {
    return false;
  }

  const trimmed = url.trim();

  // Must begin with a single slash (internal relative route)
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return false;
  }

  // Reject backslashes (can be interpreted as protocol separators in some browsers)
  if (trimmed.includes("\\")) {
    return false;
  }

  // Reject protocol strings anywhere in path
  const lower = trimmed.toLowerCase();
  if (
    lower.includes("http:") ||
    lower.includes("https:") ||
    lower.includes("javascript:") ||
    lower.includes("data:") ||
    lower.includes("vbscript:")
  ) {
    return false;
  }

  // Reject redirecting back to login or authentication landing pages
  const pathOnly = lower.split("?")[0].split("#")[0];
  if (
    pathOnly === "/login" ||
    pathOnly.startsWith("/login/") ||
    pathOnly === "/auth" ||
    pathOnly.startsWith("/auth/")
  ) {
    return false;
  }

  return true;
}

/**
 * Safely persists the intended return path before forced session termination or redirect.
 */
export function savePostLoginRedirect(path: string | null | undefined): void {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return;
  }

  try {
    if (path && isValidReturnUrl(path)) {
      window.sessionStorage.setItem(STORAGE_KEY, path.trim());
    }
  } catch {
    // Gracefully handle storage quotas or restricted iframe environments
  }
}

/**
 * Retrieves and validates the pending post-login return destination.
 * Checks both sessionStorage and URL search parameters.
 */
export function getPostLoginRedirect(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  let candidate: string | null = null;

  // 1. Check URL query parameters (e.g. /login?returnUrl=/platform/users)
  try {
    const params = new URLSearchParams(window.location.search);
    const paramUrl = params.get("returnUrl") || params.get("returnTo");
    if (paramUrl && isValidReturnUrl(paramUrl)) {
      candidate = paramUrl;
    }
  } catch {
    // Ignore URL parse errors
  }

  // 2. Check sessionStorage if not found in query params
  if (!candidate && window.sessionStorage) {
    try {
      const stored = window.sessionStorage.getItem(STORAGE_KEY);
      if (stored && isValidReturnUrl(stored)) {
        candidate = stored;
      }
    } catch {
      // Ignore storage access errors
    }
  }

  return candidate;
}

/**
 * Clears the pending return destination once handled or when explicit logout occurs.
 */
export function clearPostLoginRedirect(): void {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return;
  }

  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}
