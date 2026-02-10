import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLogo from '../brand/AppLogo';
import { Shield, Lock, Users } from 'lucide-react';

export default function SignInScreen() {
  const { login, loginStatus } = useInternetIdentity();

  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/5 to-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <AppLogo size="large" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pasar Digital Community</h1>
            <p className="text-muted-foreground mt-2">Sistem Keamanan Kendaraan Berbasis Blockchain</p>
          </div>
        </div>

        <Card className="border-2">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Selamat Datang</CardTitle>
            <CardDescription className="text-center">
              Masuk dengan Internet Identity untuk melindungi kendaraan Anda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-sm">
                <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Keamanan Terjamin</p>
                  <p className="text-muted-foreground">Data kendaraan tersimpan aman di blockchain</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <Lock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Pencegahan Pencurian</p>
                  <p className="text-muted-foreground">Verifikasi kepemilikan dengan PIN</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <Users className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Komunitas Terpercaya</p>
                  <p className="text-muted-foreground">Laporan kendaraan hilang dan ditemukan</p>
                </div>
              </div>
            </div>

            <Button onClick={login} disabled={isLoggingIn} className="w-full" size="lg">
              {isLoggingIn ? 'Menghubungkan...' : 'Masuk dengan Internet Identity'}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Dengan masuk, Anda menyetujui penggunaan Internet Identity untuk autentikasi yang aman dan terdesentralisasi
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
