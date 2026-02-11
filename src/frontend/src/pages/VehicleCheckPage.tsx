import { useState } from 'react';
import { useVehicleCheck } from '../hooks/useVehicleCheck';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import type { VehicleCheckStatus } from '../backend';

export default function VehicleCheckPage() {
  const [engineNumber, setEngineNumber] = useState('');
  const vehicleCheck = useVehicleCheck();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (engineNumber.trim()) {
      vehicleCheck.mutate(engineNumber.trim());
    }
  };

  const getStatusBadge = (statusNote: string) => {
    if (statusNote === 'Stolen') {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          Stolen
        </Badge>
      );
    }
    if (statusNote === 'Pawned') {
      return (
        <Badge variant="destructive" className="gap-1 bg-orange-600">
          <AlertTriangle className="h-3 w-3" />
          Pawned
        </Badge>
      );
    }
    if (statusNote === 'Lost') {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          Lost
        </Badge>
      );
    }
    if (statusNote === 'Found') {
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

  const renderResult = () => {
    if (vehicleCheck.isPending) {
      return (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-muted-foreground">Checking vehicle status...</div>
          </CardContent>
        </Card>
      );
    }

    if (vehicleCheck.isError) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {vehicleCheck.error?.message || 'No vehicle matching engine number found'}
          </AlertDescription>
        </Alert>
      );
    }

    if (vehicleCheck.isSuccess && vehicleCheck.data) {
      const result: VehicleCheckStatus = vehicleCheck.data;
      const { vehicle, statusNote } = result;

      return (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl">
                  {vehicle.brand} {vehicle.model}
                </CardTitle>
                <CardDescription>Year {vehicle.year.toString()}</CardDescription>
              </div>
              {getStatusBadge(statusNote)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-video bg-muted rounded-md overflow-hidden">
              <img
                src={vehicle.vehiclePhoto.getDirectURL()}
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Engine Number</p>
                <p className="font-medium">{vehicle.engineNumber}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Chassis Number</p>
                <p className="font-medium">{vehicle.chassisNumber}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{vehicle.location}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium">{statusNote}</p>
              </div>
            </div>

            {(statusNote === 'Lost' || statusNote === 'Stolen' || statusNote === 'Pawned') && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Warning:</strong> This vehicle has been reported as {statusNote.toLowerCase()}. Do not
                  proceed with any transaction involving this vehicle.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Vehicle Check</h1>
        <p className="text-muted-foreground">Check vehicle status by engine number</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enter Engine Number</CardTitle>
          <CardDescription>
            Enter the engine number to check if the vehicle is registered and view its current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="engineNumber">Engine Number</Label>
              <Input
                id="engineNumber"
                value={engineNumber}
                onChange={(e) => setEngineNumber(e.target.value)}
                placeholder="Enter engine number..."
                required
              />
            </div>
            <Button type="submit" disabled={vehicleCheck.isPending || !engineNumber.trim()} className="gap-2">
              <Search className="h-4 w-4" />
              {vehicleCheck.isPending ? 'Checking...' : 'Check Vehicle'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {renderResult()}
    </div>
  );
}
