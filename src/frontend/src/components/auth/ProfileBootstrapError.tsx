/**
 * Profile bootstrap error screen with STOPPED-canister detection, backend health diagnostics, and English-only messaging
 * Displayed when profile fetch fails for authenticated users
 */

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, RefreshCw, Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import AppLogo from '../brand/AppLogo';
import { classifyBootstrapError, formatErrorForClipboard } from '../../utils/bootstrapError';
import { useBackendHealth } from '../../hooks/useBackendHealth';

interface ProfileBootstrapErrorProps {
  error: Error | null;
  onRetry: () => void;
}

export default function ProfileBootstrapError({ error, onRetry }: ProfileBootstrapErrorProps) {
  const [copied, setCopied] = useState(false);
  const { isLoading: healthLoading, isReachable, build } = useBackendHealth();
  
  const healthHint = healthLoading ? undefined : { isReachable };
  const classification = classifyBootstrapError(error, healthHint);

  const handleCopyError = async () => {
    try {
      const formattedError = formatErrorForClipboard(error);
      await navigator.clipboard.writeText(formattedError);
      setCopied(true);
      toast.success('Error details copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy error details');
      console.error('Copy failed:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-accent/5 to-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <AppLogo size="large" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Pasar Digital Community</h1>
          </div>
        </div>

        <Card className="border-2 border-destructive/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-destructive/10">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <CardTitle>Failed to Load Profile</CardTitle>
                <CardDescription>Unable to retrieve your user profile</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>
                {classification.type === 'canister-stopped' ? 'Backend Canister Stopped' : 'Profile Error'}
              </AlertTitle>
              <AlertDescription className="text-sm">
                {classification.message}
              </AlertDescription>
            </Alert>

            {/* Backend health status */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
              <span className="text-sm font-medium">Backend status:</span>
              {healthLoading ? (
                <Badge variant="outline">Checking...</Badge>
              ) : isReachable ? (
                <Badge variant="default" className="bg-green-500">Reachable</Badge>
              ) : (
                <Badge variant="destructive">Unreachable</Badge>
              )}
            </div>

            {build && isReachable && (
              <p className="text-xs text-center text-muted-foreground">
                Backend version: {build}
              </p>
            )}

            <div className="text-sm space-y-2">
              <p className="font-medium text-foreground">
                {classification.type === 'canister-stopped' ? 'Required actions:' : 'What you can try:'}
              </p>
              <ol className={`${classification.type === 'canister-stopped' ? 'list-decimal' : 'list-disc'} list-inside space-y-1 ml-2 text-muted-foreground`}>
                {classification.guidance.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>

            {!isReachable && classification.type === 'canister-stopped' && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  The backend is currently unreachable. This confirms the canister is stopped.
                </AlertDescription>
              </Alert>
            )}

            {isReachable && classification.type !== 'canister-stopped' && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  The backend is reachable but profile loading failed. This may be a temporary issue or a permissions problem.
                </AlertDescription>
              </Alert>
            )}

            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground font-medium">
                Technical details
              </summary>
              <div className="mt-2 p-3 bg-muted rounded-md font-mono text-xs break-all max-h-32 overflow-y-auto">
                {classification.technicalDetails}
              </div>
            </details>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button onClick={onRetry} className="flex-1" size="lg">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
            <Button onClick={handleCopyError} variant="outline" size="lg" className="flex-shrink-0">
              {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
