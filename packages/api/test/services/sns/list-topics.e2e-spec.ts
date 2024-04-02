import { SnsTopic } from '@/src/modules/sns/entities/sns-topic.entity';
import { generateSnsTopicStub } from '@/src/modules/sns/mock/stubs/sns-topic.stub';
import { AwsTestingModule } from '@/test/utils/aws-testing-module';
import { ListTopicsCommand, ListTopicsCommandOutput, SNSClient } from '@aws-sdk/client-sns';
import { getModelToken } from '@nestjs/sequelize';

describe('SNS - ListTopics', () => {
  let awsTestingModule: AwsTestingModule;
  let snsClient: SNSClient;
  let snsTopicModel: typeof SnsTopic;

  beforeEach(async () => {
    awsTestingModule = await new AwsTestingModule().start();

    snsClient = await awsTestingModule.createAwsClient(SNSClient);

    snsTopicModel = awsTestingModule.app.get<typeof SnsTopic>(getModelToken(SnsTopic));
  });

  afterEach(async () => {
    await awsTestingModule.stop();
  });

  it('should correctly paginate the returned list of topics', async () => {
    const snsTopicsStub = await snsTopicModel.bulkCreate([
      generateSnsTopicStub(),
      generateSnsTopicStub(),
      generateSnsTopicStub(),
      generateSnsTopicStub(),
      generateSnsTopicStub(),
    ]);

    let command: ListTopicsCommand;
    let response: ListTopicsCommandOutput;

    // Page 1
    command = new ListTopicsCommand({});
    response = await snsClient.send(command);
    expect(response.Topics).toHaveLength(2); // .env.test has page size set to 2
    expect(response.Topics![0].TopicArn).toBe(snsTopicsStub[0].arn);
    expect(response.Topics![1].TopicArn).toBe(snsTopicsStub[1].arn);
    expect(response.NextToken).toBe(snsTopicsStub[2].arn);

    // Page 2
    command = new ListTopicsCommand({ NextToken: response.NextToken });
    response = await snsClient.send(command);
    expect(response.Topics).toHaveLength(2); // .env.test has page size set to 2
    expect(response.Topics![0].TopicArn).toBe(snsTopicsStub[2].arn);
    expect(response.Topics![1].TopicArn).toBe(snsTopicsStub[3].arn);
    expect(response.NextToken).toBe(snsTopicsStub[4].arn);

    // Page 3
    command = new ListTopicsCommand({ NextToken: response.NextToken });
    response = await snsClient.send(command);
    expect(response.Topics).toHaveLength(1);
    expect(response.Topics![0].TopicArn).toBe(snsTopicsStub[4].arn);
    expect(response).not.toHaveProperty('NextToken');
  });
});
