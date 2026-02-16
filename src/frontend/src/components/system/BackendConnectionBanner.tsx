/**
 * Non-blocking, dismissible banner that shows backend connectivity status
 * Provides Retry action and optional technical details without blocking the app
 */

import { AlertCircle, RefreshCw, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { classifyBootstrapError } from '../../utils/bootstrapError';
import { useBackendHealth } from '../../hooks/useBackendHealth';

interface BackendConnectionBannerProps {
  error: Error | null;
  onRetry: () => void;
  isRetrying: boolean;
  onDismiss?: () => void;
}

export default function BackendConnectionBanner({
  error,
  onRetry,
  isRetrying,
  onDismiss,
}: BackendConnectionBannerProps) {
  const [showDetails, setShowDetails] = useState(false);
  const { isLoading: healthLoading, isReachable, build } = useBackendHealth();

  if (!error) return null;

  const healthHint = healthLoading ? undefined : { isReachable };
  const classification = classifyBootstrapError(error, healthHint);

  return (
    <div className="fixed top-16 left-0 right-0 z-40 px-4 py-2 bg-background/95 backdrop-blur-sm border-b border-destructive/50 shadow-lg">
      <div className="container mx-auto max-w-4xl">
        <Alert variant="destructive" className="border-0 bg-transparent p-0">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <AlertTitle className="text-sm font-semibold mb-1">
                Connection Unavailable
              </AlertTitle>
              <AlertDescription className="text-xs">
                {classification.message}
              </AlertDescription>

              {/* Backend status inline */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs">Status:</span>
                {healthLoading ? (
                  <Badge variant="outline" className="text-xs">Checking...</Badge>
                ) : isReachable ? (
                  <Badge variant="default" className="bg-green-500 text-xs">Reachable</Badge>
                ) : (
                  <Badge variant="destructive" className="text-xs">Unreachable</Badge>
                )}
              </div>

              {/* Expandable technical details */}
              {showDetails && (
                <div className="mt-3 space-y-2">
                  <div className="text-xs p-2 bg-muted rounded-md font-mono break-all max-h-24 overflow-y-auto">
                    {classification.technicalDetails}
                  </div>
                  {build && isReachable && (
                    <p className="text-xs text-muted-foreground">Backend version: {build}</p>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={onRetry}
                disabled={isRetrying}
                className="h-8 text-xs"
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${isRetrying ? 'animate-spin' : ''}`} />
                {isRetrying ? 'Retrying...' : 'Retry'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowDetails(!showDetails)}
                className="h-8 w-8 p-0"
              >
                {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              {onDismiss && (
                <Button size="sm" variant="ghost" onClick={onDismiss} className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </Alert>
      </div>
    </div>
  );
}
