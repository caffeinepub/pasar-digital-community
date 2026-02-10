import { useGetUserVehicles } from '../hooks/useVehicles';
import { useGetLostVehicles } from '../hooks/useLostVehicles';
import { useGetMyNotifications } from '../hooks/useNotifications';
import { useIsCallerAdmin } from '../hooks/useAdmin';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Car, AlertTriangle, Bell, Plus, Shield } from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: vehicles, isLoading: vehiclesLoading } = useGetUserVehicles();
  const { data: lostVehicles, isLoading: lostLoading } = useGetLostVehicles();
  const { data: notifications, isLoading: notificationsLoading } = useGetMyNotifications();
  const { data: isAdmin } = useIsCallerAdmin();

  const unreadNotifications = notifications?.filter((n) => !n.read).length || 0;

  const stats = [
    {
      title: 'Kendaraan Saya',
      value: vehicles?.length || 0,
      icon: Car,
      description: 'Total kendaraan terdaftar',
      action: () => navigate({ to: '/vehicles' }),
      color: 'text-primary',
    },
    {
      title: 'Kendaraan Hilang',
      value: lostVehicles?.length || 0,
      icon: AlertTriangle,
      description: 'Laporan kendaraan hilang',
      action: () => navigate({ to: '/lost-vehicles' }),
      color: 'text-destructive',
    },
    {
      title: 'Notifikasi',
      value: unreadNotifications,
      icon: Bell,
      description: 'Notifikasi belum dibaca',
      action: () => navigate({ to: '/notifications' }),
      color: 'text-chart-2',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Selamat datang di Pasar Digital Community</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title} className="cursor-pointer hover:border-primary transition-colors" onClick={stat.action}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
            <CardDescription>Kelola kendaraan dan keamanan Anda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={() => navigate({ to: '/vehicles/register' })} className="w-full justify-start gap-2">
              <Plus className="h-4 w-4" />
              Daftarkan Kendaraan Baru
            </Button>
            <Button
              onClick={() => navigate({ to: '/vehicles' })}
              variant="outline"
              className="w-full justify-start gap-2"
            >
              <Car className="h-4 w-4" />
              Lihat Kendaraan Saya
            </Button>
            <Button
              onClick={() => navigate({ to: '/lost-vehicles' })}
              variant="outline"
              className="w-full justify-start gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              Cek Kendaraan Hilang
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informasi Sistem</CardTitle>
            <CardDescription>Status dan keamanan akun Anda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Status Akun</span>
              <span className="text-sm font-medium text-primary">Aktif</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Keamanan PIN</span>
              <Button variant="link" size="sm" onClick={() => navigate({ to: '/security' })} className="h-auto p-0">
                Kelola
              </Button>
            </div>
            {isAdmin && (
              <div className="pt-2 border-t">
                <Button onClick={() => navigate({ to: '/admin' })} variant="secondary" className="w-full gap-2">
                  <Shield className="h-4 w-4" />
                  Panel Admin
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
