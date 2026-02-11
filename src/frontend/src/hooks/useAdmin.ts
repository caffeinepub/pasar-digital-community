import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { InviteCode, Vehicle, UserRole } from '../backend';

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return await actor.isCallerAdmin();
    },
    enabled: !!actor && !!identity && !isFetching,
    retry: 2,
    retryDelay: 1000,
  });
}

export function useCanClaimFirstAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['canClaimFirstAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        // Use the dedicated backend method to check if onboarding is allowed
        // This properly handles the allowlist admin exclusion
        return await actor.isOnboardingAllowed();
      } catch (error) {
        console.error('Error checking first admin claim:', error);
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
    mutationFn: async (profile: { fullName: string; email: string; city: string; country: string }) => {
      if (!actor) throw new Error('Actor not available');
      
      // Use completeOnboarding with empty invite token for allowlist admin
      // The backend will recognize the allowlist admin and skip invite validation
      await actor.completeOnboarding('', {
        fullName: profile.fullName,
        email: profile.email,
        city: profile.city,
        country: profile.country,
        onboarded: true,
      });
    },
    onSuccess: () => {
      // Invalidate all relevant queries to update UI immediately
      queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['canClaimFirstAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
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
