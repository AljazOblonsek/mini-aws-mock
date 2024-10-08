import { Route, Router, Navigate } from '@solidjs/router';
import { Layout } from './layouts/layout';
import { PublishHistoryPage, TopicsPage } from '@/features/sns';
import { MessageHistoryPage, MessagesPage, QueuesPage } from '@/features/sqs';
import { EncryptionHistoryPage, KeysPage } from '@/features/kms';

export const MainRouter = () => (
  <Router root={Layout}>
    <Route path="/" component={() => <Navigate href="/sns/topics" />} />
    <Route path="/sns/topics" component={TopicsPage} />
    <Route path="/sns/publish-history" component={PublishHistoryPage} />
    <Route path="/sqs/queues" component={QueuesPage} />
    <Route path="/sqs/messages" component={MessagesPage} />
    <Route path="/sqs/message-history" component={MessageHistoryPage} />
    <Route path="/kms/keys" component={KeysPage} />
    <Route path="/kms/encryption-history" component={EncryptionHistoryPage} />
  </Router>
);
