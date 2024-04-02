import { Column, Model, Table } from 'sequelize-typescript';

@Table
export class SnsTopicPublishHistory extends Model {
  @Column({ unique: true })
  messageId: string;

  @Column
  createdAt: Date;

  @Column
  message?: string;

  @Column
  messageAttributes?: string;

  @Column
  messageDeduplicationId?: string;

  @Column
  messageGroupId?: string;

  @Column
  messageStructure?: string;

  @Column
  phoneNumber?: string;

  @Column
  subject?: string;

  @Column
  targetArn?: string;

  @Column
  topicArn?: string;
}
