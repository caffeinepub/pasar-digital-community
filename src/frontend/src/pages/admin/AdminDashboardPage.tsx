import { useIsCallerAdmin, useGetSystemStats } from '../../hooks/useAdmin';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AccessDeniedScreen from '../../components/auth/AccessDeniedScreen';
import { Car, AlertTriangle, CheckCircle, Users, Ticket } from 'lucide-react';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: stats, isLoading: statsLoading } = useGetSystemStats();

  if (adminLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return <AccessDeniedScreen />;
  }

  const statCards = [
    {
      title: 'Total Vehicles',
      value: stats?.totalVehicles.toString() || '0',
      icon: Car,
      color: 'text-primary',
    },
    {
      title: 'Lost Reports',
      value: stats?.totalLostReports.toString() || '0',
      icon: AlertTriangle,
      color: 'text-destructive',
    },
    {
      title: 'Found Reports',
      value: stats?.totalFoundReports.toString() || '0',
      icon: CheckCircle,
      color: 'text-chart-2',
    },
    {
      title: 'Total Users',
      value: stats?.totalUsers.toString() || '0',
      icon: Users,
      color: 'text-chart-4',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage system and monitor statistics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Invite Tokens
            </CardTitle>
            <CardDescription>Manage invite tokens for new users</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate({ to: '/admin/invite-tokens' })} className="w-full">
              Manage Invite Tokens
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Registered Vehicles
            </CardTitle>
            <CardDescription>View all vehicles registered in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate({ to: '/vehicles' })} variant="outline" className="w-full">
              View All Vehicles
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
