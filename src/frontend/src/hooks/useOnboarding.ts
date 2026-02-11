import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile } from '../backend';

export function useCompleteOnboarding() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ inviteToken, profile }: { inviteToken: string; profile: UserProfile }) => {
      if (!actor) throw new Error('Actor not available');
      if (!inviteToken || inviteToken.trim().length === 0) {
        throw new Error('Invite token is required');
      }
      await actor.completeOnboarding(inviteToken, profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}
