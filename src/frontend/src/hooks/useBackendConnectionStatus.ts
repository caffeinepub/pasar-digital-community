/**
 * Hook that derives backend availability state for UI gating
 * Combines actor bootstrap status and backend health to provide a single source of truth
 */

import { useActorBootstrapStatus } from './useActorBootstrapStatus';
import { useBackendHealth } from './useBackendHealth';

export interface BackendConnectionStatus {
  isAvailable: boolean;
  isDegraded: boolean;
  statusMessage: string;
  retry: () => Promise<void>;
  isRetrying: boolean;
  error: Error | undefined;
}

export function useBackendConnectionStatus(): BackendConnectionStatus {
  const { isError, error, retry, isRetrying } = useActorBootstrapStatus();
  const { isLoading: healthLoading, isReachable } = useBackendHealth();

  // Backend is degraded if actor bootstrap failed or health check shows unreachable
  const isDegraded = isError || (!healthLoading && !isReachable);

  // Backend is available if actor bootstrap succeeded and health check passes
  const isAvailable = !isError && !healthLoading && isReachable;

  // Generate plain-English status message
  let statusMessage = 'Connected';
  if (isDegraded) {
    if (!isReachable && !healthLoading) {
      statusMessage = 'Service temporarily unavailable';
    } else if (isError) {
      statusMessage = 'Connection error - some features may be unavailable';
    } else {
      statusMessage = 'Checking connection...';
    }
  }

  return {
    isAvailable,
    isDegraded,
    statusMessage,
    retry,
    isRetrying,
    error,
  };
}
