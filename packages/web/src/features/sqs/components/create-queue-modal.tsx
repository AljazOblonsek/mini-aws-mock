import { SQS_QUEUE_CONSTANTS, SqsQueueCreateRequestDto } from '@mini-aws-mock/shared';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  TextField,
} from '@suid/material';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Setter, createSignal } from 'solid-js';
import { PrettyError, convertValidationErrorsToPrettyErrors } from '@/common';
import { useCreateQueueMutation } from '../hooks/use-create-queue-mutation';

type CreateQueueModalProps = {
  isOpen: boolean;
  setIsOpen: Setter<boolean>;
};

const DEFAULT_FORM_DATA: SqsQueueCreateRequestDto = {
  name: '',
  visibilityTimeout: SQS_QUEUE_CONSTANTS.DefaultVisibilityTimeoutInSeconds,
  receiveMessageWaitTimeSeconds: SQS_QUEUE_CONSTANTS.DefaultReceiveMessageWaitTimeInSeconds,
  maximumMessageSize: SQS_QUEUE_CONSTANTS.MaximumMessageSizeInBytes,
};

export const CreateQueueModal = (props: CreateQueueModalProps) => {
  const [formData, setFormData] = createSignal<SqsQueueCreateRequestDto>({ ...DEFAULT_FORM_DATA });
  const [errors, setErrors] = createSignal<PrettyError[]>([]);
  const createQueueMutation = useCreateQueueMutation();

  const handleFormDataChange = async (key: string, value: string) => {
    const newFormData = {
      ...formData(),
      [key]: value,
    };

    setFormData(newFormData);

    const dto = plainToInstance(SqsQueueCreateRequestDto, newFormData);
    const prettyErrors = convertValidationErrorsToPrettyErrors(await validate(dto));
    setErrors([...prettyErrors]);
  };

  const handleCreateClick = async () => {
    const dto = plainToInstance(SqsQueueCreateRequestDto, formData());
    const prettyErrors = convertValidationErrorsToPrettyErrors(await validate(dto));
    if (prettyErrors.length > 0) {
      setErrors([...prettyErrors]);
      return;
    }

    createQueueMutation.mutate(dto, {
      onSuccess: () => {
        setFormData({ ...DEFAULT_FORM_DATA });
        setErrors([]);
        props.setIsOpen(false);
      },
      onError: (error) => {
        setErrors([{ field: 'serverError', error: error.message }]);
      },
    });
  };

  return (
    <Dialog
      fullWidth
      open={props.isOpen}
      onClose={() => {
        setFormData({ ...DEFAULT_FORM_DATA });
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
        <DialogTitle>Create Queue</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            sx={{ mt: '1.7rem' }}
            value={formData().name}
            onChange={(e) => handleFormDataChange('name', e.target.value)}
            error={!!errors().find((e) => e.field === 'name')}
            helperText={errors().find((e) => e.field === 'name')?.error}
          />
          <TextField
            label="Visibility Timeout"
            fullWidth
            sx={{ mt: '1.7rem' }}
            value={formData().visibilityTimeout}
            onChange={(e) => handleFormDataChange('visibilityTimeout', e.target.value)}
            error={!!errors().find((e) => e.field === 'visibilityTimeout')}
            helperText={errors().find((e) => e.field === 'visibilityTimeout')?.error}
          />
          <TextField
            label="Receive Message Wait Time In Seconds"
            fullWidth
            sx={{ mt: '1.7rem' }}
            value={formData().receiveMessageWaitTimeSeconds}
            onChange={(e) => handleFormDataChange('receiveMessageWaitTimeSeconds', e.target.value)}
            error={!!errors().find((e) => e.field === 'receiveMessageWaitTimeSeconds')}
            helperText={errors().find((e) => e.field === 'receiveMessageWaitTimeSeconds')?.error}
          />
          <TextField
            label="Maximum Message Size In Bytes"
            fullWidth
            sx={{ mt: '1.7rem' }}
            value={formData().maximumMessageSize}
            onChange={(e) => handleFormDataChange('maximumMessageSize', e.target.value)}
            error={!!errors().find((e) => e.field === 'maximumMessageSize')}
            helperText={errors().find((e) => e.field === 'maximumMessageSize')?.error}
          />
          <FormHelperText error={!!errors().find((e) => e.field === 'serverError')}>
            {errors().find((e) => e.field === 'serverError')?.error}
          </FormHelperText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setFormData({ ...DEFAULT_FORM_DATA });
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
