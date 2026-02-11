import { useEffect, useRef, useState } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useProfile';
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
  const [hasRedirected, setHasRedirected] = useState(false);

  // Show loading only while Internet Identity is initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Menginisialisasi...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show sign-in immediately (don't wait for profile)
  if (!identity) {
    return <SignInScreen />;
  }

  // Authenticated: show loading while profile is being fetched
  if (profileLoading && !isFetched) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat profil...</p>
        </div>
      </div>
    );
  }

  // If profile fetch failed, show error with retry
  if (isError && isFetched) {
    return (
      <ProfileBootstrapError
        error={error}
        onRetry={() => {
          setHasRedirected(false);
          refetch();
        }}
      />
    );
  }

  // Profile fetched successfully - handle onboarding redirect
  const currentPath = window.location.hash.replace('#', '') || '/';
  const needsOnboarding = isFetched && userProfile === null;

  // Redirect to onboarding if needed (only once)
  if (needsOnboarding && currentPath !== '/onboarding' && !hasRedirected) {
    setHasRedirected(true);
    window.location.hash = '#/onboarding';
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Mengarahkan ke pendaftaran...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthGate>
        <RouterProvider router={router} />
      </AuthGate>
      <Toaster />
    </ThemeProvider>
  );
}
