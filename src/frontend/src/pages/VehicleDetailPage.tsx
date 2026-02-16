/**
 * Vehicle detail page with comprehensive status display and owner actions
 * Includes revoke ownership button with PIN confirmation dialog
 */

import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetVehicle, useRevokeVehicleOwnership } from '../hooks/useVehicles';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useHasPIN } from '../hooks/usePin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import InitiateTransferPanel from '../components/transfer/InitiateTransferPanel';
import MarkLostDialog from '../components/lost/MarkLostDialog';
import PinPromptDialog from '../components/transfer/PinPromptDialog';
import { ArrowLeft, Calendar, MapPin, Hash, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function VehicleDetailPage() {
  const { vehicleId } = useParams({ from: '/vehicles/$vehicleId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: vehicle, isLoading } = useGetVehicle(vehicleId);
  const { data: hasPIN, isLoading: pinLoading } = useHasPIN();
  const revokeOwnership = useRevokeVehicleOwnership();

  const [showRevokePinDialog, setShowRevokePinDialog] = useState(false);

  const isOwner = vehicle && identity && vehicle.owner.toString() === identity.getPrincipal().toString();

  const handleRevokeClick = () => {
    if (pinLoading) return;

    if (!hasPIN) {
      toast.error('PIN Required', {
        description:
          'You must set up a PIN before revoking vehicle ownership. Please go to Security settings to create a PIN.',
      });
      navigate({ to: '/profile' });
      return;
    }

    setShowRevokePinDialog(true);
  };

  const handleRevokeSubmit = async (pin: string) => {
    try {
      await revokeOwnership.mutateAsync({ vehicleId, pin });
      toast.success('Ownership Revoked', {
        description: 'Vehicle ownership has been successfully revoked.',
      });
      navigate({ to: '/vehicles' });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to revoke ownership';
      throw new Error(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Vehicle not found</p>
            <Button onClick={() => navigate({ to: '/vehicles' })} className="mt-4">
              Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = () => {
    const status = vehicle.status;
    if (status.__kind__ === 'STOLEN') {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          Stolen
        </Badge>
      );
    }
    if (status.__kind__ === 'PAWNED') {
      return (
        <Badge variant="destructive" className="gap-1 bg-orange-600">
          <AlertTriangle className="h-3 w-3" />
          Pawned
        </Badge>
      );
    }
    if (status.__kind__ === 'LOST') {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          Lost
        </Badge>
      );
    }
    if (status.__kind__ === 'FOUND') {
      return (
        <Badge className="gap-1 bg-chart-2">
          <CheckCircle className="h-3 w-3" />
          Found
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="gap-1">
        <CheckCircle className="h-3 w-3" />
        Active
      </Badge>
    );
  };

  const renderStatusDetails = () => {
    const status = vehicle.status;
    if (status.__kind__ === 'LOST') {
      return (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Lost Report
          </h3>
          <p className="text-sm text-muted-foreground mb-2">{status.LOST.reportNote}</p>
          <p className="text-xs text-muted-foreground">
            Reported: {new Date(Number(status.LOST.timeReported / BigInt(1000000))).toLocaleString('en-US')}
          </p>
        </div>
      );
    }
    if (status.__kind__ === 'STOLEN') {
      return (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Stolen Report
          </h3>
          <p className="text-sm text-muted-foreground mb-2">{status.STOLEN.reportNote}</p>
          <p className="text-xs text-muted-foreground">
            Reported: {new Date(Number(status.STOLEN.timeReported / BigInt(1000000))).toLocaleString('en-US')}
          </p>
        </div>
      );
    }
    if (status.__kind__ === 'PAWNED') {
      return (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Pawned Report
          </h3>
          <p className="text-sm text-muted-foreground mb-2">{status.PAWNED.reportNote}</p>
          <p className="text-xs text-muted-foreground">
            Reported: {new Date(Number(status.PAWNED.timeReported / BigInt(1000000))).toLocaleString('en-US')}
          </p>
        </div>
      );
    }
    if (status.__kind__ === 'FOUND') {
      return (
        <div className="bg-chart-2/10 border border-chart-2/20 rounded-lg p-4">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Found Report
          </h3>
          <p className="text-sm text-muted-foreground mb-2">{status.FOUND.finderReport}</p>
          <p className="text-xs text-muted-foreground">
            Found: {new Date(Number(status.FOUND.timeReported / BigInt(1000000))).toLocaleString('en-US')}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      <Button variant="ghost" onClick={() => navigate({ to: '/vehicles' })} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">
                {vehicle.brand} {vehicle.model}
              </CardTitle>
              <CardDescription>Year {vehicle.year.toString()}</CardDescription>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
            <img
              src={vehicle.vehiclePhoto.getDirectURL()}
              alt={`${vehicle.brand} ${vehicle.model}`}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Engine Number
              </p>
              <p className="font-medium">{vehicle.engineNumber}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Chassis Number
              </p>
              <p className="font-medium">{vehicle.chassisNumber}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Year
              </p>
              <p className="font-medium">{vehicle.year.toString()}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location
              </p>
              <p className="font-medium">{vehicle.location}</p>
            </div>
          </div>

          {renderStatusDetails()}

          {isOwner && vehicle.status.__kind__ === 'ACTIVE' && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-semibold">Owner Actions</h3>
                <div className="flex flex-wrap gap-2">
                  <MarkLostDialog
                    vehicleId={vehicle.id}
                    vehicleBrand={vehicle.brand}
                    vehicleModel={vehicle.model}
                  />
                  <InitiateTransferPanel vehicleId={vehicle.id} />
                  <Button variant="destructive" onClick={handleRevokeClick} className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Revoke Ownership
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <PinPromptDialog
        open={showRevokePinDialog}
        onOpenChange={setShowRevokePinDialog}
        onConfirm={handleRevokeSubmit}
        title="Confirm Ownership Revocation"
        description="Enter your PIN to revoke ownership of this vehicle. This action will remove the vehicle from your account."
        isPending={revokeOwnership.isPending}
      />
    </div>
  );
}
