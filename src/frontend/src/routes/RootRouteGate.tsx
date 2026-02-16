/**
 * Root route gate component that handles authentication and bootstrapping
 * Renders visible UI immediately for authenticated users, showing inline errors instead of blocking
 */

import { useEffect, useRef } from 'react';
import { Outlet, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useProfile';
import { useActorBootstrapStatus } from '../hooks/useActorBootstrapStatus';
import SignInScreen from '../components/auth/SignInScreen';
import AppLayout from '../components/layout/AppLayout';
import StartupBootstrapError from '../components/auth/StartupBootstrapError';
import ProfileBootstrapError from '../components/auth/ProfileBootstrapError';

export default function RootRouteGate() {
  const { identity, isInitializing } = useInternetIdentity();
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
    isError: profileError,
    error: profileErrorObj,
    refetch: refetchProfile,
  } = useGetCallerUserProfile();
  const actorBootstrap = useActorBootstrapStatus();
  const navigate = useNavigate();
  const hasRedirectedRef = useRef(false);
  const lastIdentityRef = useRef<string | null>(null);

  const isAuthenticated = !!identity;

  // Reset redirect flag when identity changes
  useEffect(() => {
    const currentIdentity = identity?.getPrincipal().toString() || null;
    if (currentIdentity !== lastIdentityRef.current) {
      hasRedirectedRef.current = false;
      lastIdentityRef.current = currentIdentity;
    }
  }, [identity]);

  // Redirect to onboarding if authenticated, profile fetched successfully, and profile is null
  useEffect(() => {
    if (!isAuthenticated || !profileFetched || hasRedirectedRef.current) return;

    if (userProfile === null) {
      hasRedirectedRef.current = true;
      navigate({ to: '/onboarding' });
    }
  }, [isAuthenticated, userProfile, profileFetched, navigate]);

  // Show sign-in screen immediately for unauthenticated users
  if (!isAuthenticated && !isInitializing) {
    return <SignInScreen />;
  }

  // Show loading only during initial auth check (not for actor/profile)
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Initializing...</p>
        </div>
      </div>
    );
  }

  // For authenticated users: check actor bootstrap status
  if (isAuthenticated) {
    // If actor bootstrap is in error state and not auto-retrying, show error screen
    if (actorBootstrap.isError && !actorBootstrap.autoRetryStatus) {
      return (
        <StartupBootstrapError
          error={actorBootstrap.error!}
          onRetry={actorBootstrap.retry}
          isRetrying={actorBootstrap.isRetrying}
          autoRetryStatus={actorBootstrap.autoRetryStatus}
          onCancelContinuousRetry={actorBootstrap.cancelContinuousRetry}
        />
      );
    }

    // If actor bootstrap is auto-retrying, show retry screen
    if (actorBootstrap.autoRetryStatus) {
      return (
        <StartupBootstrapError
          error={actorBootstrap.error!}
          onRetry={actorBootstrap.retry}
          isRetrying={actorBootstrap.isRetrying}
          autoRetryStatus={actorBootstrap.autoRetryStatus}
          onCancelContinuousRetry={actorBootstrap.cancelContinuousRetry}
        />
      );
    }

    // If actor is still loading (initial bootstrap), show minimal loading
    if (actorBootstrap.isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Connecting...</p>
          </div>
        </div>
      );
    }

    // Actor is available - now check profile status
    // If profile query errored, show profile error inside AppLayout (non-blocking)
    if (profileError && profileErrorObj) {
      return (
        <AppLayout>
          <div className="container mx-auto p-4 max-w-2xl">
            <ProfileBootstrapError error={profileErrorObj} onRetry={refetchProfile} />
          </div>
        </AppLayout>
      );
    }

    // If profile is still loading (but actor is ready), show inline loading inside AppLayout
    if (profileLoading && !profileFetched) {
      return (
        <AppLayout>
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Loading profile...</p>
            </div>
          </div>
        </AppLayout>
      );
    }

    // Profile fetched successfully - render app layout with outlet
    return (
      <AppLayout>
        <Outlet />
      </AppLayout>
    );
  }

  // Fallback: should never reach here, but render sign-in as safe default
  return <SignInScreen />;
}
