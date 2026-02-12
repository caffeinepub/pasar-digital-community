import { useNavigate } from '@tanstack/react-router';
import { useGetUserVehicles } from '../hooks/useVehicles';
import { useGetMyNotifications } from '../hooks/useNotifications';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Car, Bell, Search, Plus, AlertTriangle, FileSearch, MapPin } from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: vehicles, isLoading: vehiclesLoading } = useGetUserVehicles();
  const { data: notifications, isLoading: notificationsLoading } = useGetMyNotifications();

  const unreadNotifications = notifications?.filter((n) => !n.read).length || 0;
  const reportedVehicles =
    vehicles?.filter((v) => {
      if (v.status.__kind__ === 'LOST' || v.status.__kind__ === 'STOLEN' || v.status.__kind__ === 'PAWNED') {
        return true;
      }
      return false;
    }).length || 0;

  const quickActions = [
    {
      title: 'Register Vehicle',
      description: 'Add a new vehicle to your account',
      icon: Plus,
      action: () => navigate({ to: '/vehicles/register' }),
      variant: 'default' as const,
    },
    {
      title: 'Report Found Vehicle',
      description: 'Help reunite owners with lost vehicles',
      icon: MapPin,
      action: () => navigate({ to: '/report-found' }),
      variant: 'default' as const,
    },
    {
      title: 'Vehicle Check',
      description: 'Check vehicle status by engine number',
      icon: FileSearch,
      action: () => navigate({ to: '/vehicle-check' }),
      variant: 'secondary' as const,
    },
    {
      title: 'View Lost Vehicles',
      description: 'Browse reported vehicles in the community',
      icon: Search,
      action: () => navigate({ to: '/lost-vehicles' }),
      variant: 'outline' as const,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome to your vehicle security hub</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Vehicles</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vehiclesLoading ? '...' : vehicles?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Registered vehicles</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notifications</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{notificationsLoading ? '...' : unreadNotifications}</div>
              <p className="text-xs text-muted-foreground mt-1">Unread messages</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reported Vehicles</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vehiclesLoading ? '...' : reportedVehicles}</div>
              <p className="text-xs text-muted-foreground mt-1">Lost/Stolen/Pawned</p>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <Card key={action.title} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <action.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">{action.title}</CardTitle>
                  </div>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant={action.variant} className="w-full" onClick={action.action}>
                    {action.title}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {vehicles && vehicles.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Vehicles</h2>
              <Button variant="link" size="sm" onClick={() => navigate({ to: '/vehicles' })} className="h-auto p-0">
                View all
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {vehicles.slice(0, 3).map((vehicle) => (
                <Card
                  key={vehicle.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate({ to: `/vehicles/${vehicle.id}` })}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        {vehicle.brand} {vehicle.model}
                      </CardTitle>
                      <Badge
                        variant={
                          vehicle.status.__kind__ === 'ACTIVE'
                            ? 'default'
                            : vehicle.status.__kind__ === 'FOUND'
                              ? 'secondary'
                              : 'destructive'
                        }
                      >
                        {vehicle.status.__kind__}
                      </Badge>
                    </div>
                    <CardDescription>
                      {vehicle.year} • {vehicle.location}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
