import { Box, Typography, TextField, Button } from '@suid/material';
import { For, Match, Switch, createSignal } from 'solid-js';
import { SnsTopicPublishHistoryDto } from '@mini-aws-mock/shared';
import { useSearchParams } from '@solidjs/router';
import { Table, useConfirmDialog } from '@/common';
import { usePublishHistoryQuery } from '../hooks/use-publish-history-query';
import { usePurgePublishHistoryMutation } from '../hooks/use-purge-publish-history-mutation';

export const PublishHistoryPage = () => {
  const publishHistoryQuery = usePublishHistoryQuery();
  const purgePublishHistoryMutation = usePurgePublishHistoryMutation();
  const confirmDialog = useConfirmDialog();
  const [searchParams, setSearchParams] = useSearchParams<{ search: string }>();
  const [search, setSearch] = createSignal(searchParams.search || '');

  const filteredPublishHistory = (): SnsTopicPublishHistoryDto[] => {
    if (!publishHistoryQuery.data) {
      return [];
    }

    return publishHistoryQuery.data.filter(
      (publishHistoryRecord) =>
        publishHistoryRecord.topicArn.toLocaleLowerCase().includes(search().toLocaleLowerCase()) ||
        publishHistoryRecord.message.toLocaleLowerCase().includes(search().toLocaleLowerCase()) ||
        publishHistoryRecord.messageId.toLocaleLowerCase().includes(search().toLocaleLowerCase())
    );
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setSearchParams({ search: value });
  };

  const handlePurgePublishHistoryClick = async () => {
    const confirm = await confirmDialog.confirm({
      title: 'Purge History',
      description: 'Are you sure you want to purge whole publish history?',
    });

    if (confirm) {
      purgePublishHistoryMutation.mutate();
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight={500}>
          Publish History
        </Typography>
        <Button variant="contained" onClick={handlePurgePublishHistoryClick}>
          Purge History
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
              <Table.Cell sx={{ borderRadius: '8px' }}>Topic Arn</Table.Cell>
              <Table.Cell>Message</Table.Cell>
              <Table.Cell>Message Attributes</Table.Cell>
              <Table.Cell>Message Id</Table.Cell>
              <Table.Cell>Created At</Table.Cell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            <Switch>
              <Match when={publishHistoryQuery.isPending}>Loading...</Match>
              <Match when={publishHistoryQuery.isError}>
                Error: {publishHistoryQuery.error?.message || 'Unknown error.'}
              </Match>
              <Match when={publishHistoryQuery.isSuccess}>
                <For each={filteredPublishHistory()}>
                  {(publishHistoryRecord) => (
                    <Table.Row
                      hover
                      sx={{ '&:last-child td, &:last-child th': { borderBottom: 0 } }}
                    >
                      <Table.Cell>{publishHistoryRecord.topicArn}</Table.Cell>
                      <Table.Cell>{publishHistoryRecord.message}</Table.Cell>
                      <Table.Cell>{publishHistoryRecord.messageAttributes}</Table.Cell>
                      <Table.Cell>{publishHistoryRecord.messageId}</Table.Cell>
                      <Table.Cell>{publishHistoryRecord.createdAt.toLocaleString()}</Table.Cell>
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
