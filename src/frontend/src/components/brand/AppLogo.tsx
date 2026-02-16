/**
 * Logo component displaying the Pasar Digital Community logo with configurable sizes
 * Uses the provided logo asset with proper aspect ratio preservation
 */

interface AppLogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export default function AppLogo({ size = 'medium', className = '' }: AppLogoProps) {
  const sizeClasses = {
    small: 'h-8 w-8',
    medium: 'h-12 w-12',
    large: 'h-20 w-20',
  };

  return (
    <img
      src="/assets/Logo Pasar Digital Community-2.png"
      alt="Pasar Digital Community"
      className={`${sizeClasses[size]} object-contain ${className}`}
    />
  );
}
