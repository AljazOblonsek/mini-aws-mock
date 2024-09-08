import { WithoutModel } from '@/src/common/core';
import { KmsKey } from '../entities/kms-key.entity';
import { StubBaseOptions } from '@/src/common/mock';
import { faker } from '@faker-js/faker';
import { generateKeyArn } from '../utils/generate-key-arn';
import { randomBytes } from 'crypto';
import { KmsOrigin } from '../enums/kms-origin.enum';
import { KeySpec, KeyUsage } from '@mini-aws-mock/shared';

export const generateKmsKeyStub = (
  data: Partial<WithoutModel<KmsKey>> & Partial<StubBaseOptions> = {}
): WithoutModel<KmsKey> => {
  const keyId = faker.string.uuid();

  const defaultOptions: WithoutModel<KmsKey> & { id: string } = {
    id: keyId,
    arn: generateKeyArn({
      region: data.region || faker.location.country(),
      userId: data.userId || faker.number.int().toString(),
      keyId,
    }),
    alias: faker.word.words(1),
    encryptionKey: randomBytes(32).toString('hex'),
    description: faker.lorem.words(10),
    createdAt: faker.date.recent(),
    enabled: true,
    multiRegion: faker.datatype.boolean(),
    origin: faker.helpers.enumValue(KmsOrigin),
    keySpec: faker.helpers.enumValue(KeySpec),
    keyUsage: faker.helpers.enumValue(KeyUsage),
  };

  return { ...defaultOptions, ...data };
};
