import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile } from '../backend';

export function useCompleteOnboarding() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      inviteToken,
      profile,
      isFirstAdminClaim = false,
    }: {
      inviteToken: string;
      profile: UserProfile;
      isFirstAdminClaim?: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');

      // Allow empty token only for first admin claim
      if (!isFirstAdminClaim && (!inviteToken || inviteToken.trim().length === 0)) {
        throw new Error('Invite token is required');
      }

      try {
        await actor.completeOnboarding(inviteToken, profile);
      } catch (error: any) {
        // Normalize backend errors for better UX
        const errorMessage = error?.message || String(error);
        
        // Map authorization-related errors to user-friendly messages
        if (errorMessage.includes('Only admins can assign user roles') || errorMessage.includes('Unauthorized')) {
          if (isFirstAdminClaim) {
            throw new Error('Unable to complete admin setup. Please try again or contact support.');
          } else {
            throw new Error('Registration failed. Please ensure you have a valid invitation link from an admin.');
          }
        }
        
        // Map other common backend errors to user-friendly messages
        if (errorMessage.includes('Invalid or expired invitation token')) {
          throw new Error('Invalid or expired invitation token. Please request a new invite link from an admin.');
        }
        if (errorMessage.includes('already used')) {
          throw new Error('This invitation token has already been used. Please request a new invite link.');
        }
        if (errorMessage.includes('Already onboarded')) {
          throw new Error('You have already completed onboarding');
        }
        
        // For any unmapped error, return a safe generic message
        throw new Error('Registration failed. Please try again or contact an admin for assistance.');
      }
    },
    onSuccess: () => {
      // Invalidate all relevant queries to update UI immediately
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['canClaimFirstAdmin'] });
    },
  });
}
