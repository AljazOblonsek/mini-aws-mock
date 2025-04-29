import { SchedulerSchedule } from '@/src/modules/scheduler/entities/scheduler-schedule.entity';
import { AwsTestingModule } from '@/test/utils/aws-testing-module';
import {
  SchedulerClient,
  CreateScheduleCommand,
  ListSchedulesCommand,
} from '@aws-sdk/client-scheduler';
import { getModelToken } from '@nestjs/sequelize';

describe('Scheduler - CreateSchedule', () => {
  let awsTestingModule: AwsTestingModule;
  let schedulerClient: SchedulerClient;
  let schedulerScheduleModel: typeof SchedulerSchedule;

  beforeEach(async () => {
    awsTestingModule = await new AwsTestingModule().start();

    schedulerClient = await awsTestingModule.createAwsClient(SchedulerClient);

    schedulerScheduleModel = awsTestingModule.app.get<typeof SchedulerSchedule>(
      getModelToken(SchedulerSchedule)
    );
  });

  afterEach(async () => {
    await awsTestingModule.stop();
  });

  it('should run', async () => {
    const command = new CreateScheduleCommand({
      Name: 'TestScheduleName',
      ScheduleExpression: 'rate(5 minutes)',
      Target: {
        Arn: 'some-arn',
        RoleArn: 'some-role',
      },
      FlexibleTimeWindow: {
        Mode: 'OFF',
      },
    });

    const c2 = new ListSchedulesCommand({ MaxResults: 2, NamePrefix: 'np' });

    const response = await schedulerClient.send(command);

    expect(true).toBeTruthy();
  });
});
