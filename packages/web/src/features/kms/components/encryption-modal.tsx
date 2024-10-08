import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@suid/material';
import { createSignal } from 'solid-js';
import { plainToInstance } from 'class-transformer';
import { KmsDecryptRequestDto, KmsEncryptRequestDto } from '@mini-aws-mock/shared';
import { PrettyError } from '@/common';
import { useEncryptMutation } from '../hooks/use-encrypt-mutation';
import { useDecryptMutation } from '../hooks/use-decrypt-mutation';
import { EncryptionAction } from '../types/encryption-action';

type EncryptionModalProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  action: EncryptionAction;
  keyAlias: string;
  keyId: string;
};

export const EncryptionModal = (props: EncryptionModalProps) => {
  const [content, setContent] = createSignal('');
  const [errors, setErrors] = createSignal<PrettyError[]>([]);
  const [resultContent, setResultContent] = createSignal('');
  const encryptMutation = useEncryptMutation();
  const decryptMutation = useDecryptMutation();

  const handleContentChange = async (value: string) => {
    setErrors([]);
    setContent(value);

    if (!value) {
      setErrors([{ field: 'content', error: 'Content is required.' }]);
    }
  };

  const handleSubmitClick = async () => {
    if (!content()) {
      setErrors([{ field: 'content', error: 'Content is required.' }]);
      return;
    }

    if (props.action === 'encrypt') {
      const dto = plainToInstance(KmsEncryptRequestDto, {
        content: content(),
        keyId: props.keyId,
      });

      encryptMutation.mutate(dto, {
        onSuccess: (data) => {
          setContent('');
          setErrors([]);
          setResultContent(data.content);
        },
        onError: (error) => {
          setErrors([{ field: 'content', error: error.message }]);
        },
      });
    } else {
      const dto = plainToInstance(KmsDecryptRequestDto, {
        content: content(),
      });

      decryptMutation.mutate(dto, {
        onSuccess: (data) => {
          setContent('');
          setErrors([]);
          setResultContent(data.content);
        },
        onError: (error) => {
          setErrors([{ field: 'content', error: error.message }]);
        },
      });
    }
  };

  return (
    <Dialog
      fullWidth
      open={props.isOpen}
      onClose={() => {
        setContent('');
        setResultContent('');
        setErrors([]);
        props.setIsOpen(false);
      }}
    >
      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();

          if (resultContent()) {
            return;
          }

          handleSubmitClick();
        }}
      >
        <DialogTitle>
          {props.action === 'encrypt' ? 'Encrypt' : 'Decrypt'} Content with {props.keyAlias}
        </DialogTitle>
        <DialogContent>
          {resultContent() ? (
            <TextField
              label={`${props.action === 'encrypt' ? 'Encrypted' : 'Decrypted'} Content`}
              fullWidth
              multiline
              rows={4}
              disabled={true}
              sx={{ mt: '1.7rem' }}
              value={resultContent()}
            />
          ) : (
            <TextField
              label="Content"
              fullWidth
              multiline
              rows={4}
              sx={{ mt: '1.7rem' }}
              value={content()}
              onChange={(e) => handleContentChange(e.target.value)}
              error={!!errors().find((e) => e.field === 'content')}
              helperText={errors().find((e) => e.field === 'content')?.error}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setContent('');
              setResultContent('');
              setErrors([]);
              props.setIsOpen(false);
            }}
          >
            Close
          </Button>
          {!resultContent() && (
            <Button type="submit">{props.action === 'encrypt' ? 'Encrypt' : 'Decrypt'}</Button>
          )}
        </DialogActions>
      </Box>
    </Dialog>
  );
};
