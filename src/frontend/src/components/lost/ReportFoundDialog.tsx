import { useState } from 'react';
import { useReportVehicleFound } from '../../hooks/useLostVehicles';
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
import { CheckCircle } from 'lucide-react';

interface ReportFoundDialogProps {
  vehicleId: string;
  vehicleName: string;
}

export default function ReportFoundDialog({ vehicleId, vehicleName }: ReportFoundDialogProps) {
  const [open, setOpen] = useState(false);
  const [finderReport, setFinderReport] = useState('');
  const reportFound = useReportVehicleFound();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!finderReport.trim()) {
      toast.error('Laporan penemuan harus diisi');
      return;
    }

    try {
      await reportFound.mutateAsync({ vehicleId, finderReport: finderReport.trim() });
      toast.success('Laporan penemuan berhasil dikirim');
      setOpen(false);
      setFinderReport('');
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengirim laporan');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="w-full gap-2">
          <CheckCircle className="h-4 w-4" />
          Laporkan Ditemukan
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Laporkan Kendaraan Ditemukan</DialogTitle>
            <DialogDescription>
              Anda akan melaporkan bahwa kendaraan <strong>{vehicleName}</strong> telah ditemukan
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="finderReport">Laporan Penemuan *</Label>
              <Textarea
                id="finderReport"
                value={finderReport}
                onChange={(e) => setFinderReport(e.target.value)}
                placeholder="Jelaskan di mana dan bagaimana Anda menemukan kendaraan ini..."
                rows={4}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={reportFound.isPending}>
              {reportFound.isPending ? 'Mengirim...' : 'Kirim Laporan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
