import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { MockModule } from './modules/mock/mock.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConditionalModule, ConfigModule, ConfigService } from '@nestjs/config';
import { validateEnvironmentVariables } from './config/environment/validate-environment-variables';
import { ScheduleModule } from '@nestjs/schedule';
import { SnsApiModule } from './modules/sns/api/sns.api.module';
import { SqsApiModule } from './modules/sqs/api/sqs.api.module';
import { SseModule } from './common/core';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        pinoHttp: {
          level: configService.getOrThrow('LOG_LEVEL'),
          autoLogging: false,
          quietReqLogger: true,
          transport: {
            target: 'pino-pretty',
            options: {
              singleLine: true,
            },
          },
        },
      }),
    }),
    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: 'sqlite',
        storage: configService.getOrThrow('DATABASE_PATH'),
        autoLoadModels: true,
        synchronize: true,
        logging: configService.getOrThrow('LOG_LEVEL') === 'trace',
      }),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
      validate: validateEnvironmentVariables,
    }),
    EventEmitterModule.forRoot(),
    MockModule,
    ConditionalModule.registerWhen(ScheduleModule.forRoot(), (env) => env.NODE_ENV !== 'test'),
    SnsApiModule,
    SqsApiModule,
    SseModule,
  ],
})
export class AppModule {}
