import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { InviteCode, Vehicle } from '../backend';

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
      }
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useGetSystemStats() {
  const { actor, isFetching } = useActor();
  const { data: isAdmin } = useIsCallerAdmin();

  return useQuery({
    queryKey: ['systemStats'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getSystemStats();
    },
    enabled: !!actor && !isFetching && !!isAdmin,
  });
}

export function useGetInviteCodes() {
  const { actor, isFetching } = useActor();
  const { data: isAdmin } = useIsCallerAdmin();

  return useQuery<InviteCode[]>({
    queryKey: ['inviteCodes'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getInviteCodes();
      } catch (error) {
        console.error('Error fetching invite codes:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!isAdmin,
  });
}

export function useGenerateInviteCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.generateInviteCode();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inviteCodes'] });
    },
  });
}

export function useGetRegisteredVehicles() {
  const { actor, isFetching } = useActor();
  const { data: isAdmin } = useIsCallerAdmin();

  return useQuery<Vehicle[]>({
    queryKey: ['registeredVehicles'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRegisteredVehicles();
    },
    enabled: !!actor && !isFetching && !!isAdmin,
  });
}
