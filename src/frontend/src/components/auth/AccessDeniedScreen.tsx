import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert, Info, Shield } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useCanClaimFirstAdmin, useClaimFirstAdmin } from '../../hooks/useAdmin';
import { toast } from 'sonner';

export default function AccessDeniedScreen() {
  const navigate = useNavigate();
  const { data: canClaimAdmin, isLoading: checkingClaim } = useCanClaimFirstAdmin();
  const claimAdmin = useClaimFirstAdmin();

  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    city: '',
    country: '',
  });

  const handleClaimAdmin = async () => {
    if (!profileData.fullName) {
      toast.error('Please enter your full name');
      return;
    }

    try {
      await claimAdmin.mutateAsync(profileData);
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
              <div className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertTitle>Claim Admin Access</AlertTitle>
                  <AlertDescription className="text-sm">
                    You are authorized to claim admin access. Please provide your profile information to continue.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                      placeholder="Enter your full name"
                      disabled={claimAdmin.isPending}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email (optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      placeholder="Enter your email"
                      disabled={claimAdmin.isPending}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={profileData.city}
                      onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                      placeholder="Enter your city"
                      disabled={claimAdmin.isPending}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={profileData.country}
                      onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                      placeholder="Enter your country"
                      disabled={claimAdmin.isPending}
                    />
                  </div>

                  <Button
                    onClick={handleClaimAdmin}
                    disabled={claimAdmin.isPending || !profileData.fullName}
                    className="w-full"
                    variant="default"
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    {claimAdmin.isPending ? 'Claiming admin access...' : 'Claim admin access'}
                  </Button>
                </div>
              </div>
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
              This page is restricted to administrators only. If you believe you should have access, please contact the
              system administrator.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
