import toast from 'solid-toast';
import { createMutation } from '@tanstack/solid-query';
import { EncryptDecryptAction } from '@mini-aws-mock/shared';
import { encryptDecrypt } from '../api/encrypt-decrypt';

export const useEncryptDecryptMutation = () => {
  return createMutation(() => ({
    mutationKey: ['encrypt-decrypt'],
    mutationFn: encryptDecrypt,
    onSuccess: (_, variables) => {
      toast.success(
        `Successfully ${variables.action === EncryptDecryptAction.Encrypt ? 'encrypted' : 'decrypted'} content.`
      );
    },
  }));
};
