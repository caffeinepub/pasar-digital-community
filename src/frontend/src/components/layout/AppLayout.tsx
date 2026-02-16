/**
 * Application layout wrapper with header, main content, footer, and non-blocking backend connection banner
 * Shows connectivity banner when backend is degraded while still allowing app navigation
 */

import { useState } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import AppHeader from '../nav/AppHeader';
import { useGetCallerUserProfile } from '../../hooks/useProfile';
import { useNavigate } from '@tanstack/react-router';
import { APP_VERSION } from '../../version';
import InstallAppBanner from '../pwa/InstallAppBanner';
import BackendConnectionBanner from '../system/BackendConnectionBanner';
import { useBackendConnectionStatus } from '../../hooks/useBackendConnectionStatus';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const navigate = useNavigate();
  const { isDegraded, error, retry, isRetrying } = useBackendConnectionStatus();
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const isAuthenticated = !!identity;

  const currentPath = window.location.hash.replace('#', '') || '/';
  const showHeader = isAuthenticated && currentPath !== '/onboarding';

  // Show banner when backend is degraded and not dismissed
  const showBanner = isDegraded && !bannerDismissed && error;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {showHeader && <AppHeader />}
      {showBanner && (
        <BackendConnectionBanner
          error={error}
          onRetry={retry}
          isRetrying={isRetrying}
          onDismiss={() => setBannerDismissed(true)}
        />
      )}
      <main className={`flex-1 ${showHeader ? 'pt-16' : ''} ${showBanner ? 'pt-32' : ''}`}>{children}</main>
      {showHeader && (
        <footer className="border-t mt-auto py-6 px-4">
          <div className="container mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                <p className="text-center sm:text-left">
                  © {new Date().getFullYear()} Pasar Digital Community. Built by Lucky Zamaludin Malik
                </p>
                <span className="hidden sm:inline text-muted-foreground/50">•</span>
                <span className="text-xs text-muted-foreground/70">v{APP_VERSION}</span>
              </div>
              <button onClick={() => navigate({ to: '/about' })} className="text-primary hover:underline">
                About
              </button>
            </div>
          </div>
        </footer>
      )}
      {/* Install app banner - shows when installable regardless of auth state */}
      <InstallAppBanner />
    </div>
  );
}
