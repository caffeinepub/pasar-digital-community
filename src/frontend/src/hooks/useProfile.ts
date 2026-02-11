import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { UserProfile, UserRole } from '../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      
      try {
        // Backend's getCallerUserProfile is not exposed in the TypeScript interface
        // Use getCallerUserRole as a workaround to determine onboarding status
        const role = await actor.getCallerUserRole();
        
        // If user has 'user' or 'admin' role, they've completed onboarding
        // If they have 'guest' role, they need to onboard
        if (role === ('user' as UserRole) || role === ('admin' as UserRole)) {
          // Return a placeholder profile indicating onboarding is complete
          // The actual profile data is stored in backend but not retrievable via current interface
          return {
            fullName: '',
            email: '',
            city: '',
            country: '',
            onboarded: true,
          };
        }
        
        // Guest role - needs onboarding
        return null;
      } catch (error: any) {
        // If error indicates no role/profile, return null (needs onboarding)
        if (error.message?.includes('not found') || error.message?.includes('No profile')) {
          return null;
        }
        // For other errors, throw to trigger error state
        throw error;
      }
    },
    enabled: !!actor && !!identity && !actorFetching,
    retry: 1,
    retryDelay: 1000,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && !!identity && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      // Backend's saveCallerUserProfile is not exposed in the TypeScript interface
      // Profile updates are handled during onboarding via completeOnboarding
      throw new Error('Profile updates are not available. Profile is set during onboarding.');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}
