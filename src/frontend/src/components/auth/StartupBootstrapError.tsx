/**
 * Startup bootstrap error screen with retry functionality
 * Displayed when actor initialization fails during app startup
 */

import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface StartupBootstrapErrorProps {
  error: Error;
  onRetry: () => void;
  isRetrying: boolean;
}

export default function StartupBootstrapError({ error, onRetry, isRetrying }: StartupBootstrapErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <CardTitle>Failed to Initialize</CardTitle>
              <CardDescription>Unable to connect to the application</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription className="text-sm">
              {error.message || 'An unexpected error occurred during startup.'}
            </AlertDescription>
          </Alert>

          <div className="text-sm text-muted-foreground space-y-2">
            <p className="font-medium">What you can try:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Check your internet connection</li>
              <li>Verify the application is running</li>
              <li>Try refreshing the page</li>
              <li>Clear your browser cache</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={onRetry} disabled={isRetrying} className="w-full" size="lg">
            {isRetrying ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry Connection
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
