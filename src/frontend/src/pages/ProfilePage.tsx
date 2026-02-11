import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useProfile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LogOut, User, Mail, MapPin, Globe, Info } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export default function ProfilePage() {
  const { clear, identity } = useInternetIdentity();
  const { data: userProfile, isLoading } = useGetCallerUserProfile();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your account information</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your profile details from onboarding</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {userProfile ? (
              <>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Your profile information was set during onboarding. Profile editing will be available in a future
                    update when the backend methods are exposed in the TypeScript interface.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name
                  </Label>
                  <p className="text-sm font-medium text-muted-foreground">Set during onboarding</p>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <p className="text-sm font-medium text-muted-foreground">Set during onboarding</p>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    City
                  </Label>
                  <p className="text-sm font-medium text-muted-foreground">Set during onboarding</p>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Country
                  </Label>
                  <p className="text-sm font-medium text-muted-foreground">Set during onboarding</p>
                </div>
              </>
            ) : (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Profile information is not available. Please complete onboarding.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Internet Identity</CardTitle>
            <CardDescription>Your decentralized authentication principal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Principal ID</Label>
              <p className="text-xs font-mono bg-muted p-2 rounded break-all">
                {identity?.getPrincipal().toString()}
              </p>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Your Principal ID is your unique identifier on the Internet Computer blockchain. Keep it safe and never
                share your Internet Identity credentials.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
            <CardDescription>Manage your session</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleLogout} variant="destructive" className="w-full">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
