import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { Vehicle } from '../backend';
import { ExternalBlob } from '../backend';
import { normalizeActorError } from '../utils/normalizeActorError';

export function useGetUserVehicles() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal().toString();

  return useQuery<Vehicle[]>({
    queryKey: ['userVehicles', principal],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getUserVehicles();
    },
    enabled: !!actor && !isFetching && !!principal,
    retry: 1,
    staleTime: 0,
    refetchOnMount: 'always',
  });
}

export function useGetVehicle(vehicleId: string) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal().toString();

  return useQuery<Vehicle>({
    queryKey: ['vehicle', vehicleId, principal],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getVehicle(vehicleId);
    },
    enabled: !!actor && !isFetching && !!vehicleId && !!principal,
  });
}

export function useRegisterVehicle() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const principal = identity?.getPrincipal().toString();

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
      queryClient.invalidateQueries({ queryKey: ['userVehicles', principal] });
      queryClient.invalidateQueries({ queryKey: ['userVehicles'] });
    },
  });
}

export function useRevokeVehicleOwnership() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const principal = identity?.getPrincipal().toString();

  return useMutation({
    mutationFn: async ({ vehicleId, pin }: { vehicleId: string; pin: string }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.revokeVehicleOwnership(vehicleId, pin);
      } catch (error) {
        const normalized = normalizeActorError(error, 'revoke-ownership');
        throw new Error(normalized.message);
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.removeQueries({ queryKey: ['vehicle', variables.vehicleId, principal] });
      queryClient.removeQueries({ queryKey: ['vehicle', variables.vehicleId] });
      
      queryClient.setQueryData<Vehicle[]>(['userVehicles', principal], (old) => {
        if (!old) return old;
        return old.filter((v) => v.id !== variables.vehicleId);
      });
      
      queryClient.invalidateQueries({ queryKey: ['userVehicles', principal] });
      queryClient.invalidateQueries({ queryKey: ['userVehicles'] });
    },
  });
}
