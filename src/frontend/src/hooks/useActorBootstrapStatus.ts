/**
 * Hook to monitor actor bootstrap status with bounded auto-retry and manual retry
 * Implements exponential backoff with max 3 attempts before showing stable error screen
 */

import { useQueryClient } from '@tanstack/react-query';
import { useInternetIdentity } from './useInternetIdentity';
import { getActorQueryKey } from '../utils/actorQueryKey';
import { useState, useEffect, useRef } from 'react';

const MAX_AUTO_RETRY_ATTEMPTS = 3;
const RETRY_DELAYS = [2000, 5000, 10000]; // 2s, 5s, 10s

export interface ActorBootstrapStatus {
  isLoading: boolean;
  isError: boolean;
  error: Error | undefined;
  retry: () => Promise<void>;
  isRetrying: boolean;
  autoRetryStatus?: {
    attempt: number;
    maxAttempts: number;
    nextRetryIn?: number;
  };
}

export function useActorBootstrapStatus(): ActorBootstrapStatus {
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();
  const identityPrincipal = identity?.getPrincipal().toString();
  
  const [isManualRetrying, setIsManualRetrying] = useState(false);
  const [autoRetryAttempt, setAutoRetryAttempt] = useState(0);
  const [nextRetryIn, setNextRetryIn] = useState<number | undefined>(undefined);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get the actor query state from cache using the canonical key
  const actorQueryKey = getActorQueryKey(identityPrincipal);
  const actorQueryState = queryClient.getQueryState(actorQueryKey);

  const isLoading = actorQueryState?.status === 'pending' || isManualRetrying;
  const isError = actorQueryState?.status === 'error' && !isManualRetrying;
  const error = actorQueryState?.error as Error | undefined;

  // Clear any pending retries on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  // Auto-retry logic with bounded attempts
  useEffect(() => {
    if (!isError || !error || autoRetryAttempt >= MAX_AUTO_RETRY_ATTEMPTS) {
      return;
    }

    const delay = RETRY_DELAYS[autoRetryAttempt] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
    setNextRetryIn(delay);

    // Countdown timer
    const startTime = Date.now();
    countdownIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, delay - elapsed);
      setNextRetryIn(remaining);
      
      if (remaining === 0 && countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    }, 100);

    // Schedule retry
    retryTimeoutRef.current = setTimeout(async () => {
      setAutoRetryAttempt(prev => prev + 1);
      
      try {
        await queryClient.cancelQueries({ queryKey: actorQueryKey });
        queryClient.removeQueries({ queryKey: actorQueryKey });
        await queryClient.refetchQueries({ 
          queryKey: actorQueryKey,
          type: 'active'
        });
      } catch (err) {
        console.error('Auto-retry failed:', err);
      }
    }, delay);

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, [isError, error, autoRetryAttempt, actorQueryKey, queryClient]);

  // Reset auto-retry counter when error clears
  useEffect(() => {
    if (!isError) {
      setAutoRetryAttempt(0);
      setNextRetryIn(undefined);
    }
  }, [isError]);

  // Manual retry function (resets auto-retry counter)
  const retry = async () => {
    setIsManualRetrying(true);
    setAutoRetryAttempt(0); // Reset auto-retry counter
    setNextRetryIn(undefined);
    
    // Clear any pending auto-retries
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    
    try {
      await queryClient.cancelQueries({ queryKey: actorQueryKey });
      queryClient.removeQueries({ queryKey: actorQueryKey });
      await queryClient.refetchQueries({ 
        queryKey: actorQueryKey,
        type: 'active'
      });
      
      // Invalidate dependent queries after successful retry
      queryClient.invalidateQueries({
        predicate: (query) => {
          return !query.queryKey.some(key => key === 'actor');
        },
      });
    } finally {
      setIsManualRetrying(false);
    }
  };

  const autoRetryStatus = (autoRetryAttempt > 0 && autoRetryAttempt < MAX_AUTO_RETRY_ATTEMPTS) ? {
    attempt: autoRetryAttempt,
    maxAttempts: MAX_AUTO_RETRY_ATTEMPTS,
    nextRetryIn: nextRetryIn,
  } : undefined;

  return {
    isLoading,
    isError: isError && autoRetryAttempt >= MAX_AUTO_RETRY_ATTEMPTS,
    error,
    retry,
    isRetrying: isManualRetrying,
    autoRetryStatus,
  };
}
