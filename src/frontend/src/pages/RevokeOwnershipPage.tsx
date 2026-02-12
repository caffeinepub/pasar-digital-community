import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetUserVehicles, useRevokeVehicleOwnership } from '../hooks/useVehicles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft, ShieldAlert, CheckCircle } from 'lucide-react';
import PinPromptDialog from '../components/transfer/PinPromptDialog';
import { toast } from 'sonner';
import type { VehicleStatus } from '../backend';

export default function RevokeOwnershipPage() {
  const navigate = useNavigate();
  const { data: vehicles, isLoading } = useGetUserVehicles();
  const revokeOwnership = useRevokeVehicleOwnership();
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [showPinDialog, setShowPinDialog] = useState(false);

  const activeVehicles = vehicles?.filter((v) => v.status.__kind__ === 'ACTIVE') || [];

  const handleRevokeClick = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    setShowPinDialog(true);
  };

  const handlePinSubmit = async (pin: string) => {
    if (!selectedVehicleId) return;

    try {
      await revokeOwnership.mutateAsync({ vehicleId: selectedVehicleId, pin });
      toast.success('Vehicle ownership revoked successfully');
      setShowPinDialog(false);
      setSelectedVehicleId(null);
      navigate({ to: '/vehicles' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to revoke ownership');
      throw error;
    }
  };

  const getStatusBadge = (status: VehicleStatus) => {
    if (status.__kind__ === 'ACTIVE') {
      return (
        <Badge variant="secondary" className="gap-1">
          <CheckCircle className="h-3 w-3" />
          Active
        </Badge>
      );
    }
    return <Badge variant="outline">{status.__kind__}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button variant="ghost" onClick={() => navigate({ to: '/' })} className="mb-6 gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Button>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Revoke Vehicle Ownership</h1>
          <p className="text-muted-foreground mt-1">
            Permanently remove your ownership of a vehicle from the system
          </p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Warning:</strong> Revoking ownership is permanent and cannot be undone. The vehicle will be
            removed from your account and you will lose all access to it.
          </AlertDescription>
        </Alert>

        {activeVehicles.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ShieldAlert className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Active Vehicles</h3>
              <p className="text-muted-foreground text-center mb-4">
                You don't have any active vehicles to revoke ownership from
              </p>
              <Button onClick={() => navigate({ to: '/vehicles' })}>View All Vehicles</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Select Vehicle to Revoke</h2>
              <p className="text-sm text-muted-foreground">{activeVehicles.length} active vehicle(s)</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {activeVehicles.map((vehicle) => (
                <Card key={vehicle.id} className="hover:border-primary transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">
                          {vehicle.brand} {vehicle.model}
                        </CardTitle>
                        <CardDescription>Year {vehicle.year.toString()}</CardDescription>
                      </div>
                      {getStatusBadge(vehicle.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Engine Number:</span>
                        <span className="font-medium">{vehicle.engineNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Location:</span>
                        <span className="font-medium">{vehicle.location}</span>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      className="w-full gap-2"
                      onClick={() => handleRevokeClick(vehicle.id)}
                      disabled={revokeOwnership.isPending}
                    >
                      <ShieldAlert className="h-4 w-4" />
                      Revoke Ownership
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <PinPromptDialog
        open={showPinDialog}
        onOpenChange={setShowPinDialog}
        onSubmit={handlePinSubmit}
        title="Confirm Ownership Revocation"
        description="Enter your PIN to permanently revoke ownership of this vehicle. This action cannot be undone."
      />
    </div>
  );
}
