import { Box, Button, Typography, TextField, IconButton } from '@suid/material';
import {
  Delete as DeleteIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
} from '@suid/icons-material';
import { For, Match, Switch, createSignal } from 'solid-js';
import { EncryptDecryptAction, KmsKeyDto } from '@mini-aws-mock/shared';
import { useSearchParams } from '@solidjs/router';
import { Table, useConfirmDialog } from '@/common';
import { useKeysQuery } from '../hooks/use-keys-query';
import { useDeleteKeyMutation } from '../hooks/use-delete-key-mutation';
import { CreateKeyModal } from '../components/create-key-modal';
import { EncryptDecryptModal } from '../components/encrypt-decrypt-modal';

export const KeysPage = () => {
  const keysQuery = useKeysQuery();
  const deleteKeyMutation = useDeleteKeyMutation();
  const confirmDialog = useConfirmDialog();
  const [searchParams, setSearchParams] = useSearchParams<{ search: string }>();
  const [search, setSearch] = createSignal(searchParams.search || '');
  const [isCreateKeyModalOpen, setIsCreateKeyModalOpen] = createSignal(false);
  const [encryptDecryptModal, setEncryptDecryptModal] = createSignal<{
    isOpen: boolean;
    action: EncryptDecryptAction;
    keyAlias: string;
    keyId: string;
  }>({ isOpen: false, action: EncryptDecryptAction.Encrypt, keyAlias: '', keyId: '' });

  const filteredKeys = (): KmsKeyDto[] => {
    if (!keysQuery.data) {
      return [];
    }

    return keysQuery.data.filter(
      (key) =>
        key.alias.toLocaleLowerCase().includes(search().toLocaleLowerCase()) ||
        key.id.toLocaleLowerCase().includes(search().toLocaleLowerCase())
    );
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setSearchParams({ search: value });
  };

  const handleDeleteKeyClick = async (key: KmsKeyDto) => {
    const confirm = await confirmDialog.confirm({
      title: 'Delete Key',
      description: `Are you sure you want to delete ${key.alias}?`,
    });

    if (confirm) {
      deleteKeyMutation.mutate(key);
    }
  };

  return (
    <>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" fontWeight={500}>
            Keys
          </Typography>
          <Button variant="contained" onClick={() => setIsCreateKeyModalOpen(true)}>
            Add Key
          </Button>
        </Box>
        <TextField
          label="Search"
          fullWidth
          sx={{ mt: '1.7rem' }}
          value={search()}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
        <Box sx={{ mt: '1rem' }}>
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.Cell sx={{ borderRadius: '8px' }}>Alias</Table.Cell>
                <Table.Cell>Key Id</Table.Cell>
                <Table.Cell>Key Spec</Table.Cell>
                <Table.Cell>Key Usage</Table.Cell>
                <Table.Cell>Actions</Table.Cell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              <Switch>
                <Match when={keysQuery.isPending}>Loading...</Match>
                <Match when={keysQuery.isError}>
                  Error: {keysQuery.error?.message || 'Unknown error.'}
                </Match>
                <Match when={keysQuery.isSuccess}>
                  <For each={filteredKeys()}>
                    {(key) => (
                      <Table.Row
                        hover
                        sx={{ '&:last-child td, &:last-child th': { borderBottom: 0 } }}
                      >
                        <Table.Cell>{key.alias}</Table.Cell>
                        <Table.Cell>{key.id}</Table.Cell>
                        <Table.Cell>{key.keySpec}</Table.Cell>
                        <Table.Cell>{key.keyUsage}</Table.Cell>
                        <Table.Cell>
                          <IconButton
                            color="primary"
                            onClick={() =>
                              setEncryptDecryptModal({
                                isOpen: true,
                                action: EncryptDecryptAction.Encrypt,
                                keyAlias: key.alias,
                                keyId: key.id,
                              })
                            }
                          >
                            <LockIcon />
                          </IconButton>
                          <IconButton
                            color="primary"
                            onClick={() =>
                              setEncryptDecryptModal({
                                isOpen: true,
                                action: EncryptDecryptAction.Decrypt,
                                keyAlias: key.alias,
                                keyId: key.id,
                              })
                            }
                          >
                            <LockOpenIcon />
                          </IconButton>
                          <IconButton color="error" onClick={() => handleDeleteKeyClick(key)}>
                            <DeleteIcon />
                          </IconButton>
                        </Table.Cell>
                      </Table.Row>
                    )}
                  </For>
                </Match>
              </Switch>
            </Table.Body>
          </Table>
        </Box>
      </Box>
      <CreateKeyModal isOpen={isCreateKeyModalOpen()} setIsOpen={setIsCreateKeyModalOpen} />
      <EncryptDecryptModal
        isOpen={encryptDecryptModal().isOpen}
        setIsOpen={(isOpen: boolean) =>
          setEncryptDecryptModal((previous) => ({ ...previous, isOpen }))
        }
        action={encryptDecryptModal().action}
        keyAlias={encryptDecryptModal().keyAlias}
        keyId={encryptDecryptModal().keyId}
      />
    </>
  );
};
