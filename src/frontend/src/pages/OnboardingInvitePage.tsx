import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCompleteOnboarding } from '../hooks/useOnboarding';
import { useIsCallerAdmin } from '../hooks/useAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AppLogo from '../components/brand/AppLogo';
import { toast } from 'sonner';
import { AlertCircle, Shield, Info } from 'lucide-react';
import { getPersistedInviteToken, clearPersistedInviteToken } from '../utils/urlParams';

export default function OnboardingInvitePage() {
  const navigate = useNavigate();
  const completeOnboarding = useCompleteOnboarding();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const [inviteToken, setInviteToken] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Indonesia');

  // Auto-load invite token from session on mount
  useEffect(() => {
    const persistedToken = getPersistedInviteToken();
    if (persistedToken) {
      setInviteToken(persistedToken);
    }
  }, []);

  // Redirect admins away from onboarding page
  useEffect(() => {
    if (!adminLoading && isAdmin) {
      toast.info('Admin access detected. Redirecting to dashboard...');
      navigate({ to: '/admin' });
    }
  }, [isAdmin, adminLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Block form submission if user is admin
    if (isAdmin) {
      toast.error('Admins cannot complete invite-based onboarding');
      return;
    }

    if (!inviteToken.trim()) {
      toast.error('Invite token is required. Please use an invite link from an admin.');
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

      // Clear the persisted token after successful onboarding
      clearPersistedInviteToken();

      toast.success('Welcome! Your account has been created successfully');
      navigate({ to: '/' });
    } catch (error: any) {
      // Normalize backend error messages to English
      let errorMessage = 'Failed to complete registration';

      if (error.message) {
        const msg = error.message.toLowerCase();
        if (msg.includes('invalid') || msg.includes('expired')) {
          errorMessage = 'Invalid or expired invitation token';
        } else if (msg.includes('already used')) {
          errorMessage = 'This invitation token has already been used';
        } else if (msg.includes('already onboarded')) {
          errorMessage = 'You have already completed onboarding';
        } else {
          errorMessage = error.message;
        }
      }

      toast.error(errorMessage);
    }
  };

  // Show loading while checking admin status
  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/5 to-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Checking access...</p>
        </div>
      </div>
    );
  }

  // Show admin notice if user is admin (before redirect completes)
  if (isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/5 to-background p-4">
        <Card className="w-full max-w-lg border-2">
          <CardHeader>
            <div className="flex items-center gap-2 text-primary">
              <Shield className="h-6 w-6" />
              <CardTitle>Admin Access Detected</CardTitle>
            </div>
            <CardDescription>You have admin privileges and do not need to complete onboarding.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Redirecting to admin dashboard...</p>
            <Button onClick={() => navigate({ to: '/admin' })} className="w-full">
              Go to Admin Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show missing token guidance if no token is available
  const hasToken = inviteToken.trim().length > 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/5 to-background p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8 space-y-4">
          <AppLogo size="large" />
          <div>
            <h1 className="text-2xl font-bold">Welcome</h1>
            <p className="text-muted-foreground">Complete your profile to continue</p>
          </div>
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle>Account Registration</CardTitle>
            <CardDescription>Enter your details to create your account</CardDescription>
          </CardHeader>
          <CardContent>
            {!hasToken && (
              <Alert className="mb-4">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  You need an invitation link from an admin to register. Please contact an admin to get your invite
                  link.
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
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
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Your city"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Country"
                  required
                />
              </div>

              {completeOnboarding.isError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {completeOnboarding.error?.message || 'An error occurred during registration'}
                  </AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={completeOnboarding.isPending || !hasToken}>
                {completeOnboarding.isPending ? 'Processing...' : 'Register'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
