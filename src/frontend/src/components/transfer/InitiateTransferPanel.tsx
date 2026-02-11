import { useState } from 'react';
import { useInitiateTransfer } from '../../hooks/useTransfers';
import PinPromptDialog from './PinPromptDialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { ArrowRightLeft, Copy, CheckCircle } from 'lucide-react';

interface InitiateTransferPanelProps {
  vehicleId: string;
}

export default function InitiateTransferPanel({ vehicleId }: InitiateTransferPanelProps) {
  const initiateTransfer = useInitiateTransfer();
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [transferCode, setTransferCode] = useState<string | null>(null);

  const handleInitiate = async (pin: string) => {
    if (!pin || pin.trim().length === 0) {
      throw new Error('PIN is required');
    }

    try {
      const code = await initiateTransfer.mutateAsync({ vehicleId, pin: pin.trim() });
      setTransferCode(code);
      setShowPinDialog(false);
      toast.success('Transfer initiated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to initiate transfer');
      throw error;
    }
  };

  const handleCopyLink = () => {
    if (transferCode) {
      const link = `${window.location.origin}#/accept-transfer?code=${transferCode}`;
      navigator.clipboard.writeText(link);
      toast.success('Transfer link copied to clipboard');
    }
  };

  if (transferCode) {
    return (
      <Alert className="border-primary">
        <CheckCircle className="h-4 w-4 text-primary" />
        <AlertDescription>
          <div className="space-y-3">
            <p className="font-medium">Transfer initiated successfully!</p>
            <div className="space-y-2">
              <p className="text-sm">Transfer Code:</p>
              <div className="p-2 bg-muted rounded font-mono text-sm break-all">{transferCode}</div>
            </div>
            <Button onClick={handleCopyLink} variant="outline" size="sm" className="gap-2">
              <Copy className="h-4 w-4" />
              Copy Transfer Link
            </Button>
            <p className="text-xs text-muted-foreground">
              Share this link with the recipient to complete the ownership transfer
            </p>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <Button onClick={() => setShowPinDialog(true)} variant="default" className="gap-2">
        <ArrowRightLeft className="h-4 w-4" />
        Transfer Ownership
      </Button>

      <PinPromptDialog
        open={showPinDialog}
        onOpenChange={setShowPinDialog}
        onSubmit={handleInitiate}
        title="Verify PIN"
        description="Enter your PIN to continue with the vehicle ownership transfer"
      />
    </>
  );
}
