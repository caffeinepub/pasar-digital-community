import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { InviteCode, Vehicle, UserRole } from '../backend';

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

export function useCanClaimFirstAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['canClaimFirstAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        // Check if caller is already admin
        const isAdmin = await actor.isCallerAdmin();
        if (isAdmin) return false;

        // Try to get system stats - if it fails with unauthorized, no admin exists yet
        await actor.getSystemStats();
        return false; // Admin exists
      } catch (error: any) {
        // If error contains "Unauthorized" or "Only admins", no admin exists yet
        if (error?.message?.includes('Unauthorized') || error?.message?.includes('Only admins')) {
          return true;
        }
        return false;
      }
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useClaimFirstAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      
      // Get the caller's principal from the actor's identity
      const identity = (actor as any)._identity;
      if (!identity) throw new Error('Identity not available');
      
      const callerPrincipal = identity.getPrincipal();
      
      // Assign caller as admin using the backend method
      await actor.assignCallerUserRole(callerPrincipal, 'admin' as UserRole);
    },
    onSuccess: () => {
      // Invalidate admin check to update UI immediately
      queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['canClaimFirstAdmin'] });
    },
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
