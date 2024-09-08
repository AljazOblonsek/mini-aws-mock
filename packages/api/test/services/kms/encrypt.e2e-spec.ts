import { MAX_PLAINTEXT_SIZE_IN_BYTES } from '@/src/modules/kms/constants/encryption.constants';
import { KmsKey } from '@/src/modules/kms/entities/kms-key.entity';
import { generateKmsKeyStub } from '@/src/modules/kms/stubs/kms-key.stub';
import { AwsTestingModule } from '@/test/utils/aws-testing-module';
import { EncryptCommand, KMSClient } from '@aws-sdk/client-kms';
import { faker } from '@faker-js/faker';
import { getModelToken } from '@nestjs/sequelize';

describe('KMS - Encrypt', () => {
  let awsTestingModule: AwsTestingModule;
  let kmsClient: KMSClient;
  let kmsKeyModel: typeof KmsKey;

  beforeEach(async () => {
    awsTestingModule = await new AwsTestingModule().start();

    kmsClient = await awsTestingModule.createAwsClient(KMSClient);

    kmsKeyModel = awsTestingModule.app.get<typeof KmsKey>(getModelToken(KmsKey));
  });

  afterEach(async () => {
    await awsTestingModule.stop();
  });

  it('should throw validation error if body parsing fails', async () => {
    const command = new EncryptCommand({ KeyId: undefined, Plaintext: undefined });

    await expect(kmsClient.send(command)).rejects.toThrow(
      'The input fails to satisfy the constraints specified by an AWS service.'
    );
  });

  it('should throw not found error if key is not found by id', async () => {
    const command = new EncryptCommand({
      KeyId: faker.string.uuid(),
      Plaintext: new TextEncoder().encode('random-data'),
    });

    await expect(kmsClient.send(command)).rejects.toThrow('Key does not exist');
  });

  it('should throw key disabled error if key is not enabled', async () => {
    const kmsKeyStub = await kmsKeyModel.create(
      generateKmsKeyStub({
        region: awsTestingModule.configService.getOrThrow('AWS_REGION'),
        userId: awsTestingModule.configService.getOrThrow('AWS_USER_ID'),
        enabled: false,
      })
    );

    const command = new EncryptCommand({
      KeyId: kmsKeyStub.id,
      Plaintext: new TextEncoder().encode('random-data'),
    });

    await expect(kmsClient.send(command)).rejects.toThrow('KMS Key is disabled');
  });

  it('should throw validation error if plaintext is too big', async () => {
    const kmsKeyStub = await kmsKeyModel.create(
      generateKmsKeyStub({
        region: awsTestingModule.configService.getOrThrow('AWS_REGION'),
        userId: awsTestingModule.configService.getOrThrow('AWS_USER_ID'),
      })
    );

    const command = new EncryptCommand({
      KeyId: kmsKeyStub.id,
      Plaintext: new TextEncoder().encode(
        faker.string.alphanumeric({ length: MAX_PLAINTEXT_SIZE_IN_BYTES + 1024 })
      ),
    });

    await expect(kmsClient.send(command)).rejects.toThrow('Plaintext is too big.');
  });

  it('should encrypt the plaintext and return ciphertext', async () => {
    const kmsKeyStub = await kmsKeyModel.create(
      generateKmsKeyStub({
        region: awsTestingModule.configService.getOrThrow('AWS_REGION'),
        userId: awsTestingModule.configService.getOrThrow('AWS_USER_ID'),
      })
    );

    const command = new EncryptCommand({
      KeyId: kmsKeyStub.id,
      Plaintext: new TextEncoder().encode(faker.string.alphanumeric({ length: 2048 })),
    });

    const response = await kmsClient.send(command);

    expect(response).toHaveProperty('CiphertextBlob');
    expect(response.CiphertextBlob).toBeInstanceOf(Uint8Array);
    expect(response).toHaveProperty('KeyId', kmsKeyStub.arn);
    expect(response).toHaveProperty('EncryptionAlgorithm', kmsKeyStub.keySpec);
  });
});
