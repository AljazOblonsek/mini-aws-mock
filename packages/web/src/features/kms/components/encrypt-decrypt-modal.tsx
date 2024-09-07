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
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { EncryptDecryptAction, KmsEncryptDecryptRequestDto } from '@mini-aws-mock/shared';
import { convertValidationErrorsToPrettyErrors, PrettyError } from '@/common';
import { useEncryptDecryptMutation } from '../hooks/use-encrypt-decrypt-mutation';

type EncryptDecryptModalProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  action: EncryptDecryptAction;
  keyAlias: string;
  keyId: string;
};

export const EncryptDecryptModal = (props: EncryptDecryptModalProps) => {
  const [content, setContent] = createSignal('');
  const [errors, setErrors] = createSignal<PrettyError[]>([]);
  const encryptDecryptMutation = useEncryptDecryptMutation();

  const handleContentChange = async (value: string) => {
    setContent(value);

    const dto = plainToInstance(KmsEncryptDecryptRequestDto, {
      content: value,
      keyId: props.keyId,
      action: props.action,
    });
    const prettyErrors = convertValidationErrorsToPrettyErrors(await validate(dto));
    setErrors([...prettyErrors]);
  };

  const handleSubmitClick = async () => {
    const dto = plainToInstance(KmsEncryptDecryptRequestDto, {
      content: content(),
      keyId: props.keyId,
      action: props.action,
    });
    const r = await validate(dto);
    console.log(r);
    const prettyErrors = convertValidationErrorsToPrettyErrors(await validate(dto));
    if (prettyErrors.length > 0) {
      setErrors([...prettyErrors]);
      return;
    }

    encryptDecryptMutation.mutate(dto, {
      onSuccess: () => {
        setContent('');
        setErrors([]);
        props.setIsOpen(false);
      },
      onError: (error) => {
        setErrors([{ field: 'content', error: error.message }]);
      },
    });
  };

  return (
    <Dialog
      fullWidth
      open={props.isOpen}
      onClose={() => {
        setContent('');
        setErrors([]);
        props.setIsOpen(false);
      }}
    >
      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmitClick();
        }}
      >
        <DialogTitle>
          {props.action === EncryptDecryptAction.Encrypt ? 'Encrypt' : 'Decrypt'} Content with{' '}
          {props.keyAlias}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Content"
            fullWidth
            sx={{ mt: '1.7rem' }}
            value={content()}
            onChange={(e) => handleContentChange(e.target.value)}
            error={!!errors().find((e) => e.field === 'content')}
            helperText={errors().find((e) => e.field === 'content')?.error}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setContent('');
              setErrors([]);
              props.setIsOpen(false);
            }}
          >
            Close
          </Button>
          <Button type="submit">
            {props.action === EncryptDecryptAction.Encrypt ? 'Encrypt' : 'Decrypt'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
