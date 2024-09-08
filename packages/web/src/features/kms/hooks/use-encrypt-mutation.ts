import toast from 'solid-toast';
import { createMutation } from '@tanstack/solid-query';
import { encrypt } from '../api/encrypt';

export const useEncryptMutation = () => {
  return createMutation(() => ({
    mutationKey: ['encrypt'],
    mutationFn: encrypt,
    onSuccess: () => {
      toast.success('Successfully encrypted content.');
    },
  }));
};
