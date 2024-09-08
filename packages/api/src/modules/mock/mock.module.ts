import { Module } from '@nestjs/common';
import { MockController } from './mock.controller';
import { SnsMockModule } from '../sns/mock/sns.mock.module';
import { SqsMockModule } from '../sqs/mock/sqs.mock.module';
import { KmsMockModule } from '../kms/mock/kms.mock.module';

@Module({
  imports: [SnsMockModule, SqsMockModule, KmsMockModule],
  controllers: [MockController],
})
export class MockModule {}
