import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';
import { KmsKey } from '../entities/kms-key.entity';
import { KeySpec, KeyUsage, KmsKeyCreateRequestDto, KmsKeyDto } from '@mini-aws-mock/shared';
import { randomUUID } from 'crypto';
import { generateKeyArn } from '../utils/generate-key-arn';
import { KmsOrigin } from '../enums/kms-origin.enum';

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
      description: dto.description,
      createAt: new Date(),
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
}
