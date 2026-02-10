import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetVehicle } from '../hooks/useVehicles';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import InitiateTransferPanel from '../components/transfer/InitiateTransferPanel';
import MarkLostDialog from '../components/lost/MarkLostDialog';
import { ArrowLeft, Calendar, MapPin, Hash, AlertTriangle, CheckCircle } from 'lucide-react';

export default function VehicleDetailPage() {
  const { vehicleId } = useParams({ from: '/vehicles/$vehicleId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: vehicle, isLoading } = useGetVehicle(vehicleId);

  const isOwner = vehicle && identity && vehicle.owner.toString() === identity.getPrincipal().toString();

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
            <p className="text-muted-foreground">Kendaraan tidak ditemukan</p>
            <Button onClick={() => navigate({ to: '/vehicles' })} className="mt-4">
              Kembali
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = () => {
    if (vehicle.status.__kind__ === 'LOST') {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          Hilang
        </Badge>
      );
    }
    if (vehicle.status.__kind__ === 'FOUND') {
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      <Button variant="ghost" onClick={() => navigate({ to: '/vehicles' })} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Kembali
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">
                {vehicle.brand} {vehicle.model}
              </CardTitle>
              <CardDescription>Tahun {vehicle.year.toString()}</CardDescription>
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
                Nomor Mesin
              </p>
              <p className="font-medium">{vehicle.engineNumber}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Nomor Rangka
              </p>
              <p className="font-medium">{vehicle.chassisNumber}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Tahun Pembuatan
              </p>
              <p className="font-medium">{vehicle.year.toString()}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Lokasi
              </p>
              <p className="font-medium">{vehicle.location}</p>
            </div>
          </div>

          {vehicle.status.__kind__ === 'LOST' && (
            <>
              <Separator />
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <h4 className="font-semibold text-destructive mb-2">Laporan Kehilangan</h4>
                <p className="text-sm">{vehicle.status.LOST.reportNote}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Dilaporkan: {new Date(Number(vehicle.status.LOST.timeReported / BigInt(1000000))).toLocaleString('id-ID')}
                </p>
              </div>
            </>
          )}

          {vehicle.status.__kind__ === 'FOUND' && (
            <>
              <Separator />
              <div className="bg-chart-2/10 border border-chart-2/20 rounded-lg p-4">
                <h4 className="font-semibold text-chart-2 mb-2">Laporan Penemuan</h4>
                <p className="text-sm">{vehicle.status.FOUND.finderReport}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Ditemukan: {new Date(Number(vehicle.status.FOUND.timeReported / BigInt(1000000))).toLocaleString('id-ID')}
                </p>
              </div>
            </>
          )}

          {isOwner && vehicle.status.__kind__ === 'ACTIVE' && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-semibold">Aksi Pemilik</h3>
                <div className="flex flex-wrap gap-2">
                  <MarkLostDialog vehicleId={vehicle.id} />
                  <InitiateTransferPanel vehicleId={vehicle.id} />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
