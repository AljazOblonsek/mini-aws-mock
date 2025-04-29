import { Module } from '@nestjs/common';
import { MockController } from './mock.controller';
import { SnsMockModule } from '../sns/mock/sns.mock.module';
import { SqsMockModule } from '../sqs/mock/sqs.mock.module';
import { KmsMockModule } from '../kms/mock/kms.mock.module';
import { SchedulerMockModule } from '../scheduler/mock/scheduler.mock.module';

/**
 * Entrypoint module for the AWS SDKs or CLI - it supports the following protocols:
 * - AWS Query Protocol - https://smithy.io/2.0/aws/protocols/aws-query-protocol.html
 * - AWS JSON Protocols (v1.0, v1.1) - https://smithy.io/2.0/aws/protocols/aws-json-1_0-protocol.html
 * - AWS Rest JSON Protocol (v1 - which is used in newer services such as EventBridge Scheduler) - https://smithy.io/2.0/aws/protocols/aws-restjson1-protocol.html
 *
 * Entry paths based on protocols
 * - Services that use AWS Query and JSON Protocols have entrypoint in the MockController (default entrypoint of `/`)
 * - Services that use Rest JSON Protocol have their own entrypoints (e.g. `SchedulerMockModule` has its own controller to support different paths)
 */
@Module({
  imports: [SnsMockModule, SqsMockModule, KmsMockModule, SchedulerMockModule],
  controllers: [MockController],
})
export class MockModule {}
