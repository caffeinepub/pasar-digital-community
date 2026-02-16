/**
 * PIN prompt dialog with backend availability gating
 * Disables PIN-based confirmation submissions when backend is unavailable
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useBackendConnectionStatus } from '../../hooks/useBackendConnectionStatus';

interface PinPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm?: (pin: string) => Promise<void>;
  onSubmit?: (pin: string) => Promise<void>;
  title: string;
  description: string;
  confirmLabel?: string;
  isPending?: boolean;
}

export default function PinPromptDialog({
  open,
  onOpenChange,
  onConfirm,
  onSubmit,
  title,
  description,
  confirmLabel = 'Confirm',
  isPending = false,
}: PinPromptDialogProps) {
  const [pin, setPin] = useState('');
  const { isDegraded } = useBackendConnectionStatus();

  // Reset PIN when dialog closes
  useEffect(() => {
    if (!open) {
      setPin('');
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pin.trim()) {
      return;
    }

    try {
      // Support both onConfirm and onSubmit for backward compatibility
      if (onSubmit) {
        await onSubmit(pin.trim());
      } else if (onConfirm) {
        await onConfirm(pin.trim());
      }
      // Don't reset PIN here - let parent component control dialog state
    } catch (error) {
      // Error handling is done by the parent component
      // Don't reset PIN on error so user can retry
    }
  };

  const handleCancel = () => {
    if (!isPending) {
      setPin('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onPointerDownOutside={(e) => isPending && e.preventDefault()}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
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
              <Label htmlFor="pin">Security PIN *</Label>
              <Input
                id="pin"
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter your PIN"
                required
                disabled={isPending || isDegraded}
                autoFocus
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={!pin.trim() || isPending || isDegraded}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                confirmLabel
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
