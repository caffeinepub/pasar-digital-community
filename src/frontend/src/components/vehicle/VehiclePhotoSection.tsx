import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import type { ExternalBlob } from '../../backend';

interface VehiclePhotoSectionProps {
  vehiclePhoto: ExternalBlob;
  vehicleName: string;
  className?: string;
}

export default function VehiclePhotoSection({ vehiclePhoto, vehicleName, className = '' }: VehiclePhotoSectionProps) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <div className={`aspect-video bg-muted rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center text-muted-foreground">
          <ImageOff className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Photo unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`aspect-video bg-muted rounded-lg overflow-hidden ${className}`}>
      <img
        src={vehiclePhoto.getDirectURL()}
        alt={vehicleName}
        className="w-full h-full object-cover"
        onError={() => setImageError(true)}
      />
    </div>
  );
}
