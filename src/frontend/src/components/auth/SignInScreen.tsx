import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLogo from '../brand/AppLogo';
import { Shield, Lock, Users } from 'lucide-react';

export default function SignInScreen() {
  const { login, loginStatus, isInitializing } = useInternetIdentity();

  const isLoggingIn = loginStatus === 'logging-in';
  const isDisabled = isLoggingIn || isInitializing;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/5 to-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <AppLogo size="large" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pasar Digital Community</h1>
            <p className="text-muted-foreground mt-2">Blockchain-Based Vehicle Security System</p>
          </div>
        </div>

        <Card className="border-2">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome</CardTitle>
            <CardDescription className="text-center">
              Sign in with Internet Identity to protect your vehicle
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-sm">
                <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Guaranteed Security</p>
                  <p className="text-muted-foreground">Vehicle data stored securely on blockchain</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <Lock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Theft Prevention</p>
                  <p className="text-muted-foreground">Ownership verification with PIN</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <Users className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Trusted Community</p>
                  <p className="text-muted-foreground">Report lost and found vehicles</p>
                </div>
              </div>
            </div>

            <Button onClick={login} disabled={isDisabled} className="w-full" size="lg">
              {isInitializing ? 'Initializing...' : isLoggingIn ? 'Connecting...' : 'Sign in with Internet Identity'}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              By signing in, you agree to use Internet Identity for secure and decentralized authentication
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
