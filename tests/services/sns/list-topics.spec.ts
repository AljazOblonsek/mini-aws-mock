import { SNSClient, ListTopicsCommand, ListTopicsCommandOutput } from '@aws-sdk/client-sns';
import { TestingModule } from '@/tests/utils/testing-module';
import { snsTopicDb } from '@/services/sns/dbs/sns-topic.db';

describe('SNS - ListTopics', () => {
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

  it('should paginate the returned list of topics correctly', async () => {
    const topicListStub = [
      {
        name: 'topic-1',
        arn: `arn:aws:sns:${process.env.AWS_REGION}:${process.env.AWS_USER_ID}:topic-1`,
      },
      {
        name: 'topic-2',
        arn: `arn:aws:sns:${process.env.AWS_REGION}:${process.env.AWS_USER_ID}:topic-2`,
      },
      {
        name: 'topic-3',
        arn: `arn:aws:sns:${process.env.AWS_REGION}:${process.env.AWS_USER_ID}:topic-3`,
      },
      {
        name: 'topic-4',
        arn: `arn:aws:sns:${process.env.AWS_REGION}:${process.env.AWS_USER_ID}:topic-4`,
      },
      {
        name: 'topic-5',
        arn: `arn:aws:sns:${process.env.AWS_REGION}:${process.env.AWS_USER_ID}:topic-5`,
      },
    ];

    jest.spyOn(snsTopicDb, 'getAll').mockReturnValue(topicListStub);

    let command: ListTopicsCommand;
    let response: ListTopicsCommandOutput;

    // Page 1
    command = new ListTopicsCommand({});
    response = await snsClient.send(command);
    expect(response.Topics).toHaveLength(2); // .env.test has a page size of 2
    expect(response.Topics![0].TopicArn).toBe(topicListStub[0].arn);
    expect(response.Topics![1].TopicArn).toBe(topicListStub[1].arn);
    expect(response.NextToken).toBe(
      `arn:aws:sns:${process.env.AWS_REGION}:${process.env.AWS_USER_ID}:topic-3`
    );

    // Page 2
    command = new ListTopicsCommand({
      NextToken: `arn:aws:sns:${process.env.AWS_REGION}:${process.env.AWS_USER_ID}:topic-3`,
    });
    response = await snsClient.send(command);
    expect(response.Topics).toHaveLength(2); // .env.test has a page size of 2
    expect(response.Topics![0].TopicArn).toBe(topicListStub[2].arn);
    expect(response.Topics![1].TopicArn).toBe(topicListStub[3].arn);
    expect(response.NextToken).toBe(
      `arn:aws:sns:${process.env.AWS_REGION}:${process.env.AWS_USER_ID}:topic-5`
    );

    // Page 3
    command = new ListTopicsCommand({
      NextToken: `arn:aws:sns:${process.env.AWS_REGION}:${process.env.AWS_USER_ID}:topic-5`,
    });
    response = await snsClient.send(command);
    expect(response.Topics).toHaveLength(1);
    expect(response.Topics![0].TopicArn).toBe(topicListStub[4].arn);
    expect(response).not.toHaveProperty('NextToken');
  });
});
