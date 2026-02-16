import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';

export function useIsActivatedForVehicleRegistration() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ['vehicleRegistrationActivation', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return false;

      try {
        // Call the real backend method to check activation status
        // Backend already handles allowlist admin check internally
        const isActivated = await actor.isCallerActivatedForVehicleRegistration();
        return isActivated;
      } catch (error: any) {
        console.error('Error checking activation status:', error);
        // If there's an error, assume not activated for safety
        return false;
      }
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useRedeemActivationToken() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token: string) => {
      if (!actor) throw new Error('Actor not available');

      if (!token || token.trim().length === 0) {
        throw new Error('Activation token is required');
      }

      try {
        await actor.redeemActivationToken(token.trim());
      } catch (error: any) {
        const errorMessage = error?.message || String(error);

        if (errorMessage.includes('Invalid activation token')) {
          throw new Error('Invalid activation token. Please check the token and try again.');
        }
        if (errorMessage.includes('already redeemed')) {
          throw new Error('This activation token has already been used.');
        }
        if (errorMessage.includes('not valid for this user')) {
          throw new Error('This activation token is not valid for your account.');
        }

        throw new Error('Failed to redeem activation token. Please try again or contact admin.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicleRegistrationActivation'] });
      queryClient.invalidateQueries({ queryKey: ['userVehicles'] });
    },
  });
}
