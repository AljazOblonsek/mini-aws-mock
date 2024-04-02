import { Column, Model, Table } from 'sequelize-typescript';

@Table
export class SnsTopic extends Model {
  @Column({ unique: true })
  arn: string;

  @Column({ unique: true })
  name: string;
}
