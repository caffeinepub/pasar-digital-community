import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useIsActivatedForVehicleRegistration() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['vehicleRegistrationActivation'],
    queryFn: async () => {
      if (!actor) return false;
      
      try {
        // Try to get user vehicles - if activation is required, this will fail
        // But we need a dedicated backend method for this
        // For now, we'll return true and let the registration fail with proper error
        return true;
      } catch (error: any) {
        if (error?.message?.includes('not activated')) {
          return false;
        }
        throw error;
      }
    },
    enabled: !!actor && !isFetching,
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
