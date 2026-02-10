import { useState } from 'react';
import { useMarkVehicleLost } from '../../hooks/useLostVehicles';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';

interface MarkLostDialogProps {
  vehicleId: string;
}

export default function MarkLostDialog({ vehicleId }: MarkLostDialogProps) {
  const [open, setOpen] = useState(false);
  const [reportNote, setReportNote] = useState('');
  const markLost = useMarkVehicleLost();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reportNote.trim()) {
      toast.error('Catatan laporan harus diisi');
      return;
    }

    try {
      await markLost.mutateAsync({ vehicleId, reportNote: reportNote.trim() });
      toast.success('Kendaraan berhasil dilaporkan hilang');
      setOpen(false);
      setReportNote('');
    } catch (error: any) {
      toast.error(error.message || 'Gagal melaporkan kendaraan');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="gap-2">
          <AlertTriangle className="h-4 w-4" />
          Laporkan Hilang
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Laporkan Kendaraan Hilang</DialogTitle>
            <DialogDescription>
              Laporan ini akan terlihat oleh semua pengguna untuk mencegah jual-beli kendaraan curian
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reportNote">Catatan Laporan *</Label>
              <Textarea
                id="reportNote"
                value={reportNote}
                onChange={(e) => setReportNote(e.target.value)}
                placeholder="Jelaskan kronologi kehilangan kendaraan..."
                rows={4}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="destructive" disabled={markLost.isPending}>
              {markLost.isPending ? 'Melaporkan...' : 'Laporkan Hilang'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
