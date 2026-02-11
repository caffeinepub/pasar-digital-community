import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCompleteOnboarding } from '../hooks/useOnboarding';
import { useCanClaimFirstAdmin } from '../hooks/useAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AppLogo from '../components/brand/AppLogo';
import { toast } from 'sonner';
import { AlertCircle, Info } from 'lucide-react';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const completeOnboarding = useCompleteOnboarding();
  const { data: canClaimFirstAdmin, isLoading: checkingAdminEligibility } = useCanClaimFirstAdmin();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Indonesia');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('📝 Onboarding form submitted', {
      fullName: fullName.substring(0, 3) + '***',
      email: email.substring(0, 3) + '***',
      city,
      country,
    });

    const isFirstAdminClaim = canClaimFirstAdmin === true;

    try {
      await completeOnboarding.mutateAsync({
        inviteToken: '',
        profile: {
          fullName,
          email,
          city,
          country,
          onboarded: true,
        },
        isFirstAdminClaim,
      });

      toast.success('Welcome! Your account has been created successfully');

      if (isFirstAdminClaim) {
        navigate({ to: '/admin' });
      } else {
        navigate({ to: '/' });
      }
    } catch (error: any) {
      // Error is already logged and normalized in useOnboarding hook
      // The error will be displayed via completeOnboarding.error below
      console.error('🔴 Submit handler caught error:', error.message);
    }
  };

  const isFirstAdminClaim = canClaimFirstAdmin === true;

  if (checkingAdminEligibility) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/5 to-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

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
            <CardDescription>
              {isFirstAdminClaim ? 'Set up your admin account' : 'Enter your details to create your account'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isFirstAdminClaim && (
              <Alert className="mb-4 border-primary/50 bg-primary/5">
                <Info className="h-4 w-4 text-primary" />
                <AlertDescription className="text-primary">
                  You are setting up the admin account. No invite token required.
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

              {completeOnboarding.isError && completeOnboarding.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{completeOnboarding.error.message}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={completeOnboarding.isPending}>
                {completeOnboarding.isPending ? 'Registering...' : 'Register'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
