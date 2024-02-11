import { SNSClient, CreateTopicCommand } from '@aws-sdk/client-sns';
import { TestingModule } from '@/tests/utils/testing-module';
import { snsTopicDb } from '@/services/sns/dbs/sns-topic.db';
import { SnsTopic } from '@/services/sns/types/sns-topic.type';

describe('SNS - CreateTopic', () => {
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
    const command = new CreateTopicCommand({ Name: undefined });

    await expect(snsClient.send(command)).rejects.toThrow(
      'The input fails to satisfy the constraints specified by an AWS service.'
    );
  });

  it('should return existing topic if topic with same name already exists', async () => {
    const topicStub: SnsTopic = {
      name: 'new-songs',
      arn: `arn:aws:sns:${process.env.AWS_REGION}:${process.env.AWS_USER_ID}:new-songs`,
    };

    jest.spyOn(snsTopicDb, 'getFirstByKeyValue').mockReturnValueOnce(topicStub);

    const command = new CreateTopicCommand({ Name: topicStub.name });

    const response = await snsClient.send(command);

    expect(response.TopicArn).toBeTruthy();
    expect(response.TopicArn).toBe(topicStub.arn);
  });

  it('should create a new topic and returns its arn', async () => {
    jest.spyOn(snsTopicDb, 'getFirstByKeyValue').mockReturnValueOnce(null);

    const topicNameStub = 'new-songs';

    const command = new CreateTopicCommand({ Name: topicNameStub });

    const response = await snsClient.send(command);

    expect(response.TopicArn).toBeTruthy();
    expect(response.TopicArn).toBe(
      `arn:aws:sns:${process.env.AWS_REGION}:${process.env.AWS_USER_ID}:${topicNameStub}`
    );
  });
});
