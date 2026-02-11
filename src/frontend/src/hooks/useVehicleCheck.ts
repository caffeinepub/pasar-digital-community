import { useMutation } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { VehicleCheckStatus } from '../backend';

export function useVehicleCheck() {
  const { actor } = useActor();

  return useMutation<VehicleCheckStatus, Error, string>({
    mutationFn: async (engineNumber: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.checkVehicle(engineNumber);
    },
  });
}
