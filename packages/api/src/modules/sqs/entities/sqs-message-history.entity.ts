import { Column, Model, Table } from 'sequelize-typescript';

@Table
export class SqsMessageHistory extends Model {
  @Column({ unique: true })
  messageId: string;

  @Column
  messageBody: string;

  @Column
  md5OfMessageBody: string;

  @Column
  delaySeconds?: number;

  @Column
  visibilityTimeout: number;

  @Column
  messageAttributes?: string;

  @Column
  md5OfMessageAttributes?: string;

  @Column
  queueUrl: string;

  @Column
  receiptHandle?: string;

  @Column
  receiptHandleSentAt?: Date;

  @Column
  createdAt: Date;

  @Column
  deletedAt: Date;
}
