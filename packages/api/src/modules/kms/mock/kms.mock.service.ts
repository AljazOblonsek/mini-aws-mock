import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { KmsKey } from '../entities/kms-key.entity';
import { AwsActionOptions, ValidationErrorException } from '@/src/common/mock';
import { plainToInstance } from 'class-transformer';
import { EncryptRequestDto } from './dtos/encrypt-request.dto';
import { validate } from 'class-validator';
import {
  MAX_CIPHERTEXT_BLOB_SIZE_IN_BYTES,
  MAX_PLAINTEXT_SIZE_IN_BYTES,
} from '../constants/encryption.constants';
import { KeyNotFoundException } from './exceptions/key-not-found.exception';
import { KmsKeyDisabledException } from './exceptions/kms-key-disabled.exception';
import { encrypt } from '../utils/encrypt';
import { getEncryptJsonResponse } from './responses/get-encrypt-response';
import { DecryptRequestDto } from './dtos/decrypt-request.dto';
import { extractKeyIdFromCiphertextBlob } from '../utils/extract-key-id-from-ciphertext';
import { KeyAccessDeniedException } from './exceptions/key-access-denied.exception';
import { decrypt } from '../utils/decrypt';
import { getDecryptJsonResponse } from './responses/get-decrypt-response';
import { KmsEncryptionHistory } from '../entities/kms-encryption-history.entity';
import { EncryptionAction, EncryptionKind } from '@mini-aws-mock/shared';

@Injectable()
export class KmsMockService {
  private readonly logger: Logger;

  constructor(
    @InjectModel(KmsKey) private readonly kmsKeyModel: typeof KmsKey,
    @InjectModel(KmsEncryptionHistory)
    private readonly kmsEncryptionHistoryModel: typeof KmsEncryptionHistory
  ) {
    this.logger = new Logger(this.constructor.name);
  }

  getActionsMap(): Record<string, (options: AwsActionOptions) => Promise<any>> {
    return {
      Encrypt: this.encrypt.bind(this),
      Decrypt: this.decrypt.bind(this),
    };
  }

  private async encrypt({ body }: AwsActionOptions): Promise<any> {
    const dto = plainToInstance(EncryptRequestDto, body);
    const validationResult = await validate(dto);

    if (validationResult.length > 0) {
      throw new ValidationErrorException();
    }

    const key = await this.kmsKeyModel.findOne({ where: { id: dto.KeyId } });

    if (!key) {
      throw new KeyNotFoundException();
    }

    if (!key.enabled) {
      throw new KmsKeyDisabledException();
    }

    const plaintextBlob = Buffer.from(dto.Plaintext, 'base64');

    if (plaintextBlob.length > MAX_PLAINTEXT_SIZE_IN_BYTES) {
      throw new ValidationErrorException('Plaintext is too big.');
    }

    const encrypted = encrypt({
      keyId: key.id,
      encryptionKey: key.encryptionKey,
      plaintextBlob,
    });

    await this.kmsEncryptionHistoryModel.create({
      encryptionAction: EncryptionAction.Encrypt,
      encryptionKind: EncryptionKind.AwsSdk,
      input: dto.Plaintext,
      output: encrypted.toString('base64'),
      createdAt: new Date(),
      keyId: key.id,
    });

    this.logger.log('[KMS] 200 - Encrypt.');

    return getEncryptJsonResponse({
      ciphertextBlob: encrypted.toString('base64'),
      keyId: key.arn,
      encryptionAlgorithm: key.keySpec,
    });
  }

  private async decrypt({ body }: AwsActionOptions): Promise<any> {
    const dto = plainToInstance(DecryptRequestDto, body);
    const validationResult = await validate(dto);

    if (validationResult.length > 0) {
      throw new ValidationErrorException();
    }

    const ciphertextBlob = Buffer.from(dto.CiphertextBlob, 'base64');

    const keyId = extractKeyIdFromCiphertextBlob({ ciphertextBlob });

    const key = await this.kmsKeyModel.findOne({ where: { id: dto.KeyId || keyId } });

    if (!key) {
      throw new KeyNotFoundException();
    }

    if (key.id !== keyId) {
      throw new KeyAccessDeniedException();
    }

    if (!key.enabled) {
      throw new KmsKeyDisabledException();
    }

    if (ciphertextBlob.length > MAX_CIPHERTEXT_BLOB_SIZE_IN_BYTES) {
      throw new ValidationErrorException('Ciphertext is too big.');
    }

    const decrypted = decrypt({
      ciphertextBlob,
      encryptionKey: key.encryptionKey,
    });

    await this.kmsEncryptionHistoryModel.create({
      encryptionAction: EncryptionAction.Decrypt,
      encryptionKind: EncryptionKind.AwsSdk,
      input: dto.CiphertextBlob,
      output: decrypted.toString('base64'),
      createdAt: new Date(),
      keyId: key.id,
    });

    this.logger.log('[KMS] 200 - Decrypt.');

    return getDecryptJsonResponse({
      plaintext: decrypted.toString('base64'),
      keyId: key.arn,
      encryptionAlgorithm: key.keySpec,
    });
  }
}
