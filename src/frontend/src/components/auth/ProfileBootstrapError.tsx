/**
 * Profile bootstrap error component for inline display (non-blocking)
 * Shows clear error message with retry action without blocking the entire app
 */

import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ProfileBootstrapErrorProps {
  error: Error;
  onRetry: () => void;
}

export default function ProfileBootstrapError({ error, onRetry }: ProfileBootstrapErrorProps) {
  return (
    <Card className="border-2 border-destructive/50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <CardTitle>Profile Load Failed</CardTitle>
            <CardDescription>Unable to load your profile information</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription className="text-sm">
            We couldn't retrieve your profile. This might be a temporary network issue.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">What you can try:</p>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            <li>Click the Retry button below</li>
            <li>Check your internet connection</li>
            <li>Refresh the page</li>
          </ul>
        </div>

        <Button onClick={onRetry} className="w-full" size="lg">
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>

        {/* Technical details in expandable section */}
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer hover:text-foreground">Technical details</summary>
          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">{error.message}</pre>
        </details>
      </CardContent>
    </Card>
  );
}
