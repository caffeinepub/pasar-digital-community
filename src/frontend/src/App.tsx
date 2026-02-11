// Rebuild trigger: Backend canister restart (2026-02-11)
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { createRouter, createRoute, createRootRoute, RouterProvider } from '@tanstack/react-router';
import RootRouteGate from './routes/RootRouteGate';
import DashboardPage from './pages/DashboardPage';
import VehiclesPage from './pages/VehiclesPage';
import RegisterVehiclePage from './pages/RegisterVehiclePage';
import VehicleDetailPage from './pages/VehicleDetailPage';
import LostVehiclesPage from './pages/LostVehiclesPage';
import VehicleCheckPage from './pages/VehicleCheckPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import SecuritySettingsPage from './pages/SecuritySettingsPage';
import AcceptTransferPage from './pages/AcceptTransferPage';
import OnboardingInvitePage from './pages/OnboardingInvitePage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminInviteTokensPage from './pages/admin/AdminInviteTokensPage';
import AboutPage from './pages/AboutPage';

// Root route with auth gate and layout
const rootRoute = createRootRoute({
  component: RootRouteGate,
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

const vehicleCheckRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/vehicle-check',
  component: VehicleCheckPage,
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
  vehicleCheckRoute,
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

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
