import { KmsKey } from '@/src/modules/kms/entities/kms-key.entity';
import { generateKmsKeyStub } from '@/src/modules/kms/stubs/kms-key.stub';
import { AwsTestingModule } from '@/test/utils/aws-testing-module';
import { EncryptCommand, DecryptCommand, KMSClient } from '@aws-sdk/client-kms';
import { faker } from '@faker-js/faker';
import { getModelToken } from '@nestjs/sequelize';
import * as extractKeyIdFromCiphertextBlobModule from '@/src/modules/kms/utils/extract-key-id-from-ciphertext';
import { MAX_CIPHERTEXT_BLOB_SIZE_IN_BYTES } from '@/src/modules/kms/constants/encryption.constants';

describe('KMS - Decrypt', () => {
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
    const command = new DecryptCommand({ CiphertextBlob: undefined });

    await expect(kmsClient.send(command)).rejects.toThrow(
      'The input fails to satisfy the constraints specified by an AWS service.'
    );
  });

  it('should throw not found error if provided key is not found by id', async () => {
    const command = new DecryptCommand({
      KeyId: faker.string.uuid(),
      CiphertextBlob: new TextEncoder().encode(Buffer.from('random-data').toString('base64')),
    });

    await expect(kmsClient.send(command)).rejects.toThrow('Key does not exist');
  });

  it('should throw not found error if key taken from ciphertext blob is not found by id', async () => {
    const kmsKeyStub = await kmsKeyModel.create(
      generateKmsKeyStub({
        region: awsTestingModule.configService.getOrThrow('AWS_REGION'),
        userId: awsTestingModule.configService.getOrThrow('AWS_USER_ID'),
      })
    );

    const encryptCommand = new EncryptCommand({
      KeyId: kmsKeyStub.id,
      Plaintext: new TextEncoder().encode(faker.string.alphanumeric({ length: 2048 })),
    });
    const encryptResponse = await kmsClient.send(encryptCommand);

    // Delete the key that was used in encrypt call
    await kmsKeyStub.destroy();

    const decryptCommand = new DecryptCommand({
      CiphertextBlob: encryptResponse.CiphertextBlob,
    });

    await expect(kmsClient.send(decryptCommand)).rejects.toThrow('Key does not exist');
  });

  it('should throw access denied error if wrong key is used during decryption', async () => {
    const kmsKeyStub = await kmsKeyModel.create(
      generateKmsKeyStub({
        region: awsTestingModule.configService.getOrThrow('AWS_REGION'),
        userId: awsTestingModule.configService.getOrThrow('AWS_USER_ID'),
      })
    );
    const anotherKmsKeyStub = await kmsKeyModel.create(
      generateKmsKeyStub({
        region: awsTestingModule.configService.getOrThrow('AWS_REGION'),
        userId: awsTestingModule.configService.getOrThrow('AWS_USER_ID'),
      })
    );

    const encryptCommand = new EncryptCommand({
      KeyId: kmsKeyStub.id,
      Plaintext: new TextEncoder().encode(faker.string.alphanumeric({ length: 2048 })),
    });
    const encryptResponse = await kmsClient.send(encryptCommand);

    const decryptCommand = new DecryptCommand({
      KeyId: anotherKmsKeyStub.id,
      CiphertextBlob: encryptResponse.CiphertextBlob,
    });

    await expect(kmsClient.send(decryptCommand)).rejects.toThrow('Key access denied');
  });

  it('should throw key disabled error if key is not enabled', async () => {
    const kmsKeyStub = await kmsKeyModel.create(
      generateKmsKeyStub({
        region: awsTestingModule.configService.getOrThrow('AWS_REGION'),
        userId: awsTestingModule.configService.getOrThrow('AWS_USER_ID'),
      })
    );

    const encryptCommand = new EncryptCommand({
      KeyId: kmsKeyStub.id,
      Plaintext: new TextEncoder().encode(faker.string.alphanumeric({ length: 2048 })),
    });
    const encryptResponse = await kmsClient.send(encryptCommand);

    // Delete the previously used KMS key
    kmsKeyStub.enabled = false;
    await kmsKeyStub.save();

    const decryptCommand = new DecryptCommand({
      CiphertextBlob: encryptResponse.CiphertextBlob,
    });

    await expect(kmsClient.send(decryptCommand)).rejects.toThrow('KMS Key is disabled');
  });

  it('should throw validation error if ciphertext is too big', async () => {
    const kmsKeyStub = await kmsKeyModel.create(
      generateKmsKeyStub({
        region: awsTestingModule.configService.getOrThrow('AWS_REGION'),
        userId: awsTestingModule.configService.getOrThrow('AWS_USER_ID'),
      })
    );

    jest
      .spyOn(extractKeyIdFromCiphertextBlobModule, 'extractKeyIdFromCiphertextBlob')
      .mockReturnValueOnce(kmsKeyStub.id);

    const decryptCommand = new DecryptCommand({
      KeyId: kmsKeyStub.id,
      CiphertextBlob: new TextEncoder().encode(
        Buffer.from(
          faker.string.alphanumeric({ length: MAX_CIPHERTEXT_BLOB_SIZE_IN_BYTES + 1024 })
        ).toString('base64')
      ),
    });

    await expect(kmsClient.send(decryptCommand)).rejects.toThrow('Ciphertext is too big.');
  });

  it('should decrypt the ciphertext and return plaintext', async () => {
    const textToEncryptStub = 'Hello, World!';
    const kmsKeyStub = await kmsKeyModel.create(
      generateKmsKeyStub({
        region: awsTestingModule.configService.getOrThrow('AWS_REGION'),
        userId: awsTestingModule.configService.getOrThrow('AWS_USER_ID'),
      })
    );

    const encryptCommand = new EncryptCommand({
      KeyId: kmsKeyStub.id,
      Plaintext: new TextEncoder().encode(textToEncryptStub),
    });
    const encryptResponse = await kmsClient.send(encryptCommand);

    const decryptCommand = new DecryptCommand({
      CiphertextBlob: encryptResponse.CiphertextBlob,
    });
    const decryptReponse = await kmsClient.send(decryptCommand);

    expect(decryptReponse).toHaveProperty('Plaintext');
    expect(decryptReponse.Plaintext).toBeInstanceOf(Uint8Array);
    expect(decryptReponse).toHaveProperty('KeyId', kmsKeyStub.arn);
    expect(decryptReponse).toHaveProperty('EncryptionAlgorithm', kmsKeyStub.keySpec);
    expect(new TextDecoder().decode(decryptReponse.Plaintext)).toBe(textToEncryptStub);
  });
});
