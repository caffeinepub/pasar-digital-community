/**
 * Hook to monitor actor bootstrap status with continuous retry for service-unavailable errors
 * Implements exponential backoff with bounded retries for normal errors, but continuous retry for stopped canisters
 * Integrates backend health check to avoid misclassifying reachable backend errors as service-unavailable
 */

import { useQueryClient } from '@tanstack/react-query';
import { useInternetIdentity } from './useInternetIdentity';
import { getActorQueryKey } from '../utils/actorQueryKey';
import { useState, useEffect, useRef } from 'react';
import { classifyBootstrapError } from '../utils/bootstrapError';
import { useBackendHealth } from './useBackendHealth';

const MAX_AUTO_RETRY_ATTEMPTS = 3;
const RETRY_DELAYS = [2000, 5000, 10000]; // 2s, 5s, 10s
const CONTINUOUS_RETRY_DELAY = 15000; // 15s for continuous retries after max attempts

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
    isContinuous?: boolean;
  };
  cancelContinuousRetry?: () => void;
}

export function useActorBootstrapStatus(): ActorBootstrapStatus {
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();
  const identityPrincipal = identity?.getPrincipal().toString();
  const { isLoading: healthLoading, isReachable } = useBackendHealth();

  const [isManualRetrying, setIsManualRetrying] = useState(false);
  const [autoRetryAttempt, setAutoRetryAttempt] = useState(0);
  const [nextRetryIn, setNextRetryIn] = useState<number | undefined>(undefined);
  const [isContinuousMode, setIsContinuousMode] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
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

  // Auto-retry logic with continuous mode for service-unavailable errors
  useEffect(() => {
    if (!isError || !error || isCancelled || healthLoading) {
      return;
    }

    // Classify the error with backend health hint to avoid false positives
    const healthHint = { isReachable };
    const classification = classifyBootstrapError(error, healthHint);
    const isServiceUnavailable = classification.type === 'service-unavailable';

    // If backend is reachable, don't enter continuous retry mode
    // This prevents users from being trapped when the backend is actually working
    if (isReachable && autoRetryAttempt >= MAX_AUTO_RETRY_ATTEMPTS) {
      // Backend is reachable but we've exhausted retries - stop auto-retry
      return;
    }

    // Determine if we should continue retrying
    const shouldContinueRetrying =
      autoRetryAttempt < MAX_AUTO_RETRY_ATTEMPTS ||
      (isServiceUnavailable && !isReachable && autoRetryAttempt >= MAX_AUTO_RETRY_ATTEMPTS);

    if (!shouldContinueRetrying) {
      return;
    }

    // Determine delay and mode
    let delay: number;
    let continuous = false;

    if (autoRetryAttempt < MAX_AUTO_RETRY_ATTEMPTS) {
      // Bounded retry phase
      delay = RETRY_DELAYS[autoRetryAttempt] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
      continuous = false;
    } else {
      // Continuous retry phase (only for service-unavailable with unreachable backend)
      delay = CONTINUOUS_RETRY_DELAY;
      continuous = true;
    }

    setIsContinuousMode(continuous);
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
      setAutoRetryAttempt((prev) => prev + 1);

      try {
        await queryClient.cancelQueries({ queryKey: actorQueryKey });
        queryClient.removeQueries({ queryKey: actorQueryKey });
        await queryClient.refetchQueries({
          queryKey: actorQueryKey,
          type: 'active',
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
  }, [isError, error, autoRetryAttempt, actorQueryKey, queryClient, isCancelled, healthLoading, isReachable]);

  // Reset auto-retry counter when error clears
  useEffect(() => {
    if (!isError) {
      setAutoRetryAttempt(0);
      setNextRetryIn(undefined);
      setIsContinuousMode(false);
      setIsCancelled(false);
    }
  }, [isError]);

  // Manual retry function (resets auto-retry counter)
  const retry = async () => {
    setIsManualRetrying(true);
    setAutoRetryAttempt(0); // Reset auto-retry counter
    setNextRetryIn(undefined);
    setIsContinuousMode(false);
    setIsCancelled(false);

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
        type: 'active',
      });

      // Invalidate dependent queries after successful retry
      queryClient.invalidateQueries({
        predicate: (query) => {
          return !query.queryKey.some((key) => key === 'actor');
        },
      });
    } finally {
      setIsManualRetrying(false);
    }
  };

  // Cancel continuous retry function
  const cancelContinuousRetry = () => {
    setIsCancelled(true);
    setIsContinuousMode(false);
    setNextRetryIn(undefined);

    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  };

  // Determine if we should show auto-retry status
  const shouldShowAutoRetry = autoRetryAttempt > 0 && !isCancelled;

  const autoRetryStatus = shouldShowAutoRetry
    ? {
        attempt: autoRetryAttempt,
        maxAttempts: isContinuousMode ? Infinity : MAX_AUTO_RETRY_ATTEMPTS,
        nextRetryIn: nextRetryIn,
        isContinuous: isContinuousMode,
      }
    : undefined;

  return {
    isLoading,
    isError: isError && !shouldShowAutoRetry,
    error,
    retry,
    isRetrying: isManualRetrying,
    autoRetryStatus,
    cancelContinuousRetry: isContinuousMode ? cancelContinuousRetry : undefined,
  };
}
