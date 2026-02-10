import { useGetUserVehicles } from '../hooks/useVehicles';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Car, AlertTriangle, CheckCircle } from 'lucide-react';

export default function VehiclesPage() {
  const navigate = useNavigate();
  const { data: vehicles, isLoading } = useGetUserVehicles();

  const getStatusBadge = (status: any) => {
    if (status.__kind__ === 'LOST') {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          Hilang
        </Badge>
      );
    }
    if (status.__kind__ === 'FOUND') {
      return (
        <Badge className="gap-1 bg-chart-2">
          <CheckCircle className="h-3 w-3" />
          Ditemukan
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="gap-1">
        <CheckCircle className="h-3 w-3" />
        Aktif
      </Badge>
    );
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kendaraan Saya</h1>
          <p className="text-muted-foreground">Kelola dan pantau kendaraan yang terdaftar</p>
        </div>
        <Button onClick={() => navigate({ to: '/vehicles/register' })} className="gap-2">
          <Plus className="h-4 w-4" />
          Daftarkan Kendaraan
        </Button>
      </div>

      {vehicles && vehicles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Car className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Belum Ada Kendaraan</h3>
            <p className="text-muted-foreground text-center mb-4">
              Daftarkan kendaraan pertama Anda untuk mulai menggunakan sistem keamanan
            </p>
            <Button onClick={() => navigate({ to: '/vehicles/register' })}>Daftarkan Sekarang</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {vehicles?.map((vehicle) => (
            <Card
              key={vehicle.id}
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => navigate({ to: '/vehicles/$vehicleId', params: { vehicleId: vehicle.id } })}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      {vehicle.brand} {vehicle.model}
                    </CardTitle>
                    <CardDescription>Tahun {vehicle.year.toString()}</CardDescription>
                  </div>
                  {getStatusBadge(vehicle.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="aspect-video bg-muted rounded-md overflow-hidden">
                  <img
                    src={vehicle.vehiclePhoto.getDirectURL()}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-sm space-y-1">
                  <p className="text-muted-foreground">
                    <span className="font-medium">No. Mesin:</span> {vehicle.engineNumber}
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium">Lokasi:</span> {vehicle.location}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
