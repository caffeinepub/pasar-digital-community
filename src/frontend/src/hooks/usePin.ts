import { useMutation } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useSetupPIN() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (pin: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setupPIN(pin);
    },
  });
}

export function useUpdatePIN() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ oldPin, newPin }: { oldPin: string; newPin: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updatePIN(oldPin, newPin);
    },
  });
}
