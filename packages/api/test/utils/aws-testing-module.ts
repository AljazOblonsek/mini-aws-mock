import { AppModule } from '@/src/app.module';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { json } from 'express';
import { Client } from '@smithy/smithy-client';

type ClientAny = Client<any, any, any, any>;

type Newable<T> = { new (...args: any[]): T };

export class AwsTestingModule {
  public app: INestApplication;
  public configService: ConfigService;
  private awsClients: ClientAny[];

  async start(): Promise<this> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    this.app = moduleFixture.createNestApplication({
      bufferLogs: true,
      rawBody: true,
      logger: false,
    });
    this.app.use(json({ type: ['application/x-amz-json-1.0', 'application/x-amz-json-1.1'] }));

    await this.app.init();

    this.configService = this.app.get<ConfigService>(ConfigService);
    this.awsClients = [];

    await this.app.listen(
      this.configService.getOrThrow('PORT') + Number(process.env.JEST_WORKER_ID),
      '0.0.0.0'
    );
    return this;
  }

  async stop(): Promise<void> {
    if (this.awsClients.length > 0) {
      for (const awsClient of this.awsClients) {
        awsClient.destroy();
      }
    }

    await this.app.close();
  }

  async createAwsClient<T>(clientConstructor: Newable<ClientAny>): Promise<T> {
    const awsClient = new clientConstructor({
      endpoint: `http://127.0.0.1:${this.configService.getOrThrow('PORT') + Number(process.env.JEST_WORKER_ID)}`,
      region: this.configService.getOrThrow('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.getOrThrow('AWS_ACCESS_KEY'),
        secretAccessKey: this.configService.getOrThrow('AWS_SECRET_KEY'),
      },
      maxAttempts: 0,
    });

    this.awsClients.push(awsClient);

    return awsClient as T;
  }
}
