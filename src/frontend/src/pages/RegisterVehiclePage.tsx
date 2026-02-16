/**
 * Vehicle registration page with activation check and backend availability gating
 * Disables registration when backend is unavailable with inline message
 */

import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, AlertCircle } from 'lucide-react';
import { useRegisterVehicle } from '../hooks/useVehicles';
import { useIsActivatedForVehicleRegistration } from '../hooks/useVehicleRegistrationActivation';
import VehicleRegistrationActivationCard from '../components/activation/VehicleRegistrationActivationCard';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useBackendConnectionStatus } from '../hooks/useBackendConnectionStatus';

export default function RegisterVehiclePage() {
  const navigate = useNavigate();
  const registerVehicle = useRegisterVehicle();
  const { data: isActivated, isLoading: activationLoading } = useIsActivatedForVehicleRegistration();
  const { isDegraded } = useBackendConnectionStatus();

  const [engineNumber, setEngineNumber] = useState('');
  const [chassisNumber, setChassisNumber] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [location, setLocation] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

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
      toast.error('Please upload a vehicle photo');
      return;
    }

    try {
      const photoBytes = await photoFile.arrayBuffer();
      const photoBlob = ExternalBlob.fromBytes(new Uint8Array(photoBytes));

      const vehicleId = await registerVehicle.mutateAsync({
        engineNumber,
        chassisNumber,
        brand,
        model,
        year: BigInt(year),
        location,
        vehiclePhoto: photoBlob,
      });

      toast.success('Vehicle registered successfully', {
        action: {
          label: 'View Details',
          onClick: () => navigate({ to: `/vehicles/${vehicleId}` }),
        },
      });

      navigate({ to: `/vehicles/${vehicleId}` });
    } catch (error: any) {
      toast.error(error.message || 'Failed to register vehicle');
    }
  };

  // Show loading while checking activation status
  if (activationLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Show activation required screen if not activated
  if (!isActivated) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Activation Required</CardTitle>
            <CardDescription>You need to activate your account before registering vehicles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <VehicleRegistrationActivationCard isActivated={false} />
            <Button variant="outline" onClick={() => navigate({ to: '/vehicles' })} className="w-full">
              Back to Vehicles
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isFormValid =
    engineNumber && chassisNumber && brand && model && year && location && photoFile && !isDegraded;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Register New Vehicle</CardTitle>
          <CardDescription>Add a new vehicle to the blockchain registry</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isDegraded && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Vehicle registration is currently unavailable. Please check the connection banner and retry.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="engineNumber">Engine Number *</Label>
              <Input
                id="engineNumber"
                value={engineNumber}
                onChange={(e) => setEngineNumber(e.target.value)}
                placeholder="Enter engine number"
                required
                disabled={isDegraded}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="chassisNumber">Chassis Number *</Label>
              <Input
                id="chassisNumber"
                value={chassisNumber}
                onChange={(e) => setChassisNumber(e.target.value)}
                placeholder="Enter chassis number"
                required
                disabled={isDegraded}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand">Brand *</Label>
                <Input
                  id="brand"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g., Honda"
                  required
                  disabled={isDegraded}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model *</Label>
                <Input
                  id="model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g., Beat"
                  required
                  disabled={isDegraded}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Year *</Label>
                <Input
                  id="year"
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="e.g., 2020"
                  required
                  disabled={isDegraded}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Jakarta"
                  required
                  disabled={isDegraded}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo">Vehicle Photo *</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="flex-1"
                  required
                  disabled={isDegraded}
                />
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
              {photoPreview && (
                <div className="mt-2">
                  <img src={photoPreview} alt="Preview" className="w-full h-48 object-cover rounded-md" />
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={!isFormValid || registerVehicle.isPending} className="flex-1">
                {registerVehicle.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  'Register Vehicle'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: '/vehicles' })}
                disabled={registerVehicle.isPending}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
