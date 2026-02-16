/**
 * Dialog component for reporting found vehicles with backend availability gating
 * Disables mutation actions when backend is unavailable
 */

import { useState } from 'react';
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
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { useReportVehicleFound } from '../../hooks/useLostVehicles';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useBackendConnectionStatus } from '../../hooks/useBackendConnectionStatus';

interface ReportFoundDialogProps {
  vehicleId: string;
  vehicleBrand: string;
  vehicleModel: string;
  triggerVariant?: 'default' | 'outline' | 'secondary';
}

export default function ReportFoundDialog({
  vehicleId,
  vehicleBrand,
  vehicleModel,
  triggerVariant = 'default',
}: ReportFoundDialogProps) {
  const [open, setOpen] = useState(false);
  const [finderReport, setFinderReport] = useState('');
  const reportFound = useReportVehicleFound();
  const { isDegraded } = useBackendConnectionStatus();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!finderReport.trim()) {
      toast.error('Please provide details about where you found the vehicle');
      return;
    }

    try {
      await reportFound.mutateAsync({
        vehicleId,
        finderReport: finderReport.trim(),
      });

      toast.success('Vehicle reported as found. Owner will be notified.');
      setOpen(false);
      setFinderReport('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to report vehicle as found');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} size="sm">
          <CheckCircle className="mr-2 h-4 w-4" />
          Report Found
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Report Vehicle Found</DialogTitle>
            <DialogDescription>
              Report that you found {vehicleBrand} {vehicleModel}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {isDegraded && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  This action is currently unavailable. Please check the connection banner and retry.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="finderReport">Finder Report *</Label>
              <Textarea
                id="finderReport"
                value={finderReport}
                onChange={(e) => setFinderReport(e.target.value)}
                placeholder="Provide details about where and when you found the vehicle"
                rows={4}
                required
                disabled={isDegraded}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={reportFound.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={!finderReport.trim() || reportFound.isPending || isDegraded}>
              {reportFound.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Reporting...
                </>
              ) : (
                'Submit Report'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
