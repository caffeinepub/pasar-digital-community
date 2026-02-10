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
    try {
      const code = await initiateTransfer.mutateAsync({ vehicleId, pin });
      setTransferCode(code);
      setShowPinDialog(false);
      toast.success('Transfer berhasil diinisiasi');
    } catch (error: any) {
      toast.error(error.message || 'Gagal menginisiasi transfer');
      throw error;
    }
  };

  const handleCopyLink = () => {
    if (transferCode) {
      const link = `${window.location.origin}#/accept-transfer?code=${transferCode}`;
      navigator.clipboard.writeText(link);
      toast.success('Link transfer disalin ke clipboard');
    }
  };

  if (transferCode) {
    return (
      <Alert className="border-primary">
        <CheckCircle className="h-4 w-4 text-primary" />
        <AlertDescription>
          <div className="space-y-3">
            <p className="font-medium">Transfer berhasil diinisiasi!</p>
            <div className="space-y-2">
              <p className="text-sm">Kode Transfer:</p>
              <div className="p-2 bg-muted rounded font-mono text-sm break-all">{transferCode}</div>
            </div>
            <Button onClick={handleCopyLink} variant="outline" size="sm" className="gap-2">
              <Copy className="h-4 w-4" />
              Salin Link Transfer
            </Button>
            <p className="text-xs text-muted-foreground">
              Bagikan link ini kepada penerima untuk menyelesaikan transfer kepemilikan
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
        Transfer Kepemilikan
      </Button>

      <PinPromptDialog
        open={showPinDialog}
        onOpenChange={setShowPinDialog}
        onSubmit={handleInitiate}
        title="Verifikasi PIN"
        description="Masukkan PIN Anda untuk melanjutkan transfer kepemilikan kendaraan"
      />
    </>
  );
}
