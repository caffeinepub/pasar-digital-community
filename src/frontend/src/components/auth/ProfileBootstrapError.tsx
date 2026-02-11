import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import AppLogo from '../brand/AppLogo';

interface ProfileBootstrapErrorProps {
  error: Error | null;
  onRetry: () => void;
}

export default function ProfileBootstrapError({ error, onRetry }: ProfileBootstrapErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/5 to-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <AppLogo size="large" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Pasar Digital Community</h1>
          </div>
        </div>

        <Card className="border-2 border-destructive/50">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-xl">Gagal Memuat Profil</CardTitle>
            </div>
            <CardDescription>
              Terjadi kesalahan saat memuat data profil Anda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Detail Kesalahan</AlertTitle>
              <AlertDescription className="mt-2 text-sm">
                {error?.message || 'Kesalahan tidak diketahui'}
              </AlertDescription>
            </Alert>

            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Kemungkinan penyebab:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Koneksi internet tidak stabil</li>
                <li>Server sedang sibuk</li>
                <li>Sesi autentikasi bermasalah</li>
              </ul>
            </div>

            <Button onClick={onRetry} className="w-full" size="lg">
              <RefreshCw className="mr-2 h-4 w-4" />
              Coba Lagi
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Jika masalah berlanjut, coba logout dan login kembali
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
