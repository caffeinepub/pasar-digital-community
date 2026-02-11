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
    const link = `${window.location.origin}/#/onboarding?inviteToken=${code}`;
    navigator.clipboard.writeText(link);
    toast.success('Invite link copied to clipboard');
  };

  if (adminLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Verifying admin access...</p>
          </div>
        </div>
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
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetchAdmin()} 
                className="ml-4"
                disabled={adminLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${adminLoading ? 'animate-spin' : ''}`} />
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
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Invite Tokens</h1>
          <p className="text-muted-foreground">Generate and manage invitation tokens for new users</p>
        </div>
        <Button onClick={handleGenerateCode} disabled={generateCode.isPending} className="gap-2">
          <Plus className="h-4 w-4" />
          {generateCode.isPending ? 'Generating...' : 'Generate Token'}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-chart-3" />
              Unused Tokens
            </CardTitle>
            <CardDescription>Available invitation tokens ready to be shared</CardDescription>
          </CardHeader>
          <CardContent>
            {codesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : unusedCodes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No unused tokens available</p>
                <p className="text-sm mt-2">Generate a new token to invite users</p>
              </div>
            ) : (
              <div className="space-y-2">
                {unusedCodes.map((code) => (
                  <div
                    key={code.code}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <code className="text-sm font-mono block truncate">{code.code}</code>
                      <p className="text-xs text-muted-foreground mt-1">
                        Created: {new Date(Number(code.created / BigInt(1000000))).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyLink(code.code)}
                      className="ml-2 shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-chart-2" />
              Used Tokens
            </CardTitle>
            <CardDescription>Tokens that have been redeemed by users</CardDescription>
          </CardHeader>
          <CardContent>
            {codesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : usedCodes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No tokens have been used yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {usedCodes.map((code) => (
                  <div
                    key={code.code}
                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/50"
                  >
                    <div className="flex-1 min-w-0">
                      <code className="text-sm font-mono block truncate opacity-60">{code.code}</code>
                      <p className="text-xs text-muted-foreground mt-1">
                        Created: {new Date(Number(code.created / BigInt(1000000))).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="secondary" className="ml-2 shrink-0">
                      Used
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tokens</CardTitle>
          <CardDescription>Complete list of all invitation tokens</CardDescription>
        </CardHeader>
        <CardContent>
          {codesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : !inviteCodes || inviteCodes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No tokens generated yet</p>
              <p className="text-sm mt-2">Click "Generate Token" to create your first invitation</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Token Code</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inviteCodes.map((code) => (
                    <TableRow key={code.code}>
                      <TableCell>
                        <code className="text-sm font-mono">{code.code}</code>
                      </TableCell>
                      <TableCell>
                        {new Date(Number(code.created / BigInt(1000000))).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={code.used ? 'secondary' : 'default'}>
                          {code.used ? 'Used' : 'Available'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {!code.used && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyLink(code.code)}
                            className="gap-2"
                          >
                            <Copy className="h-4 w-4" />
                            Copy Link
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
