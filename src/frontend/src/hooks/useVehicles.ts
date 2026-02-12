import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Vehicle } from '../backend';
import { ExternalBlob } from '../backend';

export function useGetUserVehicles() {
  const { actor, isFetching } = useActor();

  return useQuery<Vehicle[]>({
    queryKey: ['userVehicles'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserVehicles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetVehicle(vehicleId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Vehicle>({
    queryKey: ['vehicle', vehicleId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getVehicle(vehicleId);
    },
    enabled: !!actor && !isFetching && !!vehicleId,
  });
}

export function useRegisterVehicle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      engineNumber: string;
      chassisNumber: string;
      brand: string;
      model: string;
      year: bigint;
      location: string;
      vehiclePhoto: ExternalBlob;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.registerVehicle(
        data.engineNumber,
        data.chassisNumber,
        data.brand,
        data.model,
        data.year,
        data.location,
        data.vehiclePhoto
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userVehicles'] });
    },
  });
}

export function useRevokeVehicleOwnership() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ vehicleId, pin }: { vehicleId: string; pin: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.revokeVehicleOwnership(vehicleId, pin);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vehicle', variables.vehicleId] });
      queryClient.invalidateQueries({ queryKey: ['userVehicles'] });
    },
  });
}
