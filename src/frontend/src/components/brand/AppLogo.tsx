interface AppLogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export default function AppLogo({ size = 'medium', className = '' }: AppLogoProps) {
  const sizeClasses = {
    small: 'h-10 w-10',
    medium: 'h-16 w-16',
    large: 'h-24 w-24',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img
        src="/assets/logo-pasar-digital-community.png"
        alt="Pasar Digital Community Logo"
        className={`${sizeClasses[size]} object-contain`}
      />
    </div>
  );
}
