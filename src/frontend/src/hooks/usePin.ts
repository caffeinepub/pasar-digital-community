import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';

export function useHasPIN() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ['hasPIN', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.hasPIN(null);
    },
    enabled: !!actor && !!identity && !actorFetching,
    retry: false,
  });
}

export function useSetupPIN() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pin: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setupPIN(pin);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hasPIN'] });
    },
  });
}

export function useUpdatePIN() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ oldPin, newPin }: { oldPin: string; newPin: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updatePIN(oldPin, newPin);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hasPIN'] });
    },
  });
}
