import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@suid/material';
import { JSX, createContext, createSignal, useContext } from 'solid-js';

type ConfirmOptions = {
  title: string;
  description: string;
};

const DEFAULT_CONFIRM_OPTIONS = {
  title: 'Are you sure?',
  description: '',
};

type ConfirmDialogContextType = {
  confirm: (options?: Partial<ConfirmOptions>) => Promise<boolean>;
};

const ConfirmDialogContext = createContext<ConfirmDialogContextType | null>(null);

export const useConfirmDialog = (): ConfirmDialogContextType => {
  const confirmDialogContext = useContext(ConfirmDialogContext);

  if (!confirmDialogContext) {
    throw new Error('`useConfirmDialog` can only be used within `ConfirmDialogContext`');
  }

  return confirmDialogContext;
};

type ConfirmDialogProviderProps = {
  children: JSX.Element;
};

export const ConfirmDialogProvider = (props: ConfirmDialogProviderProps) => {
  const [modalOptions, setModalOptions] = createSignal<ConfirmOptions>({
    ...DEFAULT_CONFIRM_OPTIONS,
  });
  const [isOpen, setIsOpen] = createSignal(false);
  let resolveFn: (value: boolean) => void;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Escape') {
      return;
    }

    if (resolveFn) {
      resolveFn(false);
    }

    setIsOpen(false);
    setModalOptions({ ...DEFAULT_CONFIRM_OPTIONS });
    document.removeEventListener('keydown', handleKeyDown);
  };

  const confirm = (options: Partial<ConfirmOptions> = {}): Promise<boolean> => {
    setModalOptions({
      title: options.title || DEFAULT_CONFIRM_OPTIONS.title,
      description: options.description || DEFAULT_CONFIRM_OPTIONS.description,
    });

    // Hacky solution to workaround dialog being inside context - somehow the focus does not trap on the dialog
    // thus Dialog not registering the SUI keydown
    document.addEventListener('keydown', handleKeyDown);

    setIsOpen(true);
    return new Promise((resolve) => {
      resolveFn = resolve;
    });
  };

  const handleCancelClick = () => {
    if (resolveFn) {
      resolveFn(false);
    }

    setIsOpen(false);
    setModalOptions({ ...DEFAULT_CONFIRM_OPTIONS });
    document.removeEventListener('keydown', handleKeyDown);
  };

  const handleOkClick = () => {
    if (resolveFn) {
      resolveFn(true);
    }

    setIsOpen(false);
    setModalOptions({ ...DEFAULT_CONFIRM_OPTIONS });
    document.removeEventListener('keydown', handleKeyDown);
  };

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {props.children}
      <Dialog fullWidth open={isOpen()} onClose={handleCancelClick}>
        <DialogTitle>{modalOptions().title}</DialogTitle>
        {modalOptions().description && (
          <DialogContent>
            <DialogContentText>{modalOptions().description}</DialogContentText>
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={handleCancelClick}>Cancel</Button>
          <Button color="primary" onClick={handleOkClick}>
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </ConfirmDialogContext.Provider>
  );
};
