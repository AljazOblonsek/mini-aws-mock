import { Box, Button, Typography, TextField, IconButton, Link } from '@suid/material';
import { Delete as DeleteIcon } from '@suid/icons-material';
import { For, Match, Switch, createSignal } from 'solid-js';
import { SnsTopicDto } from '@mini-aws-mock/shared';
import { A, useSearchParams } from '@solidjs/router';
import { useTopicsQuery } from '../hooks/use-topics-query';
import { useDeleteTopicMutation } from '../hooks/use-delete-topic-mutation';
import { CreateTopicModal } from '../components/create-topic-modal';
import { Table, useConfirmDialog } from '@/common';

export const TopicsPage = () => {
  const topicsQuery = useTopicsQuery();
  const deleteTopicMutation = useDeleteTopicMutation();
  const confirmDialog = useConfirmDialog();
  const [searchParams, setSearchParams] = useSearchParams<{ search: string }>();
  const [search, setSearch] = createSignal(searchParams.search || '');
  const [isCreateTopicModalOpen, setIsCreateTopicModalOpen] = createSignal(false);

  const filteredTopics = (): SnsTopicDto[] => {
    if (!topicsQuery.data) {
      return [];
    }

    return topicsQuery.data.filter(
      (topic) =>
        topic.name.toLocaleLowerCase().includes(search().toLocaleLowerCase()) ||
        topic.arn.toLocaleLowerCase().includes(search().toLocaleLowerCase())
    );
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setSearchParams({ search: value });
  };

  const handleDeleteTopicClick = async (topic: SnsTopicDto) => {
    const confirm = await confirmDialog.confirm({
      title: 'Delete Topic',
      description: `Are you sure you want to delete ${topic.name}?`,
    });

    if (confirm) {
      deleteTopicMutation.mutate(topic);
    }
  };

  return (
    <>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" fontWeight={500}>
            Topics
          </Typography>
          <Button variant="contained" onClick={() => setIsCreateTopicModalOpen(true)}>
            Add Topic
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
                <Table.Cell>ARN</Table.Cell>
                <Table.Cell>Number of publishes</Table.Cell>
                <Table.Cell>Actions</Table.Cell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              <Switch>
                <Match when={topicsQuery.isPending}>Loading...</Match>
                <Match when={topicsQuery.isError}>
                  Error: {topicsQuery.error?.message || 'Unknown error.'}
                </Match>
                <Match when={topicsQuery.isSuccess}>
                  <For each={filteredTopics()}>
                    {(topic) => (
                      <Table.Row
                        hover
                        sx={{ '&:last-child td, &:last-child th': { borderBottom: 0 } }}
                      >
                        <Table.Cell>{topic.name}</Table.Cell>
                        <Table.Cell>{topic.arn}</Table.Cell>
                        <Table.Cell>
                          <Link
                            href={`/sns/publish-history?search=${encodeURIComponent(topic.arn)}`}
                            component={A}
                          >
                            {topic.numberOfPublishes === 1
                              ? `${topic.numberOfPublishes} publish`
                              : `${topic.numberOfPublishes} publishes`}
                          </Link>
                        </Table.Cell>
                        <Table.Cell>
                          <IconButton color="error" onClick={() => handleDeleteTopicClick(topic)}>
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
      <CreateTopicModal isOpen={isCreateTopicModalOpen()} setIsOpen={setIsCreateTopicModalOpen} />
    </>
  );
};
