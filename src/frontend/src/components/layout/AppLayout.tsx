import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import AppHeader from '../nav/AppHeader';
import { useGetCallerUserProfile } from '../../hooks/useProfile';
import { useNavigate } from '@tanstack/react-router';
import { Heart } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const navigate = useNavigate();

  const isAuthenticated = !!identity;
  const isOnboarded = userProfile?.onboarded ?? false;

  // Don't show header on sign-in or onboarding screens
  const currentPath = window.location.hash.replace('#', '') || '/';
  const showHeader = isAuthenticated && isOnboarded && currentPath !== '/onboarding';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {showHeader && <AppHeader />}
      <main className={`flex-1 ${showHeader ? 'pt-16' : ''}`}>{children}</main>
      {showHeader && (
        <footer className="border-t mt-auto py-6 px-4">
          <div className="container mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <p className="text-center sm:text-left">
                © {new Date().getFullYear()} Pasar Digital Community. Built with{' '}
                <Heart className="inline h-4 w-4 text-destructive fill-destructive" /> using{' '}
                <a
                  href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                    window.location.hostname
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  caffeine.ai
                </a>
              </p>
              <button
                onClick={() => navigate({ to: '/about' })}
                className="text-primary hover:underline"
              >
                Tentang Aplikasi
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
