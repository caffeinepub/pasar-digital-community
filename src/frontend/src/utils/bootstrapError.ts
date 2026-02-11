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

/**
 * Detects if an error is a canister-stopped error
 * Matches various replica rejection patterns including IC0508, "is stopped", etc.
 */
function isCanisterStoppedError(errorMessage: string): boolean {
  const lowerMessage = errorMessage.toLowerCase();
  
  // Primary indicators
  const primaryPatterns = [
    'is stopped',
    'canister is stopped',
    'canister rmc52-maaaa-aaaab-aendq-cai is stopped',
  ];
  
  // Secondary indicators (error codes, rejection types)
  const secondaryPatterns = [
    'ic0508',
    'non_replicated_rejection',
    'reject_code": 5',
    'reject_code: 5',
  ];
  
  // Check if message contains primary pattern
  const hasPrimary = primaryPatterns.some(pattern => lowerMessage.includes(pattern));
  
  // Check if message contains secondary pattern
  const hasSecondary = secondaryPatterns.some(pattern => lowerMessage.includes(pattern));
  
  // Also check for "canister" + "stopped" appearing together
  const hasCanisterAndStopped = lowerMessage.includes('canister') && lowerMessage.includes('stopped');
  
  return hasPrimary || (hasSecondary && hasCanisterAndStopped);
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
 */
export function classifyBootstrapError(error: unknown): BootstrapErrorClassification {
  const technicalDetails = extractTechnicalError(error);

  if (isCanisterStoppedError(technicalDetails)) {
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
