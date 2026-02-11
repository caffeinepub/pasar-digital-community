import { useState } from 'react';
import { useGetLostVehicles } from '../hooks/useLostVehicles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ReportFoundDialog from '../components/lost/ReportFoundDialog';
import { Search, AlertTriangle } from 'lucide-react';
import type { VehicleStatus } from '../backend';

export default function LostVehiclesPage() {
  const { data: lostVehicles, isLoading } = useGetLostVehicles();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVehicles = lostVehicles?.filter(
    (vehicle) =>
      vehicle.engineNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.chassisNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    return null;
  };

  const getStatusDetails = (status: VehicleStatus) => {
    if (status.__kind__ === 'LOST') {
      return {
        note: status.LOST.reportNote,
        time: status.LOST.timeReported,
      };
    }
    if (status.__kind__ === 'STOLEN') {
      return {
        note: status.STOLEN.reportNote,
        time: status.STOLEN.timeReported,
      };
    }
    if (status.__kind__ === 'PAWNED') {
      return {
        note: status.PAWNED.reportNote,
        time: status.PAWNED.timeReported,
      };
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reported Vehicles</h1>
        <p className="text-muted-foreground">List of vehicles reported as lost, stolen, or pawned</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Vehicles</CardTitle>
          <CardDescription>Search by engine number, chassis number, or brand</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Enter engine number, chassis number, or brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {filteredVehicles && filteredVehicles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{searchTerm ? 'No Results' : 'No Reports Yet'}</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'No vehicles match your search' : 'No vehicles have been reported yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredVehicles?.map((vehicle) => {
            const statusDetails = getStatusDetails(vehicle.status);
            return (
              <Card key={vehicle.id}>
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
                  <div className="aspect-video bg-muted rounded-md overflow-hidden">
                    <img
                      src={vehicle.vehiclePhoto.getDirectURL()}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="text-sm space-y-1">
                    <p>
                      <span className="font-medium">Engine No:</span> {vehicle.engineNumber}
                    </p>
                    <p>
                      <span className="font-medium">Chassis No:</span> {vehicle.chassisNumber}
                    </p>
                    <p>
                      <span className="font-medium">Location:</span> {vehicle.location}
                    </p>
                  </div>

                  {statusDetails && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded p-3 text-sm">
                      <p className="font-medium mb-1">Report:</p>
                      <p className="text-muted-foreground">{statusDetails.note}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(Number(statusDetails.time / BigInt(1000000))).toLocaleDateString('en-US')}
                      </p>
                    </div>
                  )}

                  <ReportFoundDialog vehicleId={vehicle.id} vehicleName={`${vehicle.brand} ${vehicle.model}`} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
