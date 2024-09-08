import { Table, Model, Column, ForeignKey, BelongsTo, DataType } from 'sequelize-typescript';
import { KmsKey } from './kms-key.entity';
import { EncryptionAction, EncryptionKind } from '@mini-aws-mock/shared';

/**
 * Logs history of KMS Keys usage - for easier debugging in UI.
 */
@Table
export class KmsEncryptionHistory extends Model {
  @Column({ type: DataType.ENUM(...Object.values(EncryptionAction)) })
  encryptionAction: EncryptionAction;

  @Column({ type: DataType.ENUM(...Object.values(EncryptionKind)) })
  encryptionKind: EncryptionKind;

  /**
   * Holds base64 content of what was provided when calling the API / AWS SDK.
   */
  @Column
  input: string;

  /**
   * Holds base64 content of what was returned from the API / AWS SDK.
   */
  @Column
  output: string;

  @Column
  createdAt: Date;

  @ForeignKey(() => KmsKey)
  @Column
  keyId: string;

  @BelongsTo(() => KmsKey)
  kmsKey: KmsKey;
}
