import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAcceptTransfer } from '../hooks/useTransfers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function AcceptTransferPage() {
  const navigate = useNavigate();
  const acceptTransfer = useAcceptTransfer();
  const [transferCode, setTransferCode] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const codeFromUrl = urlParams.get('code');
    if (codeFromUrl) {
      setTransferCode(codeFromUrl);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!transferCode.trim()) {
      toast.error('Kode transfer harus diisi');
      return;
    }

    try {
      await acceptTransfer.mutateAsync(transferCode.trim());
      toast.success('Transfer berhasil! Kendaraan sekarang milik Anda');
      navigate({ to: '/vehicles' });
    } catch (error: any) {
      toast.error(error.message || 'Gagal menerima transfer');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Terima Transfer Kendaraan
          </CardTitle>
          <CardDescription>Masukkan kode transfer untuk menerima kepemilikan kendaraan</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Pastikan Anda menerima kode transfer dari pemilik kendaraan yang sah. Proses ini tidak dapat dibatalkan.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="transferCode">Kode Transfer</Label>
              <Input
                id="transferCode"
                value={transferCode}
                onChange={(e) => setTransferCode(e.target.value)}
                placeholder="Masukkan kode transfer"
                required
              />
            </div>

            {acceptTransfer.isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{acceptTransfer.error?.message || 'Terjadi kesalahan'}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button type="submit" disabled={acceptTransfer.isPending} className="flex-1">
                {acceptTransfer.isPending ? 'Memproses...' : 'Terima Transfer'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate({ to: '/' })}>
                Batal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
