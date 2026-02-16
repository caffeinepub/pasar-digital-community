import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile } from '../backend';
import { normalizeActorError } from '../utils/normalizeActorError';

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
      // Generate trace ID for this submission
      const traceId = `onboarding-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      console.log(`[${traceId}] 🚀 Starting onboarding mutation`, {
        isFirstAdminClaim,
        actorAvailable: !!actor,
        profile: { ...profile, email: profile.email.substring(0, 3) + '***' }, // Redact email in logs
      });

      if (!actor) {
        console.error(`[${traceId}] ❌ Actor not available before call attempt`);
        throw new Error('Actor not available');
      }

      console.log(`[${traceId}] 📡 Calling actor.completeOnboarding...`);

      try {
        await actor.completeOnboarding(inviteToken, profile);
        console.log(`[${traceId}] ✅ Onboarding completed successfully`);
      } catch (error: any) {
        // Log raw error for debugging
        console.error(`[${traceId}] ❌ Onboarding failed with raw error:`, {
          error,
          message: error?.message,
          stack: error?.stack,
          rawPayload: error,
        });

        // Normalize error for user display
        const normalized = normalizeActorError(error, 'onboarding');
        console.error(`[${traceId}] 📋 Normalized error:`, {
          message: normalized.message,
          technicalDetails: normalized.technicalDetails,
        });

        throw new Error(normalized.message);
      }
    },
    onMutate: (variables) => {
      console.log('🔄 Onboarding mutation started', {
        isFirstAdminClaim: variables.isFirstAdminClaim,
        actorAvailable: !!actor,
      });
    },
    onSuccess: (data, variables) => {
      console.log('✅ Onboarding mutation succeeded, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['canClaimFirstAdmin'] });
    },
    onError: (error, variables) => {
      console.error('❌ Onboarding mutation failed', {
        error,
        isFirstAdminClaim: variables.isFirstAdminClaim,
      });
    },
    onSettled: (data, error, variables) => {
      console.log('🏁 Onboarding mutation settled', {
        success: !error,
        isFirstAdminClaim: variables.isFirstAdminClaim,
      });
    },
  });
}
