import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { KmsOrigin } from '../enums/kms-origin.enum';
import { KeySpec, KeyUsage } from '@mini-aws-mock/shared';

@Table
export class KmsKey extends Model {
  @Column({ primaryKey: true })
  id: string;

  @Column({ unique: true })
  arn: string;

  @Column({ unique: true })
  alias: string;

  /**
   * Represents 256-bit encryption key as hex string.
   */
  @Column
  encryptionKey: string;

  @Column
  description?: string;

  @Column
  createdAt: Date;

  @Column
  enabled: boolean;

  @Column
  multiRegion: boolean;

  @Column({ type: DataType.ENUM(...Object.values(KmsOrigin)) })
  origin: KmsOrigin;

  @Column({ type: DataType.ENUM(...Object.values(KeySpec)) })
  keySpec: KeySpec;

  @Column({ type: DataType.ENUM(...Object.values(KeyUsage)) })
  keyUsage: KeyUsage;
}
