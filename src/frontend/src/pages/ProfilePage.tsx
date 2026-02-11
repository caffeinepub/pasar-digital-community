import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { User, LogOut, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    try {
      await clear();
      queryClient.clear();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">Your account information and settings</p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Your profile information is managed through the onboarding system. Profile details are set when you first
          register and are stored securely in the backend.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Internet Identity
          </CardTitle>
          <CardDescription>Your blockchain identity on the Internet Computer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Principal ID</label>
            <div className="p-3 bg-muted rounded-md font-mono text-sm break-all">
              {identity?.getPrincipal().toString() || 'Not available'}
            </div>
            <p className="text-xs text-muted-foreground">
              Your unique ID on the Internet Computer. Use this for ownership verification and vehicle registration.
            </p>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Account Actions</CardTitle>
          <CardDescription>Manage your session</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="w-full sm:w-auto"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
