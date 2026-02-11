import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useRedeemActivationToken } from '../../hooks/useVehicleRegistrationActivation';
import { toast } from 'sonner';
import { CheckCircle, XCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { Link } from '@tanstack/react-router';

interface VehicleRegistrationActivationCardProps {
  isActivated: boolean;
  isLoading?: boolean;
}

export default function VehicleRegistrationActivationCard({
  isActivated,
  isLoading = false,
}: VehicleRegistrationActivationCardProps) {
  const [activationToken, setActivationToken] = useState('');
  const redeemToken = useRedeemActivationToken();

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!activationToken.trim()) {
      toast.error('Please enter an activation token');
      return;
    }

    try {
      await redeemToken.mutateAsync(activationToken);
      toast.success('Activation successful! You can now register vehicles.');
      setActivationToken('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to redeem activation token');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Registration Activation</CardTitle>
          <CardDescription>Loading activation status...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-10 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vehicle Registration Activation</CardTitle>
        <CardDescription>Manage your vehicle registration access</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            {isActivated ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium">Status:</span>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-orange-600" />
                <span className="font-medium">Status:</span>
              </>
            )}
          </div>
          <Badge variant={isActivated ? 'default' : 'secondary'} className={isActivated ? 'bg-green-600' : ''}>
            {isActivated ? 'Activated' : 'Not Activated'}
          </Badge>
        </div>

        {!isActivated && (
          <>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Vehicle registration is not activated for your account. Please contact the admin to receive an
                activation token.
              </AlertDescription>
            </Alert>

            <form onSubmit={handleRedeem} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="activationToken">Activation Token</Label>
                <Input
                  id="activationToken"
                  value={activationToken}
                  onChange={(e) => setActivationToken(e.target.value)}
                  placeholder="Enter your activation token"
                  disabled={redeemToken.isPending}
                />
              </div>

              <Button type="submit" className="w-full" disabled={redeemToken.isPending || !activationToken.trim()}>
                {redeemToken.isPending ? 'Redeeming...' : 'Redeem Token'}
              </Button>
            </form>

            <div className="pt-2 border-t">
              <Link to="/about" className="flex items-center gap-2 text-sm text-primary hover:underline">
                <ExternalLink className="h-4 w-4" />
                Contact Admin for Activation
              </Link>
            </div>
          </>
        )}

        {isActivated && (
          <Alert className="border-green-600/50 bg-green-600/5">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">
              Your account is activated. You can register vehicles.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
