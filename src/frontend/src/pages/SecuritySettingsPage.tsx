import { useState } from 'react';
import { useSetupPIN, useUpdatePIN } from '../hooks/usePin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Lock, Shield, AlertCircle } from 'lucide-react';

export default function SecuritySettingsPage() {
  const setupPIN = useSetupPIN();
  const updatePIN = useUpdatePIN();

  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [oldPin, setOldPin] = useState('');
  const [isUpdate, setIsUpdate] = useState(false);

  const handleSetupPIN = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPin !== confirmPin) {
      toast.error('PIN tidak cocok');
      return;
    }

    if (newPin.length < 4) {
      toast.error('PIN minimal 4 karakter');
      return;
    }

    try {
      await setupPIN.mutateAsync(newPin);
      toast.success('PIN berhasil dibuat');
      setNewPin('');
      setConfirmPin('');
      setIsUpdate(true);
    } catch (error: any) {
      toast.error(error.message || 'Gagal membuat PIN');
    }
  };

  const handleUpdatePIN = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPin !== confirmPin) {
      toast.error('PIN baru tidak cocok');
      return;
    }

    if (newPin.length < 4) {
      toast.error('PIN minimal 4 karakter');
      return;
    }

    try {
      await updatePIN.mutateAsync({ oldPin, newPin });
      toast.success('PIN berhasil diperbarui');
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
    } catch (error: any) {
      toast.error(error.message || 'Gagal memperbarui PIN');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pengaturan Keamanan</h1>
        <p className="text-muted-foreground">Kelola PIN untuk transfer kepemilikan kendaraan</p>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          PIN digunakan untuk mengamankan proses transfer kepemilikan kendaraan. Jangan bagikan PIN Anda kepada siapa pun.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            {isUpdate ? 'Perbarui PIN' : 'Buat PIN'}
          </CardTitle>
          <CardDescription>
            {isUpdate
              ? 'Ubah PIN Anda untuk keamanan yang lebih baik'
              : 'Buat PIN untuk mengamankan transfer kendaraan'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={isUpdate ? handleUpdatePIN : handleSetupPIN} className="space-y-4">
            {isUpdate && (
              <div className="space-y-2">
                <Label htmlFor="oldPin">PIN Lama</Label>
                <Input
                  id="oldPin"
                  type="password"
                  value={oldPin}
                  onChange={(e) => setOldPin(e.target.value)}
                  placeholder="Masukkan PIN lama"
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="newPin">PIN Baru</Label>
              <Input
                id="newPin"
                type="password"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="Minimal 4 karakter"
                minLength={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPin">Konfirmasi PIN Baru</Label>
              <Input
                id="confirmPin"
                type="password"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder="Masukkan ulang PIN baru"
                minLength={4}
                required
              />
            </div>

            {newPin && confirmPin && newPin !== confirmPin && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>PIN tidak cocok</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={setupPIN.isPending || updatePIN.isPending}
              className="w-full"
            >
              {setupPIN.isPending || updatePIN.isPending
                ? 'Memproses...'
                : isUpdate
                ? 'Perbarui PIN'
                : 'Buat PIN'}
            </Button>

            {isUpdate && (
              <Button type="button" variant="ghost" onClick={() => setIsUpdate(false)} className="w-full">
                Kembali ke Setup PIN
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
