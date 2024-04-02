import { Box, Button, Typography, TextField, IconButton, Link } from '@suid/material';
import {
  Message as MessageIcon,
  Gavel as GavelIcon,
  Delete as DeleteIcon,
} from '@suid/icons-material';
import { For, Match, Switch, createSignal } from 'solid-js';
import { SqsQueueDto } from '@mini-aws-mock/shared';
import { A, useSearchParams } from '@solidjs/router';
import { Table, useConfirmDialog } from '@/common';
import { useQueuesQuery } from '../hooks/use-queues-query';
import { CreateQueueModal } from '../components/create-queue-modal';
import { SendMessageModal } from '../components/send-message-modal';
import { usePurgeQueueMutation } from '../hooks/use-purge-queue-mutation';
import { useDeleteQueueMutation } from '../hooks/use-delete-queue-mutation';

export const QueuesPage = () => {
  const queuesQuery = useQueuesQuery();
  const purgeQueueMutation = usePurgeQueueMutation();
  const deleteQueueMutation = useDeleteQueueMutation();
  const confirmDialog = useConfirmDialog();
  const [searchParams, setSearchParams] = useSearchParams<{ search: string }>();
  const [search, setSearch] = createSignal(searchParams.search || '');
  const [isCreateQueueModalOpen, setIsCreateQueueModalOpen] = createSignal(false);
  const [isSendMessageModalOpen, setIsSendMessageModalOpen] = createSignal<SqsQueueDto>();

  const filteredQueues = (): SqsQueueDto[] => {
    if (!queuesQuery.data) {
      return [];
    }

    return queuesQuery.data.filter(
      (queue) =>
        queue.name.toLocaleLowerCase().includes(search().toLocaleLowerCase()) ||
        queue.url.toLocaleLowerCase().includes(search().toLocaleLowerCase()) ||
        queue.arn.toLocaleLowerCase().includes(search().toLocaleLowerCase())
    );
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setSearchParams({ search: value });
  };

  const handleSendMessageClick = async (queue: SqsQueueDto) => {
    setIsSendMessageModalOpen({ ...queue });
  };

  const handlePurgeQueueClick = async (queue: SqsQueueDto) => {
    const confirm = await confirmDialog.confirm({
      title: 'Purge Queue',
      description: `Are you sure you want to purge ${queue.name}?`,
    });

    if (confirm) {
      purgeQueueMutation.mutate(queue);
    }
  };

  const handleDeleteQueueClick = async (queue: SqsQueueDto) => {
    const confirm = await confirmDialog.confirm({
      title: 'Delete Queue',
      description: `Are you sure you want to delete ${queue.name}? This will also delete all of its messages and history.`,
    });

    if (confirm) {
      deleteQueueMutation.mutate(queue);
    }
  };

  return (
    <>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" fontWeight={500}>
            Queues
          </Typography>
          <Button variant="contained" onClick={() => setIsCreateQueueModalOpen(true)}>
            Add Queue
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
                <Table.Cell sx={{ borderRadius: '8px' }}>Name</Table.Cell>
                <Table.Cell>Url</Table.Cell>
                <Table.Cell>Arn</Table.Cell>
                <Table.Cell>Visibility Timeout</Table.Cell>
                <Table.Cell>Receive Message Wait Time</Table.Cell>
                <Table.Cell>Maximum Message Size</Table.Cell>
                <Table.Cell>Messages</Table.Cell>
                <Table.Cell>Message History</Table.Cell>
                <Table.Cell>Actions</Table.Cell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              <Switch>
                <Match when={queuesQuery.isPending}>Loading...</Match>
                <Match when={queuesQuery.isError}>
                  Error: {queuesQuery.error?.message || 'Unknown error.'}
                </Match>
                <Match when={queuesQuery.isSuccess}>
                  <For each={filteredQueues()}>
                    {(queue) => (
                      <Table.Row
                        hover
                        sx={{ '&:last-child td, &:last-child th': { borderBottom: 0 } }}
                      >
                        <Table.Cell>{queue.name}</Table.Cell>
                        <Table.Cell>{queue.url}</Table.Cell>
                        <Table.Cell>{queue.arn}</Table.Cell>
                        <Table.Cell>{queue.visibilityTimeout}</Table.Cell>
                        <Table.Cell>{queue.receiveMessageWaitTimeSeconds}</Table.Cell>
                        <Table.Cell>{queue.maximumMessageSize}</Table.Cell>
                        <Table.Cell>
                          <Link
                            href={`/sqs/messages?search=${encodeURIComponent(queue.url)}`}
                            component={A}
                          >
                            {queue.numberOfMessages === 1
                              ? `${queue.numberOfMessages} message`
                              : `${queue.numberOfMessages} messages`}
                          </Link>
                        </Table.Cell>
                        <Table.Cell>
                          <Link
                            href={`/sqs/message-history?search=${encodeURIComponent(queue.url)}`}
                            component={A}
                          >
                            {queue.numberOfMessagesInHistory === 1
                              ? `${queue.numberOfMessagesInHistory} message`
                              : `${queue.numberOfMessagesInHistory} messages`}
                          </Link>
                        </Table.Cell>
                        <Table.Cell>
                          <Box sx={{ display: 'flex' }}>
                            <IconButton
                              color="primary"
                              onClick={() => handleSendMessageClick(queue)}
                            >
                              <MessageIcon />
                            </IconButton>
                            <IconButton
                              color="warning"
                              onClick={() => handlePurgeQueueClick(queue)}
                            >
                              <GavelIcon />
                            </IconButton>
                            <IconButton color="error" onClick={() => handleDeleteQueueClick(queue)}>
                              <DeleteIcon />
                            </IconButton>
                          </Box>
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
      <CreateQueueModal isOpen={isCreateQueueModalOpen()} setIsOpen={setIsCreateQueueModalOpen} />
      <SendMessageModal
        selectedQueue={isSendMessageModalOpen()}
        setSelectedQueue={setIsSendMessageModalOpen}
      />
    </>
  );
};
