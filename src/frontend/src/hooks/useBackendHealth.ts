/**
 * Hook for checking backend health using anonymous actor
 * Provides lightweight reachability status without requiring authentication
 */

import { useQuery } from '@tanstack/react-query';
import { createActorWithConfig } from '../config';

export interface BackendHealthStatus {
  isLoading: boolean;
  isReachable: boolean;
  build?: string;
  time?: bigint;
}

export function useBackendHealth(): BackendHealthStatus {
  const query = useQuery({
    queryKey: ['backend-health'],
    queryFn: async () => {
      try {
        const actor = await createActorWithConfig();
        const diagnostics = await actor.getBackendDiagnostics();
        return {
          isReachable: true,
          build: diagnostics.build,
          time: diagnostics.time,
        };
      } catch (error) {
        console.error('Backend health check failed:', error);
        return {
          isReachable: false,
        };
      }
    },
    retry: 1,
    staleTime: 10000, // 10 seconds
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return {
    isLoading: query.isLoading,
    isReachable: query.data?.isReachable ?? false,
    build: query.data?.build,
    time: query.data?.time,
  };
}
