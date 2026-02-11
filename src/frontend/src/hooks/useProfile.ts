import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile } from '../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      
      // Backend authorization mixin methods are not exposed in the public interface yet
      // We need to check if user has completed onboarding by checking their role
      try {
        const role = await actor.getCallerUserRole();
        // If user has 'user' role, they've completed onboarding
        // If they have 'guest' role, they need to onboard
        if (role === 'user' || role === 'admin') {
          // Return a placeholder profile indicating onboarding is complete
          // The actual profile data is stored in backend but not retrievable yet
          return {
            fullName: '',
            email: '',
            city: '',
            country: '',
            onboarded: true,
          };
        }
        return null; // Guest - needs onboarding
      } catch (error) {
        console.error('Error checking user profile:', error);
        return null;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      // Backend doesn't expose saveCallerUserProfile in public interface yet
      // Profile updates are handled during onboarding via completeOnboarding
      throw new Error('Profile updates are not available. Profile is set during onboarding.');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}
