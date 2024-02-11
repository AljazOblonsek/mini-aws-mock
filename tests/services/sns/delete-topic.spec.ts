import { SNSClient, DeleteTopicCommand } from '@aws-sdk/client-sns';
import { TestingModule } from '@/tests/utils/testing-module';
import { snsTopicDb } from '@/services/sns/dbs/sns-topic.db';

describe('SNS - DeleteTopic', () => {
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
    const command = new DeleteTopicCommand({ TopicArn: undefined });

    await expect(snsClient.send(command)).rejects.toThrow(
      'The input fails to satisfy the constraints specified by an AWS service.'
    );
  });

  it('should throw not found error if topic is not found by arn', async () => {
    const command = new DeleteTopicCommand({
      TopicArn: `arn:aws:sns:${process.env.AWS_REGION}:${process.env.AWS_USER_ID}:not-existing-topic`,
    });

    await expect(snsClient.send(command)).rejects.toThrow('Topic does not exist');
  });

  it('should delete the topic', async () => {
    const topic = snsTopicDb.create({
      name: 'new-topic',
      arn: `arn:aws:sns:${process.env.AWS_REGION}:${process.env.AWS_USER_ID}:new-topic`,
    });

    const command = new DeleteTopicCommand({
      TopicArn: topic.arn,
    });

    await expect(snsClient.send(command)).resolves.not.toThrow();
  });
});
