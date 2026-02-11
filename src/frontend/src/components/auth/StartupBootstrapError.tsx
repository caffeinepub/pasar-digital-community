/**
 * Startup bootstrap error screen with STOPPED-canister detection and retry functionality
 * Displays when actor initialization fails during app startup with English-only messaging
 */

import { AlertCircle, RefreshCw, Copy, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useState } from 'react';
import { toast } from 'sonner';
import { classifyBootstrapError, formatErrorForClipboard } from '../../utils/bootstrapError';
import AppLogo from '../brand/AppLogo';

interface StartupBootstrapErrorProps {
  error: Error;
  onRetry: () => void;
  isRetrying: boolean;
  autoRetryStatus?: {
    attempt: number;
    maxAttempts: number;
    nextRetryIn?: number;
  };
}

export default function StartupBootstrapError({ error, onRetry, isRetrying, autoRetryStatus }: StartupBootstrapErrorProps) {
  const [copied, setCopied] = useState(false);
  const classification = classifyBootstrapError(error);

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

  // Show auto-retry status if currently retrying
  if (autoRetryStatus) {
    const secondsRemaining = autoRetryStatus.nextRetryIn ? Math.ceil(autoRetryStatus.nextRetryIn / 1000) : 0;
    
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

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <RefreshCw className="h-6 w-6 text-primary animate-spin" />
                </div>
                <div>
                  <CardTitle>Retrying Connection</CardTitle>
                  <CardDescription>
                    Attempt {autoRetryStatus.attempt} of {autoRetryStatus.maxAttempts}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Next retry in {secondsRemaining} second{secondsRemaining !== 1 ? 's' : ''}...
                </p>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-primary h-full transition-all duration-100"
                    style={{ 
                      width: `${((autoRetryStatus.maxAttempts - autoRetryStatus.attempt) / autoRetryStatus.maxAttempts) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
                <CardTitle>Failed to Initialize</CardTitle>
                <CardDescription>Unable to connect to the application</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>
                {classification.type === 'canister-stopped' ? 'Backend Canister Stopped' : 'Connection Error'}
              </AlertTitle>
              <AlertDescription className="text-sm">
                {classification.message}
              </AlertDescription>
            </Alert>

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
            <Button onClick={onRetry} disabled={isRetrying} className="flex-1" size="lg">
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
            <Button onClick={handleCopyError} variant="outline" size="lg" className="flex-shrink-0">
              {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
