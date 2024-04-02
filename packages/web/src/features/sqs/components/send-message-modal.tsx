import {
  MessageAttributeRequestDto,
  SqsQueueDto,
  SqsSendMessageRequestDto,
} from '@mini-aws-mock/shared';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  IconButton,
  TextField,
  Typography,
} from '@suid/material';
import { Delete as DeleteIcon } from '@suid/icons-material';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Index, Setter, createSignal } from 'solid-js';
import { PrettyError, convertValidationErrorsToPrettyErrors } from '@/common';
import { useSendMessageMutation } from '../hooks/use-send-message-mutation';

type SendMessageModalProps = {
  selectedQueue?: SqsQueueDto;
  setSelectedQueue: Setter<SqsQueueDto | undefined>;
};

const DEFAULT_FORM_DATA: SqsSendMessageRequestDto = {
  queueUrl: '',
  messageBody: '',
  delaySeconds: 0,
  messageAttributes: [],
};

export const SendMessageModal = (props: SendMessageModalProps) => {
  const [formData, setFormData] = createSignal<SqsSendMessageRequestDto>({ ...DEFAULT_FORM_DATA });
  const [messageAttributes, setMessageAttributes] = createSignal<MessageAttributeRequestDto[]>([
    { name: '', value: '' },
  ]);
  const [errors, setErrors] = createSignal<PrettyError[]>([]);
  const isOpen = () => !!props.selectedQueue;
  const sendMessageMutation = useSendMessageMutation();

  const handleFormDataChange = async (key: string, value: string) => {
    const newFormData = {
      ...formData(),
      [key]: value,
    };

    setFormData(newFormData);

    const dto = plainToInstance(SqsSendMessageRequestDto, newFormData);
    const prettyErrors = convertValidationErrorsToPrettyErrors(await validate(dto));
    setErrors([...prettyErrors]);
  };

  const handleSendClick = async () => {
    const dto = plainToInstance(SqsSendMessageRequestDto, {
      ...formData(),
      queueUrl: props.selectedQueue?.url || '',
      messageAttributes: [
        ...messageAttributes()
          .filter((e) => e.name !== '' && e.value !== '')
          .map((e) => e),
      ],
    });
    const prettyErrors = convertValidationErrorsToPrettyErrors(await validate(dto));
    if (prettyErrors.length > 0) {
      setErrors([...prettyErrors]);
      return;
    }

    sendMessageMutation.mutate(dto, {
      onSuccess: () => {
        setFormData({ ...DEFAULT_FORM_DATA });
        setMessageAttributes([{ name: '', value: '' }]);
        setErrors([]);
        props.setSelectedQueue(undefined);
      },
      onError: (error) => {
        setErrors([{ field: 'serverError', error: error.message }]);
      },
    });
  };

  return (
    <Dialog
      fullWidth
      open={isOpen()}
      onClose={() => {
        setFormData({ ...DEFAULT_FORM_DATA });
        setMessageAttributes([{ name: '', value: '' }]);
        setErrors([]);
        props.setSelectedQueue(undefined);
      }}
    >
      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSendClick();
        }}
      >
        <DialogTitle>Send Message</DialogTitle>
        <DialogContent>
          <TextField
            label="Message Body"
            fullWidth
            multiline
            rows={4}
            sx={{ mt: '1.7rem' }}
            value={formData().messageBody}
            onChange={(e) => handleFormDataChange('messageBody', e.target.value)}
            error={!!errors().find((e) => e.field === 'messageBody')}
            helperText={errors().find((e) => e.field === 'messageBody')?.error}
          />
          <TextField
            label="Delay Seconds"
            fullWidth
            sx={{ mt: '1.7rem' }}
            value={formData().delaySeconds}
            onChange={(e) => handleFormDataChange('delaySeconds', e.target.value)}
            error={!!errors().find((e) => e.field === 'delaySeconds')}
            helperText={errors().find((e) => e.field === 'delaySeconds')?.error}
          />
          <Box sx={{ mt: '1.7rem' }}>
            <Typography sx={{ mb: '0.4rem' }}>Message Attributes</Typography>
            <Index each={messageAttributes()}>
              {(messageAttribute, index) => (
                <Box
                  sx={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    '&:not(:first-child)': {
                      mt: '0.7rem',
                    },
                  }}
                >
                  <TextField
                    label="Attribute Name"
                    value={messageAttribute().name}
                    onChange={(e) =>
                      setMessageAttributes((previous) =>
                        previous.map((previousValue, previousIndex) => {
                          if (previousIndex === index) {
                            return { name: e.target.value, value: previousValue.value };
                          }

                          return previousValue;
                        })
                      )
                    }
                    sx={{ width: '42%' }}
                  />
                  <TextField
                    label="Attribute String Value"
                    value={messageAttribute().value}
                    onChange={(e) =>
                      setMessageAttributes((previous) =>
                        previous.map((previousValue, previousIndex) => {
                          if (previousIndex === index) {
                            return { name: previousValue.name, value: e.target.value };
                          }

                          return previousValue;
                        })
                      )
                    }
                    sx={{ width: '42%' }}
                  />
                  <IconButton
                    sx={{ width: '10%' }}
                    onClick={() => {
                      setMessageAttributes((previous) =>
                        previous.filter((_, previousIndex) => index !== previousIndex)
                      );
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              )}
            </Index>
            {messageAttributes().length < 10 && (
              <Button
                fullWidth
                variant="contained"
                sx={{ mt: '0.7rem' }}
                onClick={() => {
                  setMessageAttributes((previous) => [...previous, { name: '', value: '' }]);
                }}
              >
                Add Attribute
              </Button>
            )}
          </Box>
          <FormHelperText error={!!errors().find((e) => e.field === 'serverError')}>
            {errors().find((e) => e.field === 'serverError')?.error}
          </FormHelperText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setFormData({ ...DEFAULT_FORM_DATA });
              setMessageAttributes([{ name: '', value: '' }]);
              setErrors([]);
              props.setSelectedQueue(undefined);
            }}
          >
            Cancel
          </Button>
          <Button type="submit">Send</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
