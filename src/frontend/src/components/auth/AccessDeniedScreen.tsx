import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert, Info, Shield } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useCanClaimFirstAdmin, useClaimFirstAdmin } from '../../hooks/useAdmin';
import { toast } from 'sonner';

export default function AccessDeniedScreen() {
  const navigate = useNavigate();
  const { data: canClaimAdmin, isLoading: checkingClaim } = useCanClaimFirstAdmin();
  const claimAdmin = useClaimFirstAdmin();

  const handleClaimAdmin = async () => {
    try {
      await claimAdmin.mutateAsync();
      toast.success('Admin access claimed successfully!');
      // Navigate after a short delay to allow query invalidation to complete
      setTimeout(() => {
        navigate({ to: '/admin' });
      }, 500);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to claim admin access');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4">
        <Card className="border-destructive">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <ShieldAlert className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You do not have permission to access this page</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {canClaimAdmin && !checkingClaim && (
              <Button
                onClick={handleClaimAdmin}
                disabled={claimAdmin.isPending}
                className="w-full"
                variant="default"
              >
                <Shield className="mr-2 h-4 w-4" />
                {claimAdmin.isPending ? 'Claiming admin access...' : 'Claim admin access'}
              </Button>
            )}
            <Button onClick={() => navigate({ to: '/' })} variant="outline" className="w-full">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>

        {!canClaimAdmin && !checkingClaim && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Admin Information</AlertTitle>
            <AlertDescription className="text-sm">
              This page is restricted to administrators only. If you believe you should have access, please contact
              the system administrator.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
