/**
 * Top-level error fallback UI for unexpected initialization/render errors
 * Displays English-only user-facing text with a reload action
 */

import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function TopLevelErrorFallback() {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-md border-destructive/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <CardTitle>Application Error</CardTitle>
              <CardDescription>Something went wrong</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The application encountered an unexpected error and could not continue. Please reload the page to try again.
          </p>
          <div className="text-sm text-muted-foreground space-y-2">
            <p className="font-medium">If the problem persists:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Clear your browser cache and cookies</li>
              <li>Try using a different browser</li>
              <li>Check your internet connection</li>
              <li>Contact support if the issue continues</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleReload} className="w-full" size="lg" variant="default">
            Reload app
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
