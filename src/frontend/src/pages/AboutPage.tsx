import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Shield, Lock, Users, ArrowLeft } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import AppLogo from '../components/brand/AppLogo';

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => navigate({ to: '/' })}
        className="mb-6 gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali
      </Button>

      <div className="space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <AppLogo size="large" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Pasar Digital Community</h1>
            <p className="text-xl text-muted-foreground mt-2">Sistem Keamanan Kendaraan Berbasis Blockchain</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tentang Aplikasi</CardTitle>
            <CardDescription>
              Platform keamanan kendaraan yang memanfaatkan teknologi blockchain Internet Computer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose prose-sm max-w-none">
              <p>
                Pasar Digital Community adalah aplikasi inovatif yang dirancang untuk meningkatkan keamanan kendaraan
                melalui teknologi blockchain. Aplikasi ini memungkinkan pemilik kendaraan untuk mendaftarkan,
                melacak, dan melindungi aset mereka dengan sistem yang terdesentralisasi dan aman.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex flex-col items-center text-center p-4 rounded-lg bg-accent/10">
                <Shield className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-semibold mb-1">Keamanan Terjamin</h3>
                <p className="text-sm text-muted-foreground">
                  Data tersimpan aman di blockchain yang tidak dapat diubah
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-4 rounded-lg bg-accent/10">
                <Lock className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-semibold mb-1">Verifikasi PIN</h3>
                <p className="text-sm text-muted-foreground">
                  Sistem PIN untuk transfer kepemilikan yang aman
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-4 rounded-lg bg-accent/10">
                <Users className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-semibold mb-1">Komunitas Aktif</h3>
                <p className="text-sm text-muted-foreground">
                  Laporan kendaraan hilang dan ditemukan oleh komunitas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hubungi Admin</CardTitle>
            <CardDescription>
              Untuk pertanyaan, bantuan, atau informasi lebih lanjut
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">WhatsApp</p>
                <a
                  href="https://wa.me/6289502436075"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-semibold hover:text-primary transition-colors"
                >
                  089502436075
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <a
                  href="mailto:pasardigital.ina@gmail.com"
                  className="text-lg font-semibold hover:text-primary transition-colors break-all"
                >
                  pasardigital.ina@gmail.com
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fitur Utama</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">1</span>
                </div>
                <div>
                  <p className="font-medium">Registrasi Kendaraan</p>
                  <p className="text-sm text-muted-foreground">
                    Daftarkan kendaraan Anda dengan nomor mesin, rangka, dan foto
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">2</span>
                </div>
                <div>
                  <p className="font-medium">Laporan Kehilangan</p>
                  <p className="text-sm text-muted-foreground">
                    Laporkan kendaraan hilang dan terima notifikasi jika ditemukan
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">3</span>
                </div>
                <div>
                  <p className="font-medium">Transfer Kepemilikan</p>
                  <p className="text-sm text-muted-foreground">
                    Transfer kendaraan dengan aman menggunakan kode transfer dan PIN
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">4</span>
                </div>
                <div>
                  <p className="font-medium">Notifikasi Real-time</p>
                  <p className="text-sm text-muted-foreground">
                    Dapatkan notifikasi langsung untuk aktivitas penting
                  </p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
