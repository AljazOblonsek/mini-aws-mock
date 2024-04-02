import { Box, Typography, TextField } from '@suid/material';
import { For, Match, Switch, createSignal } from 'solid-js';
import { SqsMessageDto } from '@mini-aws-mock/shared';
import { useSearchParams } from '@solidjs/router';
import { Table } from '@/common';
import { useMessagesQuery } from '../hooks/use-messages-query';

export const MessagesPage = () => {
  const messagesQuery = useMessagesQuery();
  const [searchParams, setSearchParams] = useSearchParams<{ search: string }>();
  const [search, setSearch] = createSignal(searchParams.search || '');

  const filteredMessages = (): SqsMessageDto[] => {
    if (!messagesQuery.data) {
      return [];
    }

    return messagesQuery.data.filter(
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
          Messages
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
              <Table.Cell>Is In Transit</Table.Cell>
              <Table.Cell>Created At</Table.Cell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            <Switch>
              <Match when={messagesQuery.isPending}>Loading...</Match>
              <Match when={messagesQuery.isError}>
                Error: {messagesQuery.error?.message || 'Unknown error.'}
              </Match>
              <Match when={messagesQuery.isSuccess}>
                <For each={filteredMessages()}>
                  {(message) => (
                    <Table.Row
                      hover
                      sx={{ '&:last-child td, &:last-child th': { borderBottom: 0 } }}
                    >
                      <Table.Cell>{message.messageId}</Table.Cell>
                      <Table.Cell>{message.messageBody}</Table.Cell>
                      <Table.Cell>{message.messageAttributes}</Table.Cell>
                      <Table.Cell>{message.queueUrl}</Table.Cell>
                      <Table.Cell>{message.isInTransit ? 'true' : 'false'}</Table.Cell>
                      <Table.Cell>{new Date(message.createdAt).toLocaleString()}</Table.Cell>
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
