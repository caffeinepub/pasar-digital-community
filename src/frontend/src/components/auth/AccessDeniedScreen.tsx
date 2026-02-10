import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

export default function AccessDeniedScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-destructive">
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
    </div>
  );
}
