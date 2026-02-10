import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCompleteOnboarding } from '../hooks/useOnboarding';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AppLogo from '../components/brand/AppLogo';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';

export default function OnboardingInvitePage() {
  const navigate = useNavigate();
  const completeOnboarding = useCompleteOnboarding();
  const [inviteToken, setInviteToken] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Indonesia');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inviteToken.trim()) {
      toast.error('Token undangan harus diisi');
      return;
    }

    try {
      await completeOnboarding.mutateAsync({
        inviteToken: inviteToken.trim(),
        profile: {
          fullName,
          email,
          city,
          country,
          onboarded: true,
        },
      });

      toast.success('Selamat datang! Akun Anda berhasil dibuat');
      navigate({ to: '/' });
    } catch (error: any) {
      toast.error(error.message || 'Gagal menyelesaikan pendaftaran');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/5 to-background p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8 space-y-4">
          <AppLogo size="large" />
          <div>
            <h1 className="text-2xl font-bold">Selamat Datang</h1>
            <p className="text-muted-foreground">Lengkapi profil Anda untuk melanjutkan</p>
          </div>
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle>Pendaftaran Akun</CardTitle>
            <CardDescription>Masukkan token undangan dan data diri Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inviteToken">Token Undangan *</Label>
                <Input
                  id="inviteToken"
                  value={inviteToken}
                  onChange={(e) => setInviteToken(e.target.value)}
                  placeholder="Masukkan token undangan"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Nama Lengkap *</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nama lengkap Anda"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Kota *</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Kota tempat tinggal"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Negara *</Label>
                <Input
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Negara"
                  required
                />
              </div>

              {completeOnboarding.isError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{completeOnboarding.error?.message || 'Terjadi kesalahan'}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={completeOnboarding.isPending}>
                {completeOnboarding.isPending ? 'Memproses...' : 'Daftar'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
