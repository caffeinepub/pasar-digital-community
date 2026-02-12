import { useGetUserVehicles } from '../hooks/useVehicles';
import { useIsActivatedForVehicleRegistration } from '../hooks/useVehicleRegistrationActivation';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Car, AlertTriangle, CheckCircle, Lock, Eye } from 'lucide-react';
import type { VehicleStatus } from '../backend';

export default function VehiclesPage() {
  const navigate = useNavigate();
  const { data: vehicles, isLoading } = useGetUserVehicles();
  const { data: isActivated, isLoading: activationLoading } = useIsActivatedForVehicleRegistration();

  const getStatusBadge = (status: VehicleStatus) => {
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

  if (isLoading || activationLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Vehicles</h1>
          <p className="text-muted-foreground">Manage and monitor your registered vehicles</p>
        </div>
        {isActivated ? (
          <Button onClick={() => navigate({ to: '/vehicles/register' })} className="gap-2">
            <Plus className="h-4 w-4" />
            Register Vehicle
          </Button>
        ) : (
          <Button onClick={() => navigate({ to: '/vehicles/register' })} variant="outline" className="gap-2">
            <Lock className="h-4 w-4" />
            Activate to Register
          </Button>
        )}
      </div>

      {!isActivated && (
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            Vehicle registration requires activation. Click "Activate to Register" to complete activation with an
            admin-provided token.
          </AlertDescription>
        </Alert>
      )}

      {vehicles && vehicles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Car className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Vehicles Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              {isActivated
                ? 'Register your first vehicle to start using the security system'
                : 'Complete activation to register your first vehicle'}
            </p>
            {isActivated ? (
              <Button onClick={() => navigate({ to: '/vehicles/register' })}>Register Now</Button>
            ) : (
              <Button onClick={() => navigate({ to: '/vehicles/register' })} variant="outline">
                Activate Account
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {vehicles?.map((vehicle) => (
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
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => navigate({ to: '/vehicles/$vehicleId', params: { vehicleId: vehicle.id } })}
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
