/**
 * Admin allowlist utility for onboarding bypass
 * Supports the authorization component's role-based access control by providing
 * a deterministic client-side bypass for specified principals.
 */

// Collection of allowlisted admin principals
const ALLOWLISTED_ADMIN_PRINCIPALS = new Set([
  'dcama-lvxhu-qf6zb-u75wm-yapdd-dosl4-b3rvi-pxrax-sznjy-3yq47-bae',
]);

/**
 * Check if the given principal string matches any allowlisted admin
 * @param principalString - The principal ID to check
 * @returns true if the principal is an allowlisted admin
 */
export function isAllowlistedAdmin(principalString: string | undefined | null): boolean {
  if (!principalString) return false;
  return ALLOWLISTED_ADMIN_PRINCIPALS.has(principalString);
}

/**
 * Get all allowlisted admin principals
 * @returns Array of allowlisted admin principal strings
 */
export function getAllowlistedAdminPrincipals(): string[] {
  return Array.from(ALLOWLISTED_ADMIN_PRINCIPALS);
}
