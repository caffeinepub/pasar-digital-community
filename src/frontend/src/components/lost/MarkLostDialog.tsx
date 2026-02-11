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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';
import { Variant_stolen_lost_pawned } from '../../backend';

interface MarkLostDialogProps {
  vehicleId: string;
}

export default function MarkLostDialog({ vehicleId }: MarkLostDialogProps) {
  const [open, setOpen] = useState(false);
  const [reportNote, setReportNote] = useState('');
  const [category, setCategory] = useState<Variant_stolen_lost_pawned | ''>('');
  const markLost = useMarkVehicleLost();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!category) {
      toast.error('Please select a report category');
      return;
    }

    if (!reportNote.trim()) {
      toast.error('Report note is required');
      return;
    }

    try {
      await markLost.mutateAsync({ vehicleId, category, reportNote: reportNote.trim() });
      toast.success('Vehicle reported successfully');
      setOpen(false);
      setReportNote('');
      setCategory('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to report vehicle');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="gap-2">
          <AlertTriangle className="h-4 w-4" />
          Report Vehicle
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Report Vehicle Status</DialogTitle>
            <DialogDescription>
              This report will be visible to all users to prevent trading of stolen vehicles
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category">Report Category *</Label>
              <Select value={category} onValueChange={(value) => setCategory(value as Variant_stolen_lost_pawned)}>
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
              <Label htmlFor="reportNote">Report Note *</Label>
              <Textarea
                id="reportNote"
                value={reportNote}
                onChange={(e) => setReportNote(e.target.value)}
                placeholder="Describe the circumstances of the incident..."
                rows={4}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={markLost.isPending}>
              {markLost.isPending ? 'Reporting...' : 'Submit Report'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
