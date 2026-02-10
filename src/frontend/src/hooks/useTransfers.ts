import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useInitiateTransfer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ vehicleId, pin }: { vehicleId: string; pin: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.initiateTransfer(vehicleId, pin);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vehicle', variables.vehicleId] });
      queryClient.invalidateQueries({ queryKey: ['userVehicles'] });
    },
  });
}

export function useAcceptTransfer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transferCode: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.acceptTransfer(transferCode);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userVehicles'] });
    },
  });
}
