/**
 * Utility to extract and normalize error details from actor calls.
 * Preserves raw payload for logs while returning a user-safe message.
 */

export interface NormalizedError {
  userMessage: string;
  rawError: any;
  errorType: 'actor-unavailable' | 'already-onboarded' | 'unauthorized' | 'generic';
}

export function normalizeActorError(error: any, context?: string): NormalizedError {
  const rawError = error;
  const errorMessage = error?.message || String(error);

  // Actor not available
  if (!error || errorMessage.includes('Actor not available')) {
    return {
      userMessage: 'Unable to connect to the backend. Please refresh the page and try again.',
      rawError,
      errorType: 'actor-unavailable',
    };
  }

  // Already onboarded
  if (errorMessage.includes('Already onboarded')) {
    return {
      userMessage: 'You have already completed onboarding. Please refresh the page.',
      rawError,
      errorType: 'already-onboarded',
    };
  }

  // Unauthorized / Permission errors
  if (
    errorMessage.includes('Unauthorized') ||
    errorMessage.includes('Only admins') ||
    errorMessage.includes('Permission denied') ||
    errorMessage.includes('Only users can')
  ) {
    return {
      userMessage:
        'Authorization failed. Your account may not have the required permissions. Please contact an admin for assistance.',
      rawError,
      errorType: 'unauthorized',
    };
  }

  // Generic error
  return {
    userMessage: `Registration failed: ${errorMessage}`,
    rawError,
    errorType: 'generic',
  };
}
