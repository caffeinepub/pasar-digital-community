import { useState } from 'react';
import { useIsCallerAdmin, useGenerateActivationToken } from '../../hooks/useAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AccessDeniedScreen from '../../components/auth/AccessDeniedScreen';
import { toast } from 'sonner';
import { Copy, AlertCircle, RefreshCw, Key, User } from 'lucide-react';
import { Principal } from '@icp-sdk/core/principal';

export default function AdminInviteTokensPage() {
  const { data: isAdmin, isLoading: adminLoading, error: adminError, refetch: refetchAdmin } = useIsCallerAdmin();
  const generateActivationToken = useGenerateActivationToken();
  const [userPrincipal, setUserPrincipal] = useState('');
  const [generatedToken, setGeneratedToken] = useState('');

  const handleGenerateActivationToken = async () => {
    if (!userPrincipal.trim()) {
      toast.error('Please enter a user principal');
      return;
    }

    try {
      const principal = Principal.fromText(userPrincipal.trim());
      const token = await generateActivationToken.mutateAsync(principal);
      setGeneratedToken(token);
      toast.success('Activation token generated successfully');
    } catch (error: any) {
      if (error.message.includes('Invalid principal')) {
        toast.error('Invalid principal format. Please check and try again.');
      } else {
        toast.error(error.message || 'Failed to generate activation token');
      }
    }
  };

  const handleCopyToken = () => {
    if (generatedToken) {
      navigator.clipboard.writeText(generatedToken);
      toast.success('Activation token copied to clipboard');
    }
  };

  const handleCopyRedemptionInstructions = () => {
    if (generatedToken) {
      const instructions = `Your vehicle registration activation token: ${generatedToken}\n\nTo activate:\n1. Log in to your account\n2. Go to Profile page\n3. Find "Vehicle Registration Activation" section\n4. Enter this token and click "Redeem Token"`;
      navigator.clipboard.writeText(instructions);
      toast.success('Instructions copied to clipboard');
    }
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
              <Button variant="outline" size="sm" onClick={() => refetchAdmin()}>
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Token Management</h1>
          <p className="text-muted-foreground mt-1">Generate and manage activation tokens for users</p>
        </div>

        <Tabs defaultValue="activation" className="w-full">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="activation">Activation Tokens</TabsTrigger>
          </TabsList>

          <TabsContent value="activation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Generate Activation Token
                </CardTitle>
                <CardDescription>
                  Create an activation token for a specific user to enable vehicle registration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <User className="h-4 w-4" />
                  <AlertDescription>
                    Enter the user's Internet Identity Principal to generate their activation token. The user can find
                    their Principal ID on their Profile page.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="userPrincipal">User Principal ID *</Label>
                  <Input
                    id="userPrincipal"
                    value={userPrincipal}
                    onChange={(e) => setUserPrincipal(e.target.value)}
                    placeholder="Enter user principal (e.g., xxxxx-xxxxx-xxxxx-xxxxx-xxx)"
                    disabled={generateActivationToken.isPending}
                  />
                  <p className="text-xs text-muted-foreground">
                    The user can find their Principal ID on their Profile page
                  </p>
                </div>

                <Button
                  onClick={handleGenerateActivationToken}
                  disabled={generateActivationToken.isPending || !userPrincipal.trim()}
                  className="w-full"
                >
                  {generateActivationToken.isPending ? 'Generating...' : 'Generate Activation Token'}
                </Button>

                {generatedToken && (
                  <div className="space-y-3 pt-4 border-t">
                    <div className="space-y-2">
                      <Label>Generated Token</Label>
                      <div className="flex gap-2">
                        <Input value={generatedToken} readOnly className="font-mono text-sm" />
                        <Button onClick={handleCopyToken} variant="outline" size="icon">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <Button onClick={handleCopyRedemptionInstructions} variant="secondary" className="w-full">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Instructions for User
                    </Button>

                    <Alert className="border-green-600/50 bg-green-600/5">
                      <AlertDescription className="text-sm">
                        Share this token with the user. They can redeem it on their Profile page to activate vehicle
                        registration.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
