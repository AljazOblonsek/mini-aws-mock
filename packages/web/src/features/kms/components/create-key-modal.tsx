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
import { KmsKeyCreateRequestDto } from '@mini-aws-mock/shared';
import { PrettyError, convertValidationErrorsToPrettyErrors } from '@/common';
import { useCreateKeyMutation } from '../hooks/use-create-key-mutation';

type CreateKeyModalProps = {
  isOpen: boolean;
  setIsOpen: Setter<boolean>;
};

const DEFAULT_FORM_DATA: KmsKeyCreateRequestDto = {
  alias: '',
  description: undefined,
};

export const CreateKeyModal = (props: CreateKeyModalProps) => {
  const [formData, setFormData] = createSignal<KmsKeyCreateRequestDto>({ ...DEFAULT_FORM_DATA });
  const [errors, setErrors] = createSignal<PrettyError[]>([]);
  const createKeyMutation = useCreateKeyMutation();

  const handleFormDataChange = async (key: string, value: string) => {
    const newFormData = {
      ...formData(),
      [key]: value,
    };

    setFormData(newFormData);

    const dto = plainToInstance(KmsKeyCreateRequestDto, newFormData);
    const prettyErrors = convertValidationErrorsToPrettyErrors(await validate(dto));
    setErrors([...prettyErrors]);
  };

  const handleCreateClick = async () => {
    const dto = plainToInstance(KmsKeyCreateRequestDto, formData());
    const prettyErrors = convertValidationErrorsToPrettyErrors(await validate(dto));
    if (prettyErrors.length > 0) {
      setErrors([...prettyErrors]);
      return;
    }

    createKeyMutation.mutate(dto, {
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
        <DialogTitle>Create Key</DialogTitle>
        <DialogContent>
          <TextField
            label="Alias"
            fullWidth
            sx={{ mt: '1.7rem' }}
            value={formData().alias}
            onChange={(e) => handleFormDataChange('alias', e.target.value)}
            error={!!errors().find((e) => e.field === 'alias')}
            helperText={errors().find((e) => e.field === 'alias')?.error}
          />
          <TextField
            label="Description"
            fullWidth
            sx={{ mt: '1.7rem' }}
            value={formData().description}
            onChange={(e) => handleFormDataChange('description', e.target.value)}
            error={!!errors().find((e) => e.field === 'description')}
            helperText={errors().find((e) => e.field === 'description')?.error}
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
