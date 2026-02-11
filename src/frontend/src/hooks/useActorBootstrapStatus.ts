/**
 * Hook to monitor actor bootstrap status and provide retry functionality
 * Exposes loading, error states and retry action for startup error recovery
 */

import { useQueryClient } from '@tanstack/react-query';
import { useInternetIdentity } from './useInternetIdentity';
import { getActorQueryKey } from '../utils/actorQueryKey';
import { useState } from 'react';

export function useActorBootstrapStatus() {
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();
  const identityPrincipal = identity?.getPrincipal().toString();
  const [isRetrying, setIsRetrying] = useState(false);

  // Get the actor query state from cache using the canonical key
  const actorQueryKey = getActorQueryKey(identityPrincipal);
  const actorQueryState = queryClient.getQueryState(actorQueryKey);

  const isLoading = actorQueryState?.status === 'pending' || isRetrying;
  const isError = actorQueryState?.status === 'error' && !isRetrying;
  const error = actorQueryState?.error as Error | undefined;

  const retry = async () => {
    setIsRetrying(true);
    
    try {
      // Cancel any in-flight queries for this actor
      await queryClient.cancelQueries({ queryKey: actorQueryKey });
      
      // Remove the cached actor query to force fresh initialization
      queryClient.removeQueries({ queryKey: actorQueryKey });
      
      // Refetch the actor query (this will trigger a fresh initialization)
      await queryClient.refetchQueries({ 
        queryKey: actorQueryKey,
        type: 'active'
      });
      
      // Also invalidate dependent queries (like profile) after successful retry
      queryClient.invalidateQueries({
        predicate: (query) => {
          return !query.queryKey.some(key => key === 'actor');
        },
      });
    } finally {
      setIsRetrying(false);
    }
  };

  return {
    isLoading,
    isError,
    error,
    retry,
    isRetrying,
  };
}
