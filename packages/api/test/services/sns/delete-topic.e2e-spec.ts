import { SnsTopic } from '@/src/modules/sns/entities/sns-topic.entity';
import { generateSnsTopicStub } from '@/src/modules/sns/mock/stubs/sns-topic.stub';
import { AwsTestingModule } from '@/test/utils/aws-testing-module';
import { DeleteTopicCommand, SNSClient } from '@aws-sdk/client-sns';
import { getModelToken } from '@nestjs/sequelize';

describe('SNS - DeleteTopic', () => {
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

  it('should throw validation error if body parsing fails', async () => {
    const command = new DeleteTopicCommand({ TopicArn: undefined });

    await expect(snsClient.send(command)).rejects.toThrow(
      'The input fails to satisfy the constraints specified by an AWS service.'
    );
  });

  it('should throw not found error if topic is not found by arn', async () => {
    const command = new DeleteTopicCommand({
      TopicArn: `arn:aws:sns:${awsTestingModule.configService.getOrThrow('AWS_REGION')}:${awsTestingModule.configService.getOrThrow('AWS_USER_ID')}:not-existing-topic`,
    });

    await expect(snsClient.send(command)).rejects.toThrow('Topic does not exist');
  });

  it('should delete the topic', async () => {
    const snsTopicStub = await snsTopicModel.create(generateSnsTopicStub({ name: 'new-songs' }));

    const command = new DeleteTopicCommand({
      TopicArn: snsTopicStub.arn,
    });

    await expect(snsClient.send(command)).resolves.not.toThrow();

    expect(await snsTopicModel.findAll()).toHaveLength(0);
  });
});
