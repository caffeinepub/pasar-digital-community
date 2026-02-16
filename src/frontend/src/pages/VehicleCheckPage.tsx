import { useState } from 'react';
import { useVehicleCheck } from '../hooks/useVehicleCheck';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import ReportFoundDialog from '../components/lost/ReportFoundDialog';
import VehiclePhotoSection from '../components/vehicle/VehiclePhotoSection';

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
        <Badge variant="destructive" className="gap-1 bg-yellow-600">
          <AlertTriangle className="h-3 w-3" />
          Lost
        </Badge>
      );
    }
    if (statusNote === 'Found') {
      return (
        <Badge variant="secondary" className="gap-1">
          <CheckCircle className="h-3 w-3" />
          Found
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="gap-1">
        <CheckCircle className="h-3 w-3" />
        Active
      </Badge>
    );
  };

  const isReportable = (statusNote: string) => {
    return statusNote === 'Lost' || statusNote === 'Stolen' || statusNote === 'Pawned';
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Check Vehicle Status</h1>
          <p className="text-muted-foreground mt-1">
            Verify vehicle status before purchase or report a found vehicle
          </p>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Enter the engine number to check if a vehicle is reported as Lost, Stolen, or Pawned. This helps prevent
            fraud and assists in recovering stolen vehicles.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Search Vehicle</CardTitle>
            <CardDescription>Enter the engine number to check the vehicle status</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="engineNumber">Engine Number</Label>
                <Input
                  id="engineNumber"
                  value={engineNumber}
                  onChange={(e) => setEngineNumber(e.target.value)}
                  placeholder="Enter engine number"
                  required
                />
              </div>
              <Button type="submit" disabled={vehicleCheck.isPending} className="w-full gap-2">
                <Search className="h-4 w-4" />
                {vehicleCheck.isPending ? 'Checking...' : 'Check Vehicle'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {vehicleCheck.isError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {vehicleCheck.error?.message || 'Failed to check vehicle. Please try again.'}
            </AlertDescription>
          </Alert>
        )}

        {vehicleCheck.isSuccess && vehicleCheck.data && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Vehicle Status</CardTitle>
                {getStatusBadge(vehicleCheck.data.statusNote)}
              </div>
              <CardDescription>Vehicle details and current status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <VehiclePhotoSection
                vehiclePhoto={vehicleCheck.data.vehicle.vehiclePhoto}
                vehicleName={`${vehicleCheck.data.vehicle.brand} ${vehicleCheck.data.vehicle.model}`}
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Brand</p>
                  <p className="text-base font-semibold">{vehicleCheck.data.vehicle.brand}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Model</p>
                  <p className="text-base font-semibold">{vehicleCheck.data.vehicle.model}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Year</p>
                  <p className="text-base font-semibold">{vehicleCheck.data.vehicle.year.toString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Location</p>
                  <p className="text-base font-semibold">{vehicleCheck.data.vehicle.location}</p>
                </div>
              </div>

              {vehicleCheck.data.statusNote === 'Stolen' && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Warning:</strong> This vehicle is reported as <strong>STOLEN</strong>. Do not purchase or
                    accept this vehicle. Contact local authorities immediately if you encounter it.
                  </AlertDescription>
                </Alert>
              )}

              {vehicleCheck.data.statusNote === 'Pawned' && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Warning:</strong> This vehicle is reported as <strong>PAWNED</strong>. Verify ownership
                    documents carefully before any transaction.
                  </AlertDescription>
                </Alert>
              )}

              {vehicleCheck.data.statusNote === 'Lost' && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Notice:</strong> This vehicle is reported as <strong>LOST</strong>. If you have found this
                    vehicle, please report it to help reunite it with the owner.
                  </AlertDescription>
                </Alert>
              )}

              {vehicleCheck.data.statusNote === 'Active' && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    This vehicle is currently <strong>ACTIVE</strong> with no reports of theft, loss, or pawning.
                  </AlertDescription>
                </Alert>
              )}

              {isReportable(vehicleCheck.data.statusNote) && (
                <div className="pt-4 border-t">
                  <ReportFoundDialog
                    vehicleId={vehicleCheck.data.vehicle.id}
                    vehicleBrand={vehicleCheck.data.vehicle.brand}
                    vehicleModel={vehicleCheck.data.vehicle.model}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
