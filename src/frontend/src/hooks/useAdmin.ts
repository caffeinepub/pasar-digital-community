import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { isAllowlistedAdmin } from '../utils/adminAllowlist';
import type { Principal } from '@icp-sdk/core/principal';

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return false;

      const callerPrincipal = identity.getPrincipal().toString();

      if (isAllowlistedAdmin(callerPrincipal)) {
        const isAllowlistAdmin = await actor.isAllowlistAdmin();
        if (isAllowlistAdmin) return true;
      }

      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useCanClaimFirstAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['canClaimFirstAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isOnboardingAllowed();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetInviteCodes() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['inviteCodes'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getInviteCodes();
    },
    enabled: !!actor && !isFetching,
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

export function useGenerateActivationToken() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: Principal) => {
      if (!actor) throw new Error('Actor not available');
      
      try {
        return await actor.generateActivationToken(userId);
      } catch (error: any) {
        const errorMessage = error?.message || String(error);
        
        if (errorMessage.includes('Unauthorized') || errorMessage.includes('Only admins')) {
          throw new Error('Only admins can generate activation tokens');
        }
        
        throw new Error('Failed to generate activation token. Please try again.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activationTokens'] });
    },
  });
}

export function useGetSystemStats() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['systemStats'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getSystemStats();
    },
    enabled: !!actor && !isFetching,
  });
}
