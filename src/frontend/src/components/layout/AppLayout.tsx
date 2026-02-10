import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import AppHeader from '../nav/AppHeader';
import { useGetCallerUserProfile } from '../../hooks/useProfile';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const isOnboarded = userProfile?.onboarded ?? false;

  // Don't show header on sign-in or onboarding screens
  const currentPath = window.location.hash.replace('#', '') || '/';
  const showHeader = isAuthenticated && isOnboarded && currentPath !== '/onboarding';

  return (
    <div className="min-h-screen bg-background">
      {showHeader && <AppHeader />}
      <main className={showHeader ? 'pt-16' : ''}>{children}</main>
      <footer className="border-t mt-auto py-6 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Pasar Digital Community. Built with love using{' '}
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
        </div>
      </footer>
    </div>
  );
}
