import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useRegisterVehicle } from '../hooks/useVehicles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';
import { Upload, ArrowLeft } from 'lucide-react';

export default function RegisterVehiclePage() {
  const navigate = useNavigate();
  const registerVehicle = useRegisterVehicle();
  const [engineNumber, setEngineNumber] = useState('');
  const [chassisNumber, setChassisNumber] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [location, setLocation] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!photoFile) {
      toast.error('Foto kendaraan harus diunggah');
      return;
    }

    try {
      const arrayBuffer = await photoFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      await registerVehicle.mutateAsync({
        engineNumber,
        chassisNumber,
        brand,
        model,
        year: BigInt(year),
        location,
        vehiclePhoto: blob,
      });

      toast.success('Kendaraan berhasil didaftarkan');
      navigate({ to: '/vehicles' });
    } catch (error: any) {
      toast.error(error.message || 'Gagal mendaftarkan kendaraan');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Button variant="ghost" onClick={() => navigate({ to: '/vehicles' })} className="mb-6 gap-2">
        <ArrowLeft className="h-4 w-4" />
        Kembali
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Daftarkan Kendaraan Baru</CardTitle>
          <CardDescription>Lengkapi informasi kendaraan Anda untuk perlindungan maksimal</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="engineNumber">Nomor Mesin *</Label>
                <Input
                  id="engineNumber"
                  value={engineNumber}
                  onChange={(e) => setEngineNumber(e.target.value)}
                  placeholder="Nomor mesin kendaraan"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="chassisNumber">Nomor Rangka *</Label>
                <Input
                  id="chassisNumber"
                  value={chassisNumber}
                  onChange={(e) => setChassisNumber(e.target.value)}
                  placeholder="Nomor rangka kendaraan"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="brand">Merek *</Label>
                <Input
                  id="brand"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Contoh: Honda, Toyota"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Tipe/Model *</Label>
                <Input
                  id="model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="Contoh: Civic, Avanza"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="year">Tahun *</Label>
                <Input
                  id="year"
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="2020"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Lokasi *</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Kota/Wilayah"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo">Foto Kendaraan *</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                {photoPreview ? (
                  <div className="space-y-4">
                    <img src={photoPreview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
                    <Button type="button" variant="outline" onClick={() => document.getElementById('photo')?.click()}>
                      Ganti Foto
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('photo')?.click()}
                      >
                        Pilih Foto
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">PNG, JPG hingga 10MB</p>
                  </div>
                )}
                <input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  required
                />
              </div>
            </div>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Mengunggah...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={registerVehicle.isPending}>
              {registerVehicle.isPending ? 'Mendaftarkan...' : 'Daftarkan Kendaraan'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
