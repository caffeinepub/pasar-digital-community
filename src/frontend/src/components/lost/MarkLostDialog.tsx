/**
 * Dialog component for reporting vehicle status with backend availability gating
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Loader2, AlertCircle } from 'lucide-react';
import { useMarkVehicleAsLostStolenOrPawned } from '../../hooks/useLostVehicles';
import { Variant_stolen_lost_pawned } from '../../backend';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useBackendConnectionStatus } from '../../hooks/useBackendConnectionStatus';

interface MarkLostDialogProps {
  vehicleId: string;
  vehicleBrand: string;
  vehicleModel: string;
}

export default function MarkLostDialog({ vehicleId, vehicleBrand, vehicleModel }: MarkLostDialogProps) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<Variant_stolen_lost_pawned>(Variant_stolen_lost_pawned.lost);
  const [reportNote, setReportNote] = useState('');
  const markVehicle = useMarkVehicleAsLostStolenOrPawned();
  const { isDegraded } = useBackendConnectionStatus();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reportNote.trim()) {
      toast.error('Please provide details about the incident');
      return;
    }

    try {
      await markVehicle.mutateAsync({
        vehicleId,
        category,
        reportNote: reportNote.trim(),
      });

      toast.success(`Vehicle marked as ${category}`);
      setOpen(false);
      setReportNote('');
      setCategory(Variant_stolen_lost_pawned.lost);
    } catch (error: any) {
      toast.error(error.message || 'Failed to report vehicle status');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <AlertTriangle className="mr-2 h-4 w-4" />
          Report Status
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Report Vehicle Status</DialogTitle>
            <DialogDescription>
              Report {vehicleBrand} {vehicleModel} as lost, stolen, or pawned
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
              <Label htmlFor="category">Category *</Label>
              <Select
                value={category}
                onValueChange={(value) => setCategory(value as Variant_stolen_lost_pawned)}
                disabled={isDegraded}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Variant_stolen_lost_pawned.lost}>Lost</SelectItem>
                  <SelectItem value={Variant_stolen_lost_pawned.stolen}>Stolen</SelectItem>
                  <SelectItem value={Variant_stolen_lost_pawned.pawned}>Pawned</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reportNote">Report Details *</Label>
              <Textarea
                id="reportNote"
                value={reportNote}
                onChange={(e) => setReportNote(e.target.value)}
                placeholder="Provide details about the incident (location, time, circumstances, etc.)"
                rows={4}
                required
                disabled={isDegraded}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={markVehicle.isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={!reportNote.trim() || markVehicle.isPending || isDegraded}
            >
              {markVehicle.isPending ? (
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
