import { Box, Typography, TextField } from '@suid/material';
import { For, Match, Switch, createSignal } from 'solid-js';
import { useSearchParams } from '@solidjs/router';
import { SqsMessageHistoryDto } from '@mini-aws-mock/shared';
import { Table } from '@/common';
import { useMessageHistoryQuery } from '../hooks/use-message-history-query';

export const MessageHistoryPage = () => {
  const messageHistoryQuery = useMessageHistoryQuery();
  const [searchParams, setSearchParams] = useSearchParams<{ search: string }>();
  const [search, setSearch] = createSignal(searchParams.search || '');

  const filteredMessageHistory = (): SqsMessageHistoryDto[] => {
    if (!messageHistoryQuery.data) {
      return [];
    }

    return messageHistoryQuery.data.filter(
      (message) =>
        message.messageId.toLocaleLowerCase().includes(search().toLocaleLowerCase()) ||
        message.messageBody.toLocaleLowerCase().includes(search().toLocaleLowerCase()) ||
        message.queueUrl.toLocaleLowerCase().includes(search().toLocaleLowerCase())
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
          Message History
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
              <Table.Cell sx={{ borderRadius: '8px' }}>Message Id</Table.Cell>
              <Table.Cell>Message Body</Table.Cell>
              <Table.Cell>Message Attributes</Table.Cell>
              <Table.Cell>Queue URL</Table.Cell>
              <Table.Cell>Created At</Table.Cell>
              <Table.Cell>Deleted At</Table.Cell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            <Switch>
              <Match when={messageHistoryQuery.isPending}>Loading...</Match>
              <Match when={messageHistoryQuery.isError}>
                Error: {messageHistoryQuery.error?.message || 'Unknown error.'}
              </Match>
              <Match when={messageHistoryQuery.isSuccess}>
                <For each={filteredMessageHistory()}>
                  {(message) => (
                    <Table.Row
                      hover
                      sx={{ '&:last-child td, &:last-child th': { borderBottom: 0 } }}
                    >
                      <Table.Cell>{message.messageId}</Table.Cell>
                      <Table.Cell>{message.messageBody}</Table.Cell>
                      <Table.Cell>{message.messageAttributes}</Table.Cell>
                      <Table.Cell>{message.queueUrl}</Table.Cell>
                      <Table.Cell>{new Date(message.createdAt).toLocaleString()}</Table.Cell>
                      <Table.Cell>{new Date(message.deletedAt).toLocaleString()}</Table.Cell>
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
