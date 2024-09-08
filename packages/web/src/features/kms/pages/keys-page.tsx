import { Box, Button, Typography, TextField, IconButton, Link } from '@suid/material';
import {
  Delete as DeleteIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
} from '@suid/icons-material';
import { For, Match, Switch, createSignal } from 'solid-js';
import { KmsKeyDto } from '@mini-aws-mock/shared';
import { A, useSearchParams } from '@solidjs/router';
import { Table, useConfirmDialog } from '@/common';
import { useKeysQuery } from '../hooks/use-keys-query';
import { useDeleteKeyMutation } from '../hooks/use-delete-key-mutation';
import { CreateKeyModal } from '../components/create-key-modal';
import { EncryptionModal } from '../components/encryption-modal';
import { EncryptionAction } from '../types/encryption-action';

export const KeysPage = () => {
  const keysQuery = useKeysQuery();
  const deleteKeyMutation = useDeleteKeyMutation();
  const confirmDialog = useConfirmDialog();
  const [searchParams, setSearchParams] = useSearchParams<{ search: string }>();
  const [search, setSearch] = createSignal(searchParams.search || '');
  const [isCreateKeyModalOpen, setIsCreateKeyModalOpen] = createSignal(false);
  const [encryptionModal, setEncryptionModal] = createSignal<{
    isOpen: boolean;
    action: EncryptionAction;
    keyAlias: string;
    keyId: string;
  }>({ isOpen: false, action: 'encrypt', keyAlias: '', keyId: '' });

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
                <Table.Cell>Usage History</Table.Cell>
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
                          <Link
                            href={`/kms/encryption-history?search=${encodeURIComponent(key.id)}`}
                            component={A}
                          >
                            {key.encryptionHistoryLength === 1
                              ? `${key.encryptionHistoryLength} usage`
                              : `${key.encryptionHistoryLength} usages`}
                          </Link>
                        </Table.Cell>
                        <Table.Cell>
                          <IconButton
                            color="primary"
                            onClick={() =>
                              setEncryptionModal({
                                isOpen: true,
                                action: 'encrypt',
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
                              setEncryptionModal({
                                isOpen: true,
                                action: 'decrypt',
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
      <EncryptionModal
        isOpen={encryptionModal().isOpen}
        setIsOpen={(isOpen: boolean) => setEncryptionModal((previous) => ({ ...previous, isOpen }))}
        action={encryptionModal().action}
        keyAlias={encryptionModal().keyAlias}
        keyId={encryptionModal().keyId}
      />
    </>
  );
};
