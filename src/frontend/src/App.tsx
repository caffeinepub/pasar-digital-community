import { useEffect, useRef } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useProfile';
import { useActorBootstrapStatus } from './hooks/useActorBootstrapStatus';
import SignInScreen from './components/auth/SignInScreen';
import OnboardingInvitePage from './pages/OnboardingInvitePage';
import DashboardPage from './pages/DashboardPage';
import VehiclesPage from './pages/VehiclesPage';
import RegisterVehiclePage from './pages/RegisterVehiclePage';
import VehicleDetailPage from './pages/VehicleDetailPage';
import LostVehiclesPage from './pages/LostVehiclesPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import SecuritySettingsPage from './pages/SecuritySettingsPage';
import AcceptTransferPage from './pages/AcceptTransferPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminInviteTokensPage from './pages/admin/AdminInviteTokensPage';
import AboutPage from './pages/AboutPage';
import AppLayout from './components/layout/AppLayout';
import ProfileBootstrapError from './components/auth/ProfileBootstrapError';
import StartupBootstrapError from './components/auth/StartupBootstrapError';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet, useNavigate } from '@tanstack/react-router';

// Root route with layout
const rootRoute = createRootRoute({
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
});

// Define all routes
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
});

const vehiclesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/vehicles',
  component: VehiclesPage,
});

const registerVehicleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/vehicles/register',
  component: RegisterVehiclePage,
});

const vehicleDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/vehicles/$vehicleId',
  component: VehicleDetailPage,
});

const lostVehiclesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/lost-vehicles',
  component: LostVehiclesPage,
});

const notificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notifications',
  component: NotificationsPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: ProfilePage,
});

const securityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/security',
  component: SecuritySettingsPage,
});

const acceptTransferRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/accept-transfer',
  component: AcceptTransferPage,
});

const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/onboarding',
  component: OnboardingInvitePage,
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminDashboardPage,
});

const adminInviteTokensRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/invite-tokens',
  component: AdminInviteTokensPage,
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: AboutPage,
});

// Create route tree
const routeTree = rootRoute.addChildren([
  dashboardRoute,
  vehiclesRoute,
  registerVehicleRoute,
  vehicleDetailRoute,
  lostVehiclesRoute,
  notificationsRoute,
  profileRoute,
  securityRoute,
  acceptTransferRoute,
  onboardingRoute,
  adminDashboardRoute,
  adminInviteTokensRoute,
  aboutRoute,
]);

// Create router
const router = createRouter({ routeTree });

// Auth gate component
function AuthGate({ children }: { children: React.ReactNode }) {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched, isError, error, refetch } = useGetCallerUserProfile();
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

  useEffect(() => {
    if (!identity || !isFetched || hasRedirectedRef.current) return;

    if (userProfile === null) {
      hasRedirectedRef.current = true;
      navigate({ to: '/onboarding' });
    }
  }, [identity, userProfile, isFetched, navigate]);

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

  // Show loading while fetching profile for authenticated users
  if (identity && profileLoading) {
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

  // Show children if authenticated and profile exists
  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <AuthGate>
        <RouterProvider router={router} />
      </AuthGate>
      <Toaster />
    </ThemeProvider>
  );
}
