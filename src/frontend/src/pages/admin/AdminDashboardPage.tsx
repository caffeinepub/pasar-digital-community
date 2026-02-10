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
      title: 'Total Kendaraan',
      value: stats?.totalVehicles.toString() || '0',
      icon: Car,
      color: 'text-primary',
    },
    {
      title: 'Laporan Hilang',
      value: stats?.totalLostReports.toString() || '0',
      icon: AlertTriangle,
      color: 'text-destructive',
    },
    {
      title: 'Laporan Ditemukan',
      value: stats?.totalFoundReports.toString() || '0',
      icon: CheckCircle,
      color: 'text-chart-2',
    },
    {
      title: 'Total Pengguna',
      value: stats?.totalUsers.toString() || '0',
      icon: Users,
      color: 'text-chart-4',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Kelola sistem dan pantau statistik</p>
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
              Token Undangan
            </CardTitle>
            <CardDescription>Kelola token undangan untuk pengguna baru</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate({ to: '/admin/invite-tokens' })} className="w-full">
              Kelola Token Undangan
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Kendaraan Terdaftar
            </CardTitle>
            <CardDescription>Lihat semua kendaraan yang terdaftar di sistem</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate({ to: '/vehicles' })} variant="outline" className="w-full">
              Lihat Semua Kendaraan
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
