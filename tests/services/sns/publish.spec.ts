import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { TestingModule } from '@/tests/utils/testing-module';
import { snsTopicDb } from '@/services/sns/dbs/sns-topic.db';
import { snsTopicPublicHistoryDb } from '@/services/sns/dbs/sns-topic-publish-history.db';
import { SnsTopic } from '@/services/sns/types/sns-topic.type';

describe('SNS - Publish', () => {
  let app: TestingModule;
  let snsClient: SNSClient;

  beforeAll(async () => {
    app = await new TestingModule().start();
    snsClient = new SNSClient({
      endpoint: app.getBaseUrl(),
      region: process.env.AWS_REGION as string,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY as string,
        secretAccessKey: process.env.AWS_SECRET_KEY as string,
      },
    });
  });

  afterAll(async () => {
    await app.stop();
  });

  it('should throw validation error if body parsing fails', async () => {
    const command = new PublishCommand({ Message: undefined });

    await expect(snsClient.send(command)).rejects.toThrow(
      'The input fails to satisfy the constraints specified by an AWS service.'
    );
  });

  it('should throw validation error if `TopicArn` is missing', async () => {
    const command = new PublishCommand({ Message: JSON.stringify({ one: 'two' }) });

    await expect(snsClient.send(command)).rejects.toThrow(
      'The input fails to satisfy the constraints specified by an AWS service.'
    );
  });

  it('should throw not found error if topic is not found by arn', async () => {
    const command = new PublishCommand({
      TopicArn: `arn:aws:sns:${process.env.AWS_REGION}:${process.env.AWS_USER_ID}:not-existing-topic`,
      Message: JSON.stringify({ one: 'two' }),
    });

    await expect(snsClient.send(command)).rejects.toThrow('Topic does not exist');
  });

  it('should publish message to the topic and add it to publish history db', async () => {
    const topicStub: SnsTopic = {
      name: 'new-artist',
      arn: `arn:aws:sns:${process.env.AWS_REGION}:${process.env.AWS_USER_ID}:new-artist`,
    };
    const messageStub = { name: 'Yngwie Malmsteen', genre: 'Neoclassical Metal' };

    jest.spyOn(snsTopicDb, 'getFirstByKeyValue').mockReturnValueOnce(topicStub);

    const snsTopicPublicHistoryDbCreateSpy = jest.spyOn(snsTopicPublicHistoryDb, 'create');

    const command = new PublishCommand({
      TopicArn: topicStub.arn,
      Message: JSON.stringify(messageStub),
    });

    const response = await snsClient.send(command);

    expect(response).toHaveProperty('MessageId');
    expect(snsTopicPublicHistoryDbCreateSpy).toHaveBeenCalledTimes(1);
    expect(snsTopicPublicHistoryDbCreateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        TopicArn: topicStub.arn,
        Message: JSON.stringify(messageStub),
      })
    );
  });
});
