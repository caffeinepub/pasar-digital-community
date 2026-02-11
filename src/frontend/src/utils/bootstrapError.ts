/**
 * Utilities for handling and formatting bootstrap errors with STOPPED-canister detection
 */

export type BootstrapErrorType = 'canister-stopped' | 'network' | 'auth' | 'unknown';

export interface BootstrapErrorClassification {
  type: BootstrapErrorType;
  message: string;
  technicalDetails: string;
  guidance: string[];
}

export interface BackendHealthHint {
  isReachable: boolean;
}

/**
 * Detects if an error is a canister-stopped error using generic replica rejection patterns
 * Does NOT rely on any specific canister principal text
 */
function isCanisterStoppedError(errorMessage: string): boolean {
  const lowerMessage = errorMessage.toLowerCase();
  
  // Check for IC0508 error code (canister stopped)
  const hasIC0508 = lowerMessage.includes('ic0508');
  
  // Check for reject code 5 (canister error)
  const hasRejectCode5 = 
    lowerMessage.includes('reject_code": 5') || 
    lowerMessage.includes('reject_code: 5') ||
    lowerMessage.includes('reject code 5');
  
  // Check for non_replicated_rejection
  const hasNonReplicatedRejection = lowerMessage.includes('non_replicated_rejection');
  
  // Check for "canister" and "stopped" appearing together
  const hasCanisterAndStopped = lowerMessage.includes('canister') && lowerMessage.includes('stopped');
  
  // Check for "is stopped" pattern
  const hasIsStoppedPattern = lowerMessage.includes('is stopped');
  
  // Classify as stopped if:
  // 1. IC0508 is present (definitive stopped error code), OR
  // 2. Reject code 5 AND canister+stopped co-occur, OR
  // 3. Non-replicated rejection AND canister+stopped co-occur, OR
  // 4. "is stopped" pattern appears with canister context
  return hasIC0508 || 
         (hasRejectCode5 && hasCanisterAndStopped) ||
         (hasNonReplicatedRejection && hasCanisterAndStopped) ||
         (hasIsStoppedPattern && lowerMessage.includes('canister'));
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
    return JSON.stringify(error, null, 2);
  } catch {
    return String(error);
  }
}

/**
 * Shared STOPPED-canister guidance steps (English only)
 */
const STOPPED_CANISTER_GUIDANCE = [
  'The backend canister must be restarted by running "Build & Deploy" in Caffeine',
  'Wait for the deployment to complete successfully',
  'Then click "Retry" below or refresh this page',
];

/**
 * Classifies a bootstrap error and returns appropriate messaging with guidance
 * Optionally accepts a backend health hint to avoid misclassifying errors when backend is reachable
 */
export function classifyBootstrapError(
  error: unknown, 
  healthHint?: BackendHealthHint
): BootstrapErrorClassification {
  const technicalDetails = extractTechnicalError(error);

  // If backend is reachable, don't classify as canister-stopped
  const shouldCheckStopped = !healthHint || !healthHint.isReachable;
  
  if (shouldCheckStopped && isCanisterStoppedError(technicalDetails)) {
    return {
      type: 'canister-stopped',
      message: 'The backend canister is currently stopped and cannot process requests.',
      technicalDetails,
      guidance: STOPPED_CANISTER_GUIDANCE,
    };
  }

  if (
    technicalDetails.toLowerCase().includes('network') ||
    technicalDetails.toLowerCase().includes('fetch') ||
    technicalDetails.toLowerCase().includes('timeout')
  ) {
    return {
      type: 'network',
      message: 'A network error occurred while connecting to the application.',
      technicalDetails,
      guidance: [
        'Check your internet connection',
        'Verify the application is running',
        'Try refreshing the page',
        'Clear your browser cache if the problem persists',
      ],
    };
  }

  if (
    technicalDetails.toLowerCase().includes('auth') ||
    technicalDetails.toLowerCase().includes('identity') ||
    technicalDetails.toLowerCase().includes('unauthorized')
  ) {
    return {
      type: 'auth',
      message: 'An authentication error occurred.',
      technicalDetails,
      guidance: [
        'Try logging out and logging in again',
        'Clear your browser cache',
        'Verify your Internet Identity is working',
      ],
    };
  }

  return {
    type: 'unknown',
    message: 'An unexpected error occurred while connecting to the application.',
    technicalDetails,
    guidance: [
      'Check your internet connection',
      'Try refreshing the page',
      'Clear your browser cache',
      'If the problem persists, contact support',
    ],
  };
}

/**
 * Formats error details for clipboard copy with structured information
 */
export function formatErrorForClipboard(error: unknown): string {
  const classification = classifyBootstrapError(error);
  const timestamp = new Date().toISOString();
  const url = window.location.href;
  const userAgent = navigator.userAgent;

  return `Pasar Digital Community - Error Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Timestamp: ${timestamp}
URL: ${url}
User Agent: ${userAgent}

Error Type: ${classification.type}
Message: ${classification.message}

Technical Details:
${classification.technicalDetails}

Recommended Actions:
${classification.guidance.map((step, i) => `${i + 1}. ${step}`).join('\n')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
}
