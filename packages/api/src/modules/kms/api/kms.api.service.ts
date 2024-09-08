import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';
import { KmsKey } from '../entities/kms-key.entity';
import {
  KeySpec,
  KeyUsage,
  KmsDecryptRequestDto,
  KmsDecryptResponseDto,
  KmsEncryptRequestDto,
  KmsEncryptResponseDto,
  KmsKeyCreateRequestDto,
  KmsKeyDto,
} from '@mini-aws-mock/shared';
import { randomBytes, randomUUID } from 'crypto';
import { generateKeyArn } from '../utils/generate-key-arn';
import { KmsOrigin } from '../enums/kms-origin.enum';
import { encrypt } from '../utils/encrypt';
import { extractKeyIdFromCiphertextBlob } from '../utils/extract-key-id-from-ciphertext';
import { decrypt } from '../utils/decrypt';

@Injectable()
export class KmsApiService {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(KmsKey) private readonly kmsKeyModel: typeof KmsKey
  ) {}

  async getKeys(): Promise<KmsKeyDto[]> {
    const keys = await this.kmsKeyModel.findAll();

    const keyDtos: KmsKeyDto[] = [];

    for (const key of keys) {
      keyDtos.push({
        id: key.id,
        arn: key.arn,
        alias: key.alias,
        description: key.description,
        createdAt: key.createdAt,
        keySpec: key.keySpec,
        keyUsage: key.keyUsage,
      });
    }

    return keyDtos;
  }

  async createKey(dto: KmsKeyCreateRequestDto): Promise<KmsKeyDto> {
    const existingKey = await this.kmsKeyModel.findOne({ where: { alias: dto.alias } });

    if (existingKey) {
      throw new BadRequestException('Key with same alias already exists.');
    }

    const newKeyId = randomUUID();

    const newKey = await this.kmsKeyModel.create({
      id: newKeyId,
      arn: generateKeyArn({
        region: this.configService.getOrThrow('AWS_REGION'),
        userId: this.configService.getOrThrow('AWS_USER_ID'),
        keyId: newKeyId,
      }),
      alias: dto.alias,
      encryptionKey: randomBytes(32).toString('hex'),
      description: dto.description,
      createAt: new Date(),
      enabled: true,
      multiRegion: false,
      origin: KmsOrigin.AwsKms,
      keySpec: KeySpec.SymmetricDefault,
      keyUsage: KeyUsage.EncryptDecrypt,
    });

    return {
      id: newKey.id,
      arn: newKey.arn,
      alias: newKey.alias,
      description: newKey.description,
      createdAt: newKey.createdAt,
      keySpec: newKey.keySpec,
      keyUsage: newKey.keyUsage,
    };
  }

  async deleteKey(id: string): Promise<void> {
    const existingKey = await this.kmsKeyModel.findOne({ where: { id } });

    if (!existingKey) {
      throw new NotFoundException('Key not found.');
    }

    await existingKey.destroy();
  }

  async encrypt(dto: KmsEncryptRequestDto): Promise<KmsEncryptResponseDto> {
    const key = await this.getKeyById(dto.keyId);

    const encrypted = encrypt({
      keyId: dto.keyId,
      encryptionKey: key.encryptionKey,
      plaintextBlob: Buffer.from(dto.content),
    });

    return {
      content: encrypted.toString('base64'),
    };
  }

  async decrypt(dto: KmsDecryptRequestDto): Promise<KmsDecryptResponseDto> {
    const ciphertextBlob = Buffer.from(dto.content, 'base64');
    const keyId = extractKeyIdFromCiphertextBlob({ ciphertextBlob });

    const key = await this.getKeyById(keyId);

    const decrypted = decrypt({ ciphertextBlob, encryptionKey: key.encryptionKey });

    return {
      content: decrypted.toString(),
    };
  }

  private async getKeyById(id: string): Promise<KmsKey> {
    const key = await this.kmsKeyModel.findOne({ where: { id } });

    if (!key) {
      throw new NotFoundException('Key not found.');
    }

    return key;
  }
}
