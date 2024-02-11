import { PublishSchema } from '../schemas/publish.schema';

export type SnsTopicPublishHistory = PublishSchema & { CreatedAt: string; MessageId: string };
