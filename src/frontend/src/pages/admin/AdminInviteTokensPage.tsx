import { useIsCallerAdmin, useGetInviteCodes, useGenerateInviteCode } from '../../hooks/useAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AccessDeniedScreen from '../../components/auth/AccessDeniedScreen';
import { toast } from 'sonner';
import { Plus, Copy, CheckCircle, Clock } from 'lucide-react';

export default function AdminInviteTokensPage() {
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: inviteCodes, isLoading: codesLoading } = useGetInviteCodes();
  const generateCode = useGenerateInviteCode();

  const handleGenerateCode = async () => {
    try {
      const code = await generateCode.mutateAsync();
      toast.success('Token undangan berhasil dibuat');
      handleCopyLink(code);
    } catch (error: any) {
      toast.error(error.message || 'Gagal membuat token');
    }
  };

  const handleCopyLink = (code: string) => {
    const link = `${window.location.origin}#/onboarding?inviteToken=${code}`;
    navigator.clipboard.writeText(link);
    toast.success('Link undangan disalin ke clipboard');
  };

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

  const unusedCodes = inviteCodes?.filter((code) => !code.used) || [];
  const usedCodes = inviteCodes?.filter((code) => code.used) || [];

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Token Undangan</h1>
          <p className="text-muted-foreground">Kelola token undangan untuk pengguna baru</p>
        </div>
        <Button onClick={handleGenerateCode} disabled={generateCode.isPending} className="gap-2">
          <Plus className="h-4 w-4" />
          Buat Token Baru
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Token</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inviteCodes?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Belum Digunakan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{unusedCodes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Sudah Digunakan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">{usedCodes.length}</div>
          </CardContent>
        </Card>
      </div>

      {unusedCodes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Token Tersedia</CardTitle>
            <CardDescription>Token yang belum digunakan</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Dibuat</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unusedCodes.map((code) => (
                  <TableRow key={code.code}>
                    <TableCell className="font-mono text-sm">{code.code}</TableCell>
                    <TableCell>{new Date(Number(code.created / BigInt(1000000))).toLocaleDateString('id-ID')}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="gap-1">
                        <Clock className="h-3 w-3" />
                        Tersedia
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleCopyLink(code.code)} className="gap-2">
                        <Copy className="h-4 w-4" />
                        Salin Link
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {usedCodes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Token Terpakai</CardTitle>
            <CardDescription>Token yang sudah digunakan</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Dibuat</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usedCodes.map((code) => (
                  <TableRow key={code.code}>
                    <TableCell className="font-mono text-sm">{code.code}</TableCell>
                    <TableCell>{new Date(Number(code.created / BigInt(1000000))).toLocaleDateString('id-ID')}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Digunakan
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
