/**
 * Security settings page with backend availability gating
 * Disables PIN setup/update actions when backend is unavailable
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Loader2, AlertCircle } from 'lucide-react';
import { useHasPIN, useSetupPIN, useUpdatePIN } from '../hooks/usePin';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useBackendConnectionStatus } from '../hooks/useBackendConnectionStatus';

export default function SecuritySettingsPage() {
  const navigate = useNavigate();
  const { data: hasPIN, isLoading } = useHasPIN();
  const setupPIN = useSetupPIN();
  const updatePIN = useUpdatePIN();
  const { isDegraded } = useBackendConnectionStatus();

  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const handleSetupPIN = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPin !== confirmPin) {
      toast.error('PINs do not match');
      return;
    }

    if (newPin.length < 4) {
      toast.error('PIN must be at least 4 characters');
      return;
    }

    try {
      await setupPIN.mutateAsync(newPin);
      toast.success('PIN created successfully');
      setNewPin('');
      setConfirmPin('');
      navigate({ to: '/profile' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create PIN');
    }
  };

  const handleUpdatePIN = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPin !== confirmPin) {
      toast.error('New PINs do not match');
      return;
    }

    if (newPin.length < 4) {
      toast.error('PIN must be at least 4 characters');
      return;
    }

    try {
      await updatePIN.mutateAsync({ oldPin, newPin });
      toast.success('PIN updated successfully');
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
      navigate({ to: '/profile' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to update PIN');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>{hasPIN ? 'Update Security PIN' : 'Create Security PIN'}</CardTitle>
          </div>
          <CardDescription>
            {hasPIN
              ? 'Change your security PIN for sensitive operations'
              : 'Set up a security PIN for sensitive operations'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={hasPIN ? handleUpdatePIN : handleSetupPIN} className="space-y-4">
            {isDegraded && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  PIN management is currently unavailable. Please check the connection banner and retry.
                </AlertDescription>
              </Alert>
            )}

            {hasPIN && (
              <div className="space-y-2">
                <Label htmlFor="oldPin">Current PIN *</Label>
                <Input
                  id="oldPin"
                  type="password"
                  value={oldPin}
                  onChange={(e) => setOldPin(e.target.value)}
                  placeholder="Enter current PIN"
                  required
                  disabled={isDegraded}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="newPin">{hasPIN ? 'New PIN' : 'PIN'} *</Label>
              <Input
                id="newPin"
                type="password"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder={hasPIN ? 'Enter new PIN' : 'Enter PIN (min. 4 characters)'}
                required
                minLength={4}
                disabled={isDegraded}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPin">Confirm {hasPIN ? 'New ' : ''}PIN *</Label>
              <Input
                id="confirmPin"
                type="password"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder="Confirm PIN"
                required
                minLength={4}
                disabled={isDegraded}
              />
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Your PIN is required for sensitive operations like vehicle transfers and ownership revocation. Keep it
                secure and don't share it with anyone.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={
                  (hasPIN ? !oldPin || !newPin || !confirmPin : !newPin || !confirmPin) ||
                  setupPIN.isPending ||
                  updatePIN.isPending ||
                  isDegraded
                }
                className="flex-1"
              >
                {setupPIN.isPending || updatePIN.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {hasPIN ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>{hasPIN ? 'Update PIN' : 'Create PIN'}</>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: '/profile' })}
                disabled={setupPIN.isPending || updatePIN.isPending}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
