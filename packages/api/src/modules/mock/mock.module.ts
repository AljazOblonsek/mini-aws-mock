import { Module } from '@nestjs/common';
import { MockController } from './mock.controller';
import { SnsMockModule } from '../sns/mock/sns.mock.module';
import { SqsMockModule } from '../sqs/mock/sqs.mock.module';

@Module({
  imports: [SnsMockModule, SqsMockModule],
  controllers: [MockController],
})
export class MockModule {}
