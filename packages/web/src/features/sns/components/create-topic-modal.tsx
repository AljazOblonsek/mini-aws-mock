import { SnsTopicCreateRequestDto } from '@mini-aws-mock/shared';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@suid/material';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Setter, createSignal } from 'solid-js';
import { PrettyError, convertValidationErrorsToPrettyErrors } from '@/common';
import { useCreateTopicMutation } from '../hooks/use-create-topic-mutation';

type CreateTopicModalProps = {
  isOpen: boolean;
  setIsOpen: Setter<boolean>;
};

export const CreateTopicModal = (props: CreateTopicModalProps) => {
  const [name, setName] = createSignal('');
  const [errors, setErrors] = createSignal<PrettyError[]>([]);
  const createTopicMutation = useCreateTopicMutation();

  const handleNameChange = async (value: string) => {
    setName(value);

    const dto = plainToInstance(SnsTopicCreateRequestDto, { name: value });
    const prettyErrors = convertValidationErrorsToPrettyErrors(await validate(dto));
    setErrors([...prettyErrors]);
  };

  const handleCreateClick = async () => {
    const dto = plainToInstance(SnsTopicCreateRequestDto, { name: name() });
    const prettyErrors = convertValidationErrorsToPrettyErrors(await validate(dto));
    if (prettyErrors.length > 0) {
      setErrors([...prettyErrors]);
      return;
    }

    createTopicMutation.mutate(dto, {
      onSuccess: () => {
        setName('');
        setErrors([]);
        props.setIsOpen(false);
      },
      onError: (error) => {
        setErrors([{ field: 'name', error: error.message }]);
      },
    });
  };

  return (
    <Dialog
      fullWidth
      open={props.isOpen}
      onClose={() => {
        setName('');
        setErrors([]);
        props.setIsOpen(false);
      }}
    >
      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleCreateClick();
        }}
      >
        <DialogTitle>Create Topic</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            sx={{ mt: '1.7rem' }}
            value={name()}
            onChange={(e) => handleNameChange(e.target.value)}
            error={!!errors().find((e) => e.field === 'name')}
            helperText={errors().find((e) => e.field === 'name')?.error}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setName('');
              setErrors([]);
              props.setIsOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button type="submit">Create</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
