import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useRegisterVehicle } from '../hooks/useVehicles';
import { useIsActivatedForVehicleRegistration } from '../hooks/useVehicleRegistrationActivation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';
import { Upload, ArrowLeft, AlertCircle, ExternalLink } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import VehicleRegistrationActivationCard from '../components/activation/VehicleRegistrationActivationCard';
import { normalizeActorError } from '../utils/normalizeActorError';

export default function RegisterVehiclePage() {
  const navigate = useNavigate();
  const registerVehicle = useRegisterVehicle();
  const { data: isActivated, isLoading: activationLoading, isFetched } = useIsActivatedForVehicleRegistration();
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
      toast.error('Vehicle photo is required');
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

      toast.success('Vehicle registered successfully');
      navigate({ to: '/vehicles' });
    } catch (error: any) {
      const normalized = normalizeActorError(error, 'registerVehicle');
      toast.error(normalized.userMessage);
    }
  };

  if (activationLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  // Show activation required screen when not activated
  if (isFetched && !isActivated) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button variant="ghost" onClick={() => navigate({ to: '/vehicles' })} className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Register New Vehicle</h1>
            <p className="text-muted-foreground mt-1">Activation required to register vehicles</p>
          </div>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Vehicle registration is not activated for your account. Please redeem an activation token from the admin to activate your account.
            </AlertDescription>
          </Alert>

          <VehicleRegistrationActivationCard isActivated={false} isLoading={false} />

          <div className="pt-4 border-t">
            <Link to="/about" className="flex items-center gap-2 text-sm text-primary hover:underline">
              <ExternalLink className="h-4 w-4" />
              Contact Admin for Activation
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Button variant="ghost" onClick={() => navigate({ to: '/vehicles' })} className="mb-6 gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Register New Vehicle</CardTitle>
          <CardDescription>Complete vehicle information for maximum protection</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="engineNumber">Engine Number *</Label>
                <Input
                  id="engineNumber"
                  value={engineNumber}
                  onChange={(e) => setEngineNumber(e.target.value)}
                  placeholder="Vehicle engine number"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="chassisNumber">Chassis Number *</Label>
                <Input
                  id="chassisNumber"
                  value={chassisNumber}
                  onChange={(e) => setChassisNumber(e.target.value)}
                  placeholder="Vehicle chassis number"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="brand">Brand *</Label>
                <Input
                  id="brand"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Example: Honda, Toyota"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Type/Model *</Label>
                <Input
                  id="model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="Example: Civic, Avanza"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="year">Year *</Label>
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
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City/Region"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo">Vehicle Photo *</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                {photoPreview ? (
                  <div className="space-y-4">
                    <img src={photoPreview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
                    <Button type="button" variant="outline" onClick={() => document.getElementById('photo')?.click()}>
                      Change Photo
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
                        Select Photo
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">PNG, JPG up to 10MB</p>
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
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={registerVehicle.isPending}>
              {registerVehicle.isPending ? 'Registering...' : 'Register Vehicle'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
