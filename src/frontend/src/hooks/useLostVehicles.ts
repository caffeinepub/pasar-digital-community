import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Vehicle } from '../backend';
import { Variant_stolen_lost_pawned } from '../backend';

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
    mutationFn: async ({
      vehicleId,
      category,
      reportNote,
    }: {
      vehicleId: string;
      category: Variant_stolen_lost_pawned;
      reportNote: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.markVehicleAsLostStolenOrPawned(vehicleId, category, reportNote);
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lostVehicles'] });
      queryClient.invalidateQueries({ queryKey: ['userVehicles'] });
      if (variables.vehicleId) {
        queryClient.invalidateQueries({ queryKey: ['vehicle', variables.vehicleId] });
      }
    },
  });
}
