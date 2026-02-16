/**
 * Profile page with backend availability gating and inline PIN management
 * Disables profile save and backend-dependent actions when backend is unavailable
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, Shield, AlertCircle } from 'lucide-react';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useProfile';
import { useHasPIN, useSetupPIN, useUpdatePIN } from '../hooks/usePin';
import { useIsActivatedForVehicleRegistration } from '../hooks/useVehicleRegistrationActivation';
import { toast } from 'sonner';
import VehicleRegistrationActivationCard from '../components/activation/VehicleRegistrationActivationCard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useBackendConnectionStatus } from '../hooks/useBackendConnectionStatus';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function ProfilePage() {
  const { data: userProfile, isLoading } = useGetCallerUserProfile();
  const { data: hasPIN, isLoading: pinLoading } = useHasPIN();
  const { data: isActivated, isLoading: activationLoading } = useIsActivatedForVehicleRegistration();
  const saveProfile = useSaveCallerUserProfile();
  const setupPIN = useSetupPIN();
  const updatePIN = useUpdatePIN();
  const { isDegraded } = useBackendConnectionStatus();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // PIN dialog state
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.fullName);
      setEmail(userProfile.email);
      setCity(userProfile.city);
      setCountry(userProfile.country);
    }
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await saveProfile.mutateAsync({
        fullName,
        email,
        city,
        country,
        onboarded: true,
      });

      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const handlePinDialogOpen = () => {
    setOldPin('');
    setNewPin('');
    setConfirmPin('');
    setShowPinDialog(true);
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPin !== confirmPin) {
      toast.error(hasPIN ? 'New PINs do not match' : 'PINs do not match');
      return;
    }

    if (newPin.length < 4) {
      toast.error('PIN must be at least 4 characters');
      return;
    }

    try {
      if (hasPIN) {
        await updatePIN.mutateAsync({ oldPin, newPin });
        toast.success('PIN updated successfully');
      } else {
        await setupPIN.mutateAsync(newPin);
        toast.success('PIN created successfully');
      }
      setShowPinDialog(false);
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
    } catch (error: any) {
      toast.error(error.message || `Failed to ${hasPIN ? 'update' : 'create'} PIN`);
    }
  };

  if (isLoading || pinLoading || activationLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Manage your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isDegraded && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Profile updates are currently unavailable. Please check the connection banner and retry.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={!isEditing || isDegraded}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!isEditing || isDegraded}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={!isEditing || isDegraded}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  disabled={!isEditing || isDegraded}
                  required
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              {!isEditing ? (
                <Button type="button" onClick={() => setIsEditing(true)} className="flex-1" disabled={isDegraded}>
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button type="submit" disabled={saveProfile.isPending || isDegraded} className="flex-1">
                    {saveProfile.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      if (userProfile) {
                        setFullName(userProfile.fullName);
                        setEmail(userProfile.email);
                        setCity(userProfile.city);
                        setCountry(userProfile.country);
                      }
                    }}
                    disabled={saveProfile.isPending}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Vehicle Registration Activation Card */}
      <VehicleRegistrationActivationCard isActivated={isActivated || false} isLoading={activationLoading} />

      {/* Security PIN Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Security PIN</CardTitle>
          </div>
          <CardDescription>Manage your security PIN for sensitive operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-md">
              <div>
                <p className="font-medium">PIN Status</p>
                <p className="text-sm text-muted-foreground">
                  {hasPIN ? 'PIN is configured' : 'No PIN configured'}
                </p>
              </div>
              <Button variant={hasPIN ? 'outline' : 'default'} onClick={handlePinDialogOpen} disabled={isDegraded}>
                {hasPIN ? 'Update PIN' : 'Create PIN'}
              </Button>
            </div>
            {!hasPIN && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  A security PIN is required for sensitive operations like vehicle transfers and ownership revocation.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* PIN Management Dialog */}
      <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
        <DialogContent>
          <form onSubmit={handlePinSubmit}>
            <DialogHeader>
              <DialogTitle>{hasPIN ? 'Update Security PIN' : 'Create Security PIN'}</DialogTitle>
              <DialogDescription>
                {hasPIN
                  ? 'Change your security PIN for sensitive operations'
                  : 'Set up a security PIN for sensitive operations'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
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
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPinDialog(false)}
                disabled={setupPIN.isPending || updatePIN.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  (hasPIN ? !oldPin || !newPin || !confirmPin : !newPin || !confirmPin) ||
                  setupPIN.isPending ||
                  updatePIN.isPending ||
                  isDegraded
                }
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
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
