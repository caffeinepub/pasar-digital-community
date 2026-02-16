/**
 * Utility to extract and normalize error details from actor calls
 * User-facing messages avoid "canister stopped" wording
 */

export interface NormalizedActorError {
  message: string;
  technicalDetails?: string;
}

/**
 * Normalizes actor call errors into user-friendly messages
 * Avoids "canister stopped" wording in user-facing messages
 */
export function normalizeActorError(error: unknown, context?: string): NormalizedActorError {
  let message = 'An unexpected error occurred';
  let technicalDetails: string | undefined;

  if (error instanceof Error) {
    technicalDetails = error.message;

    // Check for specific error patterns
    const errorMsg = error.message.toLowerCase();

    // Service unavailable (avoid "canister stopped" wording)
    if (
      errorMsg.includes('ic0508') ||
      (errorMsg.includes('canister') && errorMsg.includes('stopped')) ||
      errorMsg.includes('service unavailable')
    ) {
      message = 'The service is temporarily unavailable. Please try again later.';
    }
    // Vehicle registration activation errors
    else if (context === 'vehicle-registration' && errorMsg.includes('blocked')) {
      message = 'Vehicle registration requires activation. Please activate your account first.';
    }
    // Revoke ownership errors
    else if (context === 'revoke-ownership') {
      if (errorMsg.includes('vehicle not found')) {
        message = 'Vehicle not found. It may have already been removed.';
      } else if (errorMsg.includes('unauthorized') || errorMsg.includes('only the owner')) {
        message = 'You are not authorized to revoke ownership of this vehicle.';
      } else if (errorMsg.includes('no pin set') || errorMsg.includes('please set up a pin')) {
        message = 'No PIN set. Please set up a PIN in Security Settings before revoking ownership.';
      } else if (errorMsg.includes('incorrect pin')) {
        message = 'Incorrect PIN. Please try again.';
      } else {
        message = error.message.length < 200 ? error.message : 'Failed to revoke ownership. Please try again.';
      }
    }
    // Onboarding errors
    else if (context === 'onboarding') {
      if (errorMsg.includes('already onboarded')) {
        message = 'You have already completed onboarding.';
      } else if (errorMsg.includes('unauthorized')) {
        message = 'You are not authorized to complete onboarding.';
      } else {
        message = 'Failed to complete onboarding. Please try again.';
      }
    }
    // Authorization errors
    else if (errorMsg.includes('unauthorized') || errorMsg.includes('permission')) {
      message = 'You do not have permission to perform this action.';
    }
    // Network errors
    else if (errorMsg.includes('network') || errorMsg.includes('fetch') || errorMsg.includes('timeout')) {
      message = 'Network error. Please check your connection and try again.';
    }
    // Generic error with message
    else if (error.message && error.message.length < 200) {
      message = error.message;
    }
  } else if (typeof error === 'string') {
    technicalDetails = error;
    if (error.length < 200) {
      message = error;
    }
  }

  return {
    message,
    technicalDetails,
  };
}
