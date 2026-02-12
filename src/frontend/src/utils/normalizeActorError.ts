/**
 * Utility to extract and normalize error details from actor calls.
 * Preserves raw payload for logs while returning a user-safe message.
 */

export interface NormalizedError {
  userMessage: string;
  rawError: any;
  errorType: 'actor-unavailable' | 'already-onboarded' | 'unauthorized' | 'activation-required' | 'generic';
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

  // Vehicle registration activation errors
  if (
    context === 'registerVehicle' &&
    (errorMessage.includes('Vehicle registration blocked') || 
     errorMessage.includes('not activated') ||
     errorMessage.includes('Account not activated'))
  ) {
    return {
      userMessage: 'Vehicle registration requires activation. Please complete activation with an admin-provided token before registering vehicles.',
      rawError,
      errorType: 'activation-required',
    };
  }

  // Unauthorized / Permission errors
  if (
    errorMessage.includes('Unauthorized') ||
    errorMessage.includes('Only admins') ||
    errorMessage.includes('Permission denied') ||
    errorMessage.includes('Only users can')
  ) {
    // Special handling for onboarding context
    if (context === 'completeOnboarding') {
      // For onboarding, show the actual backend error without the "contact admin" message
      // Remove technical prefixes like "Unauthorized:" or "Call failed:" for cleaner display
      let cleanMessage = errorMessage
        .replace(/^(Unauthorized|Call failed|Error):\s*/i, '')
        .trim();

      // If the message is about anonymous users, make it more user-friendly
      if (cleanMessage.includes('Anonymous users cannot complete onboarding')) {
        cleanMessage = 'You must be logged in to complete registration. Please sign in and try again.';
      }

      return {
        userMessage: cleanMessage || 'Registration failed. Please try again.',
        rawError,
        errorType: 'unauthorized',
      };
    }

    // For other contexts, show the generic admin contact message
    return {
      userMessage:
        'Authorization failed. Your account may not have the required permissions. Please contact an admin for assistance.',
      rawError,
      errorType: 'unauthorized',
    };
  }

  // Generic error
  return {
    userMessage: `Operation failed: ${errorMessage}`,
    rawError,
    errorType: 'generic',
  };
}
