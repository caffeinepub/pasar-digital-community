import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Notification } from '../backend';

export function useGetMyNotifications() {
  const { actor, isFetching } = useActor();

  return useQuery<Notification[]>({
    queryKey: ['myNotifications'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyNotifications();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000, // Poll every 30 seconds
  });
}

export function useMarkNotificationRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.markNotificationRead(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myNotifications'] });
    },
  });
}
