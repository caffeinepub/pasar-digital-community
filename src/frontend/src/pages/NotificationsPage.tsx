import { useGetMyNotifications, useMarkNotificationRead } from '../hooks/useNotifications';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function NotificationsPage() {
  const { data: notifications, isLoading } = useGetMyNotifications();
  const markAsRead = useMarkNotificationRead();

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead.mutateAsync(notificationId);
      toast.success('Notifikasi ditandai sebagai dibaca');
    } catch (error: any) {
      toast.error(error.message || 'Gagal menandai notifikasi');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notifikasi</h1>
        <p className="text-muted-foreground">Pemberitahuan tentang kendaraan Anda</p>
      </div>

      {notifications && notifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Belum Ada Notifikasi</h3>
            <p className="text-muted-foreground">Anda akan menerima notifikasi di sini</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications?.map((notification) => (
            <Card key={notification.id} className={notification.read ? 'opacity-60' : 'border-primary'}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{notification.message}</CardTitle>
                      {!notification.read && <Badge variant="default">Baru</Badge>}
                    </div>
                    <CardDescription>
                      {new Date(Number(notification.timestamp / BigInt(1000000))).toLocaleString('id-ID')}
                    </CardDescription>
                  </div>
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAsRead(notification.id)}
                      disabled={markAsRead.isPending}
                      className="gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Tandai Dibaca
                    </Button>
                  )}
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
