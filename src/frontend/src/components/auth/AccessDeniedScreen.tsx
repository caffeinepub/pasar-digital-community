import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert, Info } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

export default function AccessDeniedScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4">
        <Card className="border-destructive">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <ShieldAlert className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Akses Ditolak</CardTitle>
            <CardDescription>Anda tidak memiliki izin untuk mengakses halaman ini</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate({ to: '/' })} className="w-full">
              Kembali ke Dashboard
            </Button>
          </CardContent>
        </Card>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Informasi Admin</AlertTitle>
          <AlertDescription className="text-sm">
            Jika Anda adalah administrator pertama dan belum ada admin yang dikonfigurasi, silakan hubungi
            controller canister untuk menambahkan principal Anda sebagai admin menggunakan fungsi{' '}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">assignCallerUserRole</code>.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
