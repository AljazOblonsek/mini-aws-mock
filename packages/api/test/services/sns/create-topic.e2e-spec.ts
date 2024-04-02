import { SnsTopic } from '@/src/modules/sns/entities/sns-topic.entity';
import { generateSnsTopicStub } from '@/src/modules/sns/mock/stubs/sns-topic.stub';
import { AwsTestingModule } from '@/test/utils/aws-testing-module';
import { CreateTopicCommand, SNSClient } from '@aws-sdk/client-sns';
import { getModelToken } from '@nestjs/sequelize';

describe('SNS - CreateTopic', () => {
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
    const command = new CreateTopicCommand({ Name: undefined });

    await expect(snsClient.send(command)).rejects.toThrow(
      'The input fails to satisfy the constraints specified by an AWS service.'
    );
  });

  it('should return existing topic if topic with same name already exists', async () => {
    const snsTopicStub = await snsTopicModel.create(generateSnsTopicStub({ name: 'new-songs' }));

    const command = new CreateTopicCommand({ Name: snsTopicStub.name });

    const response = await snsClient.send(command);

    expect(response.TopicArn).toBeTruthy();
    expect(response.TopicArn).toBe(snsTopicStub.arn);

    expect(await snsTopicModel.findAll()).toHaveLength(1);
  });

  it('should create a new topic and returns its arn', async () => {
    const topicNameStub = 'new-songs';

    const command = new CreateTopicCommand({ Name: topicNameStub });

    const response = await snsClient.send(command);

    expect(response.TopicArn).toBeTruthy();
    expect(response.TopicArn).toBe(
      `arn:aws:sns:${awsTestingModule.configService.getOrThrow('AWS_REGION')}:${awsTestingModule.configService.getOrThrow('AWS_USER_ID')}:${topicNameStub}`
    );

    expect(await snsTopicModel.findAll()).toHaveLength(1);
  });
});
