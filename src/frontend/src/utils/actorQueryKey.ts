/**
 * Shared utility to generate canonical React Query key for actor queries
 * Ensures useActor and useActorBootstrapStatus reference the same query
 */

export function getActorQueryKey(identityPrincipal?: string): [string, string] {
  return ['actor', identityPrincipal || 'anonymous'];
}
