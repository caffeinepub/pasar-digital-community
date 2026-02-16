/**
 * Transfer initiation panel with backend availability gating
 * Disables initiating transfers when backend is unavailable
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useInitiateTransfer } from '../../hooks/useTransfer';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useBackendConnectionStatus } from '../../hooks/useBackendConnectionStatus';

interface InitiateTransferPanelProps {
  vehicleId: string;
}

export default function InitiateTransferPanel({ vehicleId }: InitiateTransferPanelProps) {
  const [pin, setPin] = useState('');
  const [transferCode, setTransferCode] = useState<string | null>(null);
  const initiateTransfer = useInitiateTransfer();
  const { isDegraded } = useBackendConnectionStatus();

  const handleInitiate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pin.trim()) {
      toast.error('Please enter your PIN');
      return;
    }

    try {
      const code = await initiateTransfer.mutateAsync({ vehicleId, pin: pin.trim() });
      setTransferCode(code);
      setPin('');
      toast.success('Transfer initiated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to initiate transfer');
    }
  };

  const handleCopyCode = async () => {
    if (!transferCode) return;

    try {
      await navigator.clipboard.writeText(transferCode);
      toast.success('Transfer code copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy transfer code');
    }
  };

  if (transferCode) {
    return (
      <Card className="border-green-500/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <CardTitle>Transfer Initiated</CardTitle>
          </div>
          <CardDescription>Share this code with the new owner</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-md">
            <p className="text-sm font-medium mb-2">Transfer Code:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-lg font-mono bg-background p-2 rounded border">{transferCode}</code>
              <Button size="icon" variant="outline" onClick={handleCopyCode}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              The new owner must use this code to accept the transfer. Keep it secure and only share it with the
              intended recipient.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Initiate Transfer</CardTitle>
        <CardDescription>Transfer ownership of this vehicle to another user</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleInitiate} className="space-y-4">
          {isDegraded && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Transfer initiation is currently unavailable. Please check the connection banner and retry.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="pin">Security PIN *</Label>
            <Input
              id="pin"
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter your PIN to confirm"
              required
              disabled={isDegraded}
            />
          </div>

          <Button type="submit" disabled={!pin.trim() || initiateTransfer.isPending || isDegraded} className="w-full">
            {initiateTransfer.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Initiating...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Initiate Transfer
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
