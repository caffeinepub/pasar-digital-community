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
    // Revoke ownership errors - improved detection
    else if (context === 'revoke-ownership') {
      if (errorMsg.includes('vehicle not found')) {
        message = 'Vehicle not found. Please check the vehicle ID and try again.';
      } else if (errorMsg.includes('unauthorized') || errorMsg.includes('only the owner')) {
        message = 'Unauthorized: Only the owner can revoke their vehicle ownership. Please ensure you are the registered owner of this vehicle.';
      } else if (errorMsg.includes('no pin set') || errorMsg.includes('please set up a pin')) {
        message = 'No PIN set. Please set up a PIN to revoke vehicle ownership. If you have already set up a PIN, please ensure you are using the correct one.';
      } else if (errorMsg.includes('pin verification failed') || errorMsg.includes('incorrect') || errorMsg.includes('check your pin')) {
        message = 'PIN verification failed. Please check your PIN and try again. If this is your first time here, you must set a PIN to manage vehicle ownership and only the original vehicle owner is eligible to revoke!';
      } else if (errorMsg.includes('trap') || errorMsg.includes('reject')) {
        // Extract the actual trap message if available
        const trapMatch = error.message.match(/trap[:\s]+(.+?)(?:\n|$)/i);
        if (trapMatch && trapMatch[1]) {
          message = trapMatch[1].trim();
        } else {
          message = 'Failed to revoke ownership. Please verify your PIN and try again.';
        }
      } else {
        // Use the original message if it's reasonably short and clear
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
