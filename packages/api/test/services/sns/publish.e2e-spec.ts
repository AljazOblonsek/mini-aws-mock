import { SnsTopicPublishHistory } from '@/src/modules/sns/entities/sns-topic-publish-history.entity';
import { SnsTopic } from '@/src/modules/sns/entities/sns-topic.entity';
import { generateSnsTopicStub } from '@/src/modules/sns/mock/stubs/sns-topic.stub';
import { AwsTestingModule } from '@/test/utils/aws-testing-module';
import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import { getModelToken } from '@nestjs/sequelize';

describe('SNS - Publish', () => {
  let awsTestingModule: AwsTestingModule;
  let snsClient: SNSClient;
  let snsTopicModel: typeof SnsTopic;
  let snsTopicPublishHistoryModel: typeof SnsTopicPublishHistory;

  beforeEach(async () => {
    awsTestingModule = await new AwsTestingModule().start();

    snsClient = await awsTestingModule.createAwsClient(SNSClient);

    snsTopicModel = awsTestingModule.app.get<typeof SnsTopic>(getModelToken(SnsTopic));
    snsTopicPublishHistoryModel = awsTestingModule.app.get<typeof snsTopicPublishHistoryModel>(
      getModelToken(SnsTopicPublishHistory)
    );
  });

  afterEach(async () => {
    await awsTestingModule.stop();
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
      TopicArn: `arn:aws:sns:${awsTestingModule.configService.getOrThrow('AWS_REGION')}:${awsTestingModule.configService.getOrThrow('AWS_USER_ID')}:not-existing-topic`,
      Message: JSON.stringify({ one: 'two' }),
    });

    await expect(snsClient.send(command)).rejects.toThrow('Topic does not exist');
  });

  it('should publish message to the topic and add it to publish history db', async () => {
    const topicStub = await snsTopicModel.create(
      generateSnsTopicStub({
        region: awsTestingModule.configService.getOrThrow('AWS_REGION'),
        userId: awsTestingModule.configService.getOrThrow('AWS_USER_ID'),
      })
    );
    const messageStub = { name: 'Yngwie Malmsteen', genre: 'Neoclassical Metal' };

    const command = new PublishCommand({
      TopicArn: topicStub.arn,
      Message: JSON.stringify(messageStub),
    });

    const response = await snsClient.send(command);

    expect(response).toHaveProperty('MessageId');

    const topicPublishHistoryRecord = await snsTopicPublishHistoryModel.findOne({
      where: { messageId: response.MessageId },
    });

    expect(topicPublishHistoryRecord).toBeTruthy();
    expect(topicPublishHistoryRecord).toHaveProperty('message', JSON.stringify(messageStub));
  });
});
