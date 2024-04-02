import { Column, Model, Table } from 'sequelize-typescript';

@Table
export class SqsQueue extends Model {
  @Column({ unique: true })
  arn: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  url: string;

  @Column
  visibilityTimeout: number;

  @Column
  receiveMessageWaitTimeSeconds: number;

  @Column
  maximumMessageSize: number;
}
