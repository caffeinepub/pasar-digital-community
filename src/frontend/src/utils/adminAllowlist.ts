/**
 * Admin allowlist utility for onboarding bypass
 * Supports the authorization component's role-based access control by providing
 * a deterministic client-side bypass for the specified principal.
 */

const ALLOWLISTED_ADMIN_PRINCIPAL = 'dcama-lvxhu-qf6zb-u75wm-yapdd-dosl4-b3rvi-pxrax-sznjy-3yq47-bae';

/**
 * Check if the given principal string matches the allowlisted admin
 * @param principalString - The principal ID to check
 * @returns true if the principal is the allowlisted admin
 */
export function isAllowlistedAdmin(principalString: string | undefined | null): boolean {
  if (!principalString) return false;
  return principalString === ALLOWLISTED_ADMIN_PRINCIPAL;
}

/**
 * Get the allowlisted admin principal ID
 * @returns The allowlisted admin principal string
 */
export function getAllowlistedAdminPrincipal(): string {
  return ALLOWLISTED_ADMIN_PRINCIPAL;
}
