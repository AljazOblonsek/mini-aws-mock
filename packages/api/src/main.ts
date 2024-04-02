require('module-alias/register');
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/src/app.module';
import { json } from 'express';
import { INestApplication, ValidationPipe, Logger as NestLogger } from '@nestjs/common';
import { Logger as PinoLogger } from 'nestjs-pino';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SnsTopic } from './modules/sns/entities/sns-topic.entity';
import { ConfigService } from '@nestjs/config';
import { Model } from 'sequelize-typescript';
import { readFile, readdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { SqsQueue } from './modules/sqs/entities/sqs-queue.entity';

const initSwagger = (app: INestApplication): void => {
  const config = new DocumentBuilder()
    .setTitle('Mini AWS Mock')
    .setDescription('Mini AWS Mock API')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('/swagger/docs', app, document);
};

const initValidation = (app: INestApplication): void => {
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
};

const seedDb = async (app: INestApplication): Promise<void> => {
  const INITIAL_DATA_PATH = './initial-data';
  const FILE_TO_ENTITY_MAP: Record<string, typeof Model> = {
    'sns-topic.json': SnsTopic,
    'sqs-queue.json': SqsQueue,
  };

  const configService = app.get(ConfigService);

  if (configService.getOrThrow('NODE_ENV') === 'test') {
    return;
  }

  if (!existsSync(INITIAL_DATA_PATH)) {
    return;
  }

  const logger = new NestLogger('SeedDb');

  logger.log('Running db seed script.');

  const fileNames = await readdir(INITIAL_DATA_PATH);

  for (const fileName of fileNames) {
    const entity = FILE_TO_ENTITY_MAP[fileName];

    if (!entity) {
      continue;
    }

    // @ts-expect-error We can actually use the entity methods here
    const records = await entity.findAll();

    if (records.length > 0) {
      continue;
    }

    // @ts-expect-error We can actually use the entity methods here
    await entity.bulkCreate(JSON.parse(await readFile(join(INITIAL_DATA_PATH, fileName))));
    logger.log(`Seeding from ${fileName}.`);
  }
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true, rawBody: true });

  app.useLogger(app.get(PinoLogger));
  app.use(
    json({ type: ['application/x-amz-json-1.0', 'application/x-amz-json-1.1', 'application/json'] })
  );
  initSwagger(app);
  initValidation(app);
  await seedDb(app);
  app.enableCors({ origin: '*' });

  await app.listen(8000);
}

bootstrap();
