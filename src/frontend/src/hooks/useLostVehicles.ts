import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Vehicle } from '../backend';

export function useGetLostVehicles() {
  const { actor, isFetching } = useActor();

  return useQuery<Vehicle[]>({
    queryKey: ['lostVehicles'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLostVehicles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMarkVehicleLost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ vehicleId, reportNote }: { vehicleId: string; reportNote: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.markVehicleLost(vehicleId, reportNote);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vehicle', variables.vehicleId] });
      queryClient.invalidateQueries({ queryKey: ['userVehicles'] });
      queryClient.invalidateQueries({ queryKey: ['lostVehicles'] });
    },
  });
}

export function useReportVehicleFound() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ vehicleId, finderReport }: { vehicleId: string; finderReport: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.reportVehicleFound(vehicleId, finderReport);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lostVehicles'] });
    },
  });
}
