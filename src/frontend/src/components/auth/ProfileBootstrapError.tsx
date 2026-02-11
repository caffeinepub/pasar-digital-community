import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw, Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import AppLogo from '../brand/AppLogo';
import { classifyBootstrapError, formatErrorForClipboard } from '../../utils/bootstrapError';

interface ProfileBootstrapErrorProps {
  error: Error | null;
  onRetry: () => void;
}

export default function ProfileBootstrapError({ error, onRetry }: ProfileBootstrapErrorProps) {
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

  const renderNextSteps = () => {
    switch (classification.type) {
      case 'canister-stopped':
        return (
          <div className="space-y-2 text-sm">
            <p className="font-medium text-foreground">Next steps:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2 text-muted-foreground">
              <li>Run "Build & Deploy" in Caffeine to restart the canister</li>
              <li>Wait for the deployment to complete</li>
              <li>Refresh this page or click "Retry" below</li>
            </ol>
          </div>
        );
      case 'network':
        return (
          <div className="space-y-2 text-sm">
            <p className="font-medium text-foreground">Possible causes:</p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-muted-foreground">
              <li>Unstable internet connection</li>
              <li>Network timeout</li>
              <li>Server temporarily unavailable</li>
            </ul>
          </div>
        );
      case 'auth':
        return (
          <div className="space-y-2 text-sm">
            <p className="font-medium text-foreground">Possible causes:</p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-muted-foreground">
              <li>Authentication session expired</li>
              <li>Identity verification failed</li>
              <li>Authorization error</li>
            </ul>
          </div>
        );
      default:
        return (
          <div className="space-y-2 text-sm">
            <p className="font-medium text-foreground">Possible causes:</p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-muted-foreground">
              <li>Temporary server issue</li>
              <li>Network connectivity problem</li>
              <li>Authentication session issue</li>
            </ul>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/5 to-background p-4">
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
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-xl">Failed to Load Profile</CardTitle>
            </div>
            <CardDescription>{classification.message}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Technical details</AlertTitle>
              <AlertDescription className="mt-2 text-xs font-mono break-all max-h-32 overflow-y-auto">
                {classification.technicalDetails}
              </AlertDescription>
            </Alert>

            {renderNextSteps()}

            <div className="flex gap-2">
              <Button onClick={onRetry} className="flex-1" size="lg">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
              <Button onClick={handleCopyError} variant="outline" size="lg" className="flex-shrink-0">
                {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              If the problem persists, try logging out and logging in again
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
