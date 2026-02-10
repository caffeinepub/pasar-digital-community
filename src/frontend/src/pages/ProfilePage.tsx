import { useState, useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { User, Info } from 'lucide-react';

export default function ProfilePage() {
  const { identity } = useInternetIdentity();

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profil Saya</h1>
        <p className="text-muted-foreground">Informasi akun Anda</p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Profil Anda dikelola melalui sistem onboarding. Untuk memperbarui informasi, hubungi administrator.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informasi Akun
          </CardTitle>
          <CardDescription>Detail identitas blockchain Anda</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Principal ID</label>
            <div className="p-3 bg-muted rounded-md font-mono text-sm break-all">
              {identity?.getPrincipal().toString()}
            </div>
            <p className="text-xs text-muted-foreground">
              ID unik Anda di Internet Computer. Gunakan untuk verifikasi kepemilikan.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
