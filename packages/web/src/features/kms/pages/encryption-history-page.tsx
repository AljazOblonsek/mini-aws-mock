import { Box, Typography, TextField } from '@suid/material';
import { For, Match, Switch, createSignal } from 'solid-js';
import { useSearchParams } from '@solidjs/router';
import { EncryptionAction, KmsEncryptionHistoryDto } from '@mini-aws-mock/shared';
import { Table } from '@/common';
import { useEncryptionHistoryQuery } from '../hooks/use-encryption-history-query';

export const EncryptionHistoryPage = () => {
  const encryptionHistoryQuery = useEncryptionHistoryQuery();
  const [searchParams, setSearchParams] = useSearchParams<{ search: string }>();
  const [search, setSearch] = createSignal(searchParams.search || '');

  const filteredEncryptionHistory = (): KmsEncryptionHistoryDto[] => {
    if (!encryptionHistoryQuery.data) {
      return [];
    }

    return encryptionHistoryQuery.data.filter(
      (encryptionHistoryRecord) =>
        encryptionHistoryRecord.keyAlias
          .toLocaleLowerCase()
          .includes(search().toLocaleLowerCase()) ||
        encryptionHistoryRecord.keyId.toLocaleLowerCase().includes(search().toLocaleLowerCase())
    );
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setSearchParams({ search: value });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight={500}>
          Encryption History
        </Typography>
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
              <Table.Cell sx={{ borderRadius: '8px' }}>Key Alias</Table.Cell>
              <Table.Cell>Key Id</Table.Cell>
              <Table.Cell>Action</Table.Cell>
              <Table.Cell>Kind</Table.Cell>
              <Table.Cell>Input</Table.Cell>
              <Table.Cell>Output</Table.Cell>
              <Table.Cell>Created At</Table.Cell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            <Switch>
              <Match when={encryptionHistoryQuery.isPending}>Loading...</Match>
              <Match when={encryptionHistoryQuery.isError}>
                Error: {encryptionHistoryQuery.error?.message || 'Unknown error.'}
              </Match>
              <Match when={encryptionHistoryQuery.isSuccess}>
                <For each={filteredEncryptionHistory()}>
                  {(encryptionHistoryRecord) => (
                    <Table.Row
                      hover
                      sx={{ '&:last-child td, &:last-child th': { borderBottom: 0 } }}
                    >
                      <Table.Cell>{encryptionHistoryRecord.keyId}</Table.Cell>
                      <Table.Cell>{encryptionHistoryRecord.keyAlias}</Table.Cell>
                      <Table.Cell>{encryptionHistoryRecord.encryptionAction}</Table.Cell>
                      <Table.Cell>{encryptionHistoryRecord.encryptionKind}</Table.Cell>
                      <Table.Cell sx={{ wordBreak: 'break-word' }}>
                        {encryptionHistoryRecord.encryptionAction === EncryptionAction.Encrypt
                          ? atob(encryptionHistoryRecord.input)
                          : encryptionHistoryRecord.input}
                      </Table.Cell>
                      <Table.Cell sx={{ wordBreak: 'break-word' }}>
                        {encryptionHistoryRecord.encryptionAction === EncryptionAction.Decrypt
                          ? atob(encryptionHistoryRecord.output)
                          : encryptionHistoryRecord.output}
                      </Table.Cell>
                      <Table.Cell>
                        {new Date(encryptionHistoryRecord.createdAt).toLocaleString()}
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
  );
};
