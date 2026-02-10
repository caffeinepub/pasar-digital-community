import { useState } from 'react';
import { useGetLostVehicles } from '../hooks/useLostVehicles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ReportFoundDialog from '../components/lost/ReportFoundDialog';
import { Search, AlertTriangle } from 'lucide-react';

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
        <h1 className="text-3xl font-bold tracking-tight">Kendaraan Hilang</h1>
        <p className="text-muted-foreground">Daftar kendaraan yang dilaporkan hilang oleh pemiliknya</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cari Kendaraan</CardTitle>
          <CardDescription>Cari berdasarkan nomor mesin, nomor rangka, atau merek</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Masukkan nomor mesin, nomor rangka, atau merek..."
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
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? 'Tidak Ada Hasil' : 'Belum Ada Laporan'}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm
                ? 'Tidak ada kendaraan yang cocok dengan pencarian Anda'
                : 'Belum ada kendaraan yang dilaporkan hilang'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredVehicles?.map((vehicle) => (
            <Card key={vehicle.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      {vehicle.brand} {vehicle.model}
                    </CardTitle>
                    <CardDescription>Tahun {vehicle.year.toString()}</CardDescription>
                  </div>
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Hilang
                  </Badge>
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
                    <span className="font-medium">No. Mesin:</span> {vehicle.engineNumber}
                  </p>
                  <p>
                    <span className="font-medium">No. Rangka:</span> {vehicle.chassisNumber}
                  </p>
                  <p>
                    <span className="font-medium">Lokasi:</span> {vehicle.location}
                  </p>
                </div>

                {vehicle.status.__kind__ === 'LOST' && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded p-3 text-sm">
                    <p className="font-medium mb-1">Laporan:</p>
                    <p className="text-muted-foreground">{vehicle.status.LOST.reportNote}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(Number(vehicle.status.LOST.timeReported / BigInt(1000000))).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                )}

                <ReportFoundDialog vehicleId={vehicle.id} vehicleName={`${vehicle.brand} ${vehicle.model}`} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
