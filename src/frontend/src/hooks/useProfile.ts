import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { UserProfile, UserRole } from '../backend';

// Note: getCallerUserProfile and saveCallerUserProfile are provided by MixinAuthorization
// in the backend but are not exposed in the generated TypeScript interface.
// Using getCallerUserRole as a workaround to determine onboarding status.
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      
      try {
        // Check user role to determine if onboarded
        const role = await actor.getCallerUserRole();
        
        // If user has 'user' or 'admin' role, they've completed onboarding
        if (role === ('user' as UserRole) || role === ('admin' as UserRole)) {
          // Profile data exists in backend but cannot be retrieved via TypeScript interface
          // Return a placeholder indicating onboarding is complete
          return {
            fullName: 'Profile data set during onboarding',
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
      // Backend MixinAuthorization provides saveCallerUserProfile but it's not exposed in the TypeScript interface
      // Profile updates after onboarding are not currently supported via the generated interface
      throw new Error('Profile editing is not available. The backend method saveCallerUserProfile is not exposed in the TypeScript interface.');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}
