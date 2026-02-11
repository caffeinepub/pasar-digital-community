import { useIsCallerAdmin, useGetInviteCodes, useGenerateInviteCode } from '../../hooks/useAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AccessDeniedScreen from '../../components/auth/AccessDeniedScreen';
import { toast } from 'sonner';
import { Plus, Copy, CheckCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react';

export default function AdminInviteTokensPage() {
  const { data: isAdmin, isLoading: adminLoading, error: adminError, refetch: refetchAdmin } = useIsCallerAdmin();
  const { data: inviteCodes, isLoading: codesLoading } = useGetInviteCodes();
  const generateCode = useGenerateInviteCode();

  const handleGenerateCode = async () => {
    try {
      const code = await generateCode.mutateAsync();
      toast.success('Invite token created successfully');
      handleCopyLink(code);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create token');
    }
  };

  const handleCopyLink = (code: string) => {
    const link = `${window.location.origin}#/onboarding?inviteToken=${code}`;
    navigator.clipboard.writeText(link);
    toast.success('Invite link copied to clipboard');
  };

  if (adminLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (adminError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Failed to verify admin status. Please try again.</span>
              <Button variant="outline" size="sm" onClick={() => refetchAdmin()} className="ml-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </div>
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invite Tokens</h1>
          <p className="text-muted-foreground">Manage invite tokens for new users</p>
        </div>
        <Button onClick={handleGenerateCode} disabled={generateCode.isPending} className="gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Create New Token
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inviteCodes?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Unused</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{unusedCodes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">{usedCodes.length}</div>
          </CardContent>
        </Card>
      </div>

      {unusedCodes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Available Tokens</CardTitle>
            <CardDescription>Unused tokens ready to be shared</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-6 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Code</TableHead>
                      <TableHead className="min-w-[120px]">Created</TableHead>
                      <TableHead className="min-w-[100px]">Status</TableHead>
                      <TableHead className="text-right min-w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unusedCodes.map((code) => (
                      <TableRow key={code.code}>
                        <TableCell className="font-mono text-sm break-all">{code.code}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {new Date(Number(code.created / BigInt(1000000))).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="gap-1 whitespace-nowrap">
                            <Clock className="h-3 w-3" />
                            Available
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleCopyLink(code.code)} className="gap-2">
                            <Copy className="h-4 w-4" />
                            <span className="hidden sm:inline">Copy Link</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {usedCodes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Used Tokens</CardTitle>
            <CardDescription>Tokens that have been redeemed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-6 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Code</TableHead>
                      <TableHead className="min-w-[120px]">Created</TableHead>
                      <TableHead className="min-w-[100px]">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usedCodes.map((code) => (
                      <TableRow key={code.code}>
                        <TableCell className="font-mono text-sm break-all">{code.code}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {new Date(Number(code.created / BigInt(1000000))).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="gap-1 whitespace-nowrap">
                            <CheckCircle className="h-3 w-3" />
                            Used
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
