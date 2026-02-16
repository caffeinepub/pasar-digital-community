/**
 * Accept transfer page with backend availability gating
 * Disables accepting transfers when backend is unavailable
 */

import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Loader2, AlertCircle } from 'lucide-react';
import { useAcceptTransfer } from '../hooks/useTransfer';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useBackendConnectionStatus } from '../hooks/useBackendConnectionStatus';

export default function AcceptTransferPage() {
  const navigate = useNavigate();
  const [transferCode, setTransferCode] = useState('');
  const acceptTransfer = useAcceptTransfer();
  const { isDegraded } = useBackendConnectionStatus();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!transferCode.trim()) {
      toast.error('Please enter a transfer code');
      return;
    }

    try {
      await acceptTransfer.mutateAsync(transferCode.trim());
      toast.success('Transfer accepted successfully');
      navigate({ to: '/vehicles' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to accept transfer');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            <CardTitle>Accept Vehicle Transfer</CardTitle>
          </div>
          <CardDescription>Enter the transfer code provided by the current owner</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isDegraded && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Transfer acceptance is currently unavailable. Please check the connection banner and retry.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="transferCode">Transfer Code *</Label>
              <Input
                id="transferCode"
                value={transferCode}
                onChange={(e) => setTransferCode(e.target.value)}
                placeholder="Enter transfer code"
                required
                disabled={isDegraded}
              />
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Make sure you have received this code from the legitimate owner. Once accepted, you will become the new
                owner of the vehicle.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button type="submit" disabled={!transferCode.trim() || acceptTransfer.isPending || isDegraded} className="flex-1">
                {acceptTransfer.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Accepting...
                  </>
                ) : (
                  'Accept Transfer'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: '/vehicles' })}
                disabled={acceptTransfer.isPending}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
