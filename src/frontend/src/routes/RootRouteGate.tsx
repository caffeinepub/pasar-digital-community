import { useEffect, useRef } from 'react';
import { Outlet, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useProfile';
import { useActorBootstrapStatus } from '../hooks/useActorBootstrapStatus';
import { useIsCallerAdmin } from '../hooks/useAdmin';
import SignInScreen from '../components/auth/SignInScreen';
import ProfileBootstrapError from '../components/auth/ProfileBootstrapError';
import StartupBootstrapError from '../components/auth/StartupBootstrapError';
import AppLayout from '../components/layout/AppLayout';

/**
 * Root route gate component that handles authentication and bootstrapping
 * This component runs inside the router context, so it can safely use useNavigate()
 */
export default function RootRouteGate() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched, isError, error, refetch } = useGetCallerUserProfile();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { isError: actorError, error: actorErrorObj, retry: retryActor, isLoading: actorLoading, isRetrying } = useActorBootstrapStatus();
  const navigate = useNavigate();
  const hasRedirectedRef = useRef(false);
  const lastIdentityRef = useRef<string | null>(null);

  // Reset redirect flag when identity changes
  useEffect(() => {
    const currentIdentity = identity?.getPrincipal().toString() || null;
    if (currentIdentity !== lastIdentityRef.current) {
      hasRedirectedRef.current = false;
      lastIdentityRef.current = currentIdentity;
    }
  }, [identity]);

  // Redirect to onboarding if authenticated but no profile
  // Exception: admins (including allowlisted admin) can bypass onboarding
  useEffect(() => {
    if (!identity || !isFetched || hasRedirectedRef.current || adminLoading) return;

    // Only redirect to onboarding if:
    // 1. User has no profile (userProfile === null)
    // 2. AND user is NOT an admin (including allowlisted admin)
    if (userProfile === null && !isAdmin) {
      hasRedirectedRef.current = true;
      navigate({ to: '/onboarding' });
    }
  }, [identity, userProfile, isFetched, isAdmin, adminLoading, navigate]);

  // Show actor bootstrap error if actor initialization failed (for authenticated users)
  // But not if we're currently retrying
  if (identity && actorError && actorErrorObj && !isRetrying) {
    return <StartupBootstrapError error={actorErrorObj} onRetry={retryActor} isRetrying={false} />;
  }

  // Show loading during retry
  if (identity && isRetrying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Retrying connection...</p>
        </div>
      </div>
    );
  }

  // Show sign-in screen immediately for unauthenticated users (no loading gate)
  if (!identity && !isInitializing) {
    return <SignInScreen />;
  }

  // Show loading only during initial auth check
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading while fetching profile or admin status for authenticated users
  if (identity && (profileLoading || adminLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show error screen if profile fetch failed
  if (identity && isError && error) {
    return <ProfileBootstrapError error={error} onRetry={refetch} />;
  }

  // Render app layout with outlet for authenticated users
  // Admins can proceed even without a profile
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
