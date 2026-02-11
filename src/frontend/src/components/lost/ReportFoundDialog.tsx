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
      toast.error('Finder report is required');
      return;
    }

    try {
      await reportFound.mutateAsync({ vehicleId, finderReport: finderReport.trim() });
      toast.success('Found report submitted successfully');
      setOpen(false);
      setFinderReport('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit report');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="w-full gap-2">
          <CheckCircle className="h-4 w-4" />
          Report Found
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Report Vehicle Found</DialogTitle>
            <DialogDescription>
              You are reporting that vehicle <strong>{vehicleName}</strong> has been found
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="finderReport">Finder Report *</Label>
              <Textarea
                id="finderReport"
                value={finderReport}
                onChange={(e) => setFinderReport(e.target.value)}
                placeholder="Describe where and how you found this vehicle..."
                rows={4}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={reportFound.isPending}>
              {reportFound.isPending ? 'Submitting...' : 'Submit Report'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
