/**
 * Utilities for handling and formatting bootstrap errors
 */

export type BootstrapErrorType = 'canister-stopped' | 'network' | 'auth' | 'unknown';

export interface BootstrapErrorClassification {
  type: BootstrapErrorType;
  message: string;
  technicalDetails: string;
}

/**
 * Detects if an error is a canister-stopped error
 */
function isCanisterStoppedError(errorMessage: string): boolean {
  const patterns = [
    'is stopped',
    'IC0508',
    'CallContextManager',
    'canister is stopped',
    'does not have a CallContextManager',
  ];

  const lowerMessage = errorMessage.toLowerCase();
  return patterns.some((pattern) => lowerMessage.includes(pattern.toLowerCase()));
}

/**
 * Extracts a stable, displayable technical error string from unknown error inputs
 */
export function extractTechnicalError(error: unknown): string {
  if (!error) return 'No error details available';

  if (error instanceof Error) {
    return error.message || error.toString();
  }

  if (typeof error === 'string') {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

/**
 * Classifies a bootstrap error and returns appropriate messaging
 */
export function classifyBootstrapError(error: unknown): BootstrapErrorClassification {
  const technicalDetails = extractTechnicalError(error);

  if (isCanisterStoppedError(technicalDetails)) {
    return {
      type: 'canister-stopped',
      message:
        'The backend canister is currently stopped and cannot process requests. The application cannot load until the canister is restarted.',
      technicalDetails,
    };
  }

  if (
    technicalDetails.toLowerCase().includes('network') ||
    technicalDetails.toLowerCase().includes('fetch') ||
    technicalDetails.toLowerCase().includes('timeout')
  ) {
    return {
      type: 'network',
      message: 'A network error occurred while loading your profile. Please check your connection and try again.',
      technicalDetails,
    };
  }

  if (
    technicalDetails.toLowerCase().includes('auth') ||
    technicalDetails.toLowerCase().includes('identity') ||
    technicalDetails.toLowerCase().includes('unauthorized')
  ) {
    return {
      type: 'auth',
      message: 'An authentication error occurred. Please try logging out and logging in again.',
      technicalDetails,
    };
  }

  return {
    type: 'unknown',
    message: 'An unexpected error occurred while loading your profile.',
    technicalDetails,
  };
}

/**
 * Formats error details for clipboard copy
 */
export function formatErrorForClipboard(error: unknown): string {
  const technicalDetails = extractTechnicalError(error);
  const timestamp = new Date().toISOString();
  const url = window.location.href;

  return `Error Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Timestamp: ${timestamp}
URL: ${url}

Error Details:
${technicalDetails}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
}
