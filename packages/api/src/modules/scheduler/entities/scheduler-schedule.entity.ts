import { FlexibleTimeWindowMode } from '@mini-aws-mock/shared';
import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table
export class SchedulerSchedule extends Model {
  @Column({ unique: true })
  arn: string;

  @Column({ unique: true })
  name: string;

  @Column
  scheduleExpression: string; // TODO: Validate at() or rate() or cron()

  @Column({ type: DataType.ENUM(...Object.values(FlexibleTimeWindowMode)) })
  flexibleTimeWindowMode: FlexibleTimeWindowMode; // TODO: For now allow only OFF

  @Column
  targetArn: string;

  @Column
  roleArn: string;

  @Column
  input: string;
}
